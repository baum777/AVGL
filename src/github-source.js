import { MAX_FILE_BYTES } from './constants.js';
import { discoverFiles, isSensitivePath, isTextCandidate, sourceKindForPath } from './discover.js';
import { classifyDiscoveries } from './classify.js';
import { bindAvglIr } from './bind.js';
import { fetchCompleteGitHubTree, githubHeaders, parseGitHubRepository } from './github-tree.js';
import { extractRelationFacts, resolveRelations, traceEffectChains } from './relations.js';

const DEFAULT_MAX_FILES = 120;
const DEFAULT_CONCURRENCY = 10;
const DEFAULT_BATCH_SIZE = 48;
const SOURCE_QUOTA = Object.freeze({
  implementation: 0.65,
  config: 0.15,
  test: 0.1,
  documentation: 0.1
});
const SOURCE_ORDER = ['implementation', 'config', 'test', 'documentation', 'other'];

export { parseGitHubRepository };

async function mapConcurrent(items, limit, worker) {
  const output = new Array(items.length);
  let cursor = 0;

  async function run() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      output[index] = await worker(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(Math.max(1, limit), items.length || 1) }, () => run()));
  return output;
}

function chunks(items, size) {
  const output = [];
  for (let index = 0; index < items.length; index += size) output.push(items.slice(index, index + size));
  return output;
}

function sourceOrder(file) {
  const index = SOURCE_ORDER.indexOf(file.sourceKind);
  return index < 0 ? SOURCE_ORDER.length : index;
}

export function selectGitHubCandidates(eligible, maxFiles) {
  if (eligible.length <= maxFiles) return [...eligible];

  const buckets = new Map(SOURCE_ORDER.map((kind) => [kind, []]));
  for (const file of eligible) {
    const kind = file.sourceKind ?? sourceKindForPath(file.path);
    (buckets.get(kind) ?? buckets.get('other')).push({ ...file, sourceKind: kind });
  }
  for (const bucket of buckets.values()) bucket.sort((a, b) => a.path.localeCompare(b.path));

  const selected = [];
  const selectedPaths = new Set();
  for (const kind of ['implementation', 'config', 'test', 'documentation']) {
    const quota = Math.floor(maxFiles * SOURCE_QUOTA[kind]);
    for (const file of buckets.get(kind).slice(0, quota)) {
      selected.push(file);
      selectedPaths.add(file.path);
    }
  }

  const remainder = eligible
    .map((file) => ({ ...file, sourceKind: file.sourceKind ?? sourceKindForPath(file.path) }))
    .filter((file) => !selectedPaths.has(file.path))
    .sort((a, b) => sourceOrder(a) - sourceOrder(b) || a.path.localeCompare(b.path));

  for (const file of remainder) {
    if (selected.length >= maxFiles) break;
    selected.push(file);
  }
  return selected;
}

function fullScanCandidates(eligible) {
  return [...eligible].sort((a, b) => sourceOrder(a) - sourceOrder(b) || a.path.localeCompare(b.path));
}

function emptyCoverage() {
  return { implementation: 0, config: 0, test: 0, documentation: 0, other: 0 };
}

function mergeCoverage(target, source) {
  for (const key of Object.keys(target)) target[key] += source?.[key] ?? 0;
}

async function fetchCandidateContent(tree, file, options) {
  try {
    const response = await options.fetchImpl(
      tree.apiBase + '/git/blobs/' + encodeURIComponent(file.sha),
      { headers: githubHeaders(options.token) }
    );
    if (!response.ok) return { file, error: `HTTP ${response.status}` };
    const payload = await response.json();
    if (payload.encoding !== 'base64' || typeof payload.content !== 'string') {
      return { file, error: 'unsupported blob encoding' };
    }
    const content = Buffer.from(payload.content.replace(/\n/g, ''), 'base64').toString('utf8');
    return { file: { ...file, content }, error: null };
  } catch (error) {
    return { file, error: error?.message || 'fetch failed' };
  }
}

export async function discoverGitHubRepository(input, options = {}) {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  if (typeof fetchImpl !== 'function') throw new Error('No fetch implementation is available.');

  const scanStrategy = options.scanStrategy === 'full' ? 'full' : 'bounded';
  const maxFiles = options.maxFiles ?? DEFAULT_MAX_FILES;
  const maxFileBytes = options.maxFileBytes ?? MAX_FILE_BYTES;
  const concurrency = options.concurrency ?? DEFAULT_CONCURRENCY;
  const batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE;

  const tree = await fetchCompleteGitHubTree(input, {
    fetchImpl,
    token: options.token,
    ref: options.ref,
    treeConcurrency: options.treeConcurrency
  });

  const blobs = tree.entries
    .filter((entry) => entry.type === 'blob' && typeof entry.path === 'string')
    .map((entry) => ({
      path: entry.path,
      size: entry.size ?? 0,
      sha: entry.sha,
      sourceKind: sourceKindForPath(entry.path)
    }));

  const sensitive = blobs.filter((file) => isSensitivePath(file.path));
  const textCandidates = blobs.filter((file) => !isSensitivePath(file.path) && isTextCandidate(file.path));
  const oversize = textCandidates.filter((file) => file.size > maxFileBytes);
  const eligible = textCandidates.filter((file) => file.size <= maxFileBytes);
  const unsupportedCount = Math.max(0, blobs.length - sensitive.length - textCandidates.length);

  const candidates = scanStrategy === 'full'
    ? fullScanCandidates(eligible)
    : selectGitHubCandidates(eligible, maxFiles);

  const observations = [];
  const sourceCoverage = emptyCoverage();
  const contentFetchFailures = [];
  const relationFacts = [];
  let filesScanned = 0;
  let bytesScanned = 0;

  for (const batch of chunks(candidates, batchSize)) {
    const fetched = await mapConcurrent(batch, concurrency, (file) => fetchCandidateContent(tree, file, {
      fetchImpl,
      token: options.token
    }));

    const loaded = [];
    for (const result of fetched) {
      if (result.error) {
        contentFetchFailures.push(result.file.path);
        continue;
      }
      loaded.push(result.file);
      bytesScanned += result.file.size ?? Buffer.byteLength(result.file.content ?? '', 'utf8');
    }

    if (loaded.length === 0) continue;

    const batchDiscovery = discoverFiles(loaded, {
      kind: 'repository',
      label: tree.parsed.slug
    }, {
      maxFileBytes,
      filesSeen: loaded.length,
      filesEligible: loaded.length,
      scanComplete: true,
      analysisMode: 'github-batch'
    });

    filesScanned += batchDiscovery.filesScanned;
    observations.push(...batchDiscovery.observations);
    relationFacts.push(...loaded.map(extractRelationFacts));
    mergeCoverage(sourceCoverage, batchDiscovery.sourceCoverage);
  }

  const resolvedRelations = resolveRelations(relationFacts, blobs.map((file) => file.path));
  const effectChains = traceEffectChains(resolvedRelations);

  const selectedAllEligible = candidates.length === eligible.length;
  const scanComplete = Boolean(tree.treeComplete) && selectedAllEligible && contentFetchFailures.length === 0;
  const analysisMode = scanStrategy === 'full'
    ? (scanComplete ? 'github-static-full' : 'github-static-full-incomplete')
    : (scanComplete ? 'github-static-baseline' : 'github-static-baseline-partial');

  return {
    source: { kind: 'repository', label: tree.parsed.slug, revision: tree.ref, private: Boolean(tree.repository.private) },
    generatedAt: new Date().toISOString(),
    filesSeen: blobs.length,
    filesEligible: eligible.length,
    filesSelected: candidates.length,
    filesScanned,
    bytesScanned,
    scanComplete,
    scanStrategy,
    treeComplete: Boolean(tree.treeComplete),
    treeFallbackUsed: Boolean(tree.treeFallbackUsed),
    unsupportedFileCount: unsupportedCount,
    sourceCoverage,
    skippedSensitive: sensitive.map((file) => file.path),
    skippedOversize: oversize.map((file) => file.path),
    contentFetchFailures,
    analysisMode,
    observations,
    relations: resolvedRelations.relations,
    effects: resolvedRelations.effects,
    effectChains
  };
}

export async function analyzeGitHubRepository(input, options = {}) {
  const discovery = await discoverGitHubRepository(input, options);
  return bindAvglIr(discovery, classifyDiscoveries(discovery));
}
