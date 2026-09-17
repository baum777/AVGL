import { MAX_FILE_BYTES } from './constants.js';
import { discoverFiles, isSensitivePath, isTextCandidate } from './discover.js';
import { classifyDiscoveries } from './classify.js';
import { bindAvglIr } from './bind.js';

const DEFAULT_MAX_FILES = 120;
const DEFAULT_CONCURRENCY = 6;

function validPart(value) {
  return /^[A-Za-z0-9_.-]+$/.test(value) && value !== '.' && value !== '..';
}

export function parseGitHubRepository(input) {
  const value = String(input ?? '').trim();
  if (!value) throw new Error('A GitHub repository is required.');

  let owner;
  let repo;

  if (/^https?:\/\//i.test(value)) {
    const url = new URL(value);
    if (!['github.com', 'www.github.com'].includes(url.hostname.toLowerCase())) {
      throw new Error('Only github.com repository URLs are supported.');
    }
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length !== 2) throw new Error('Use a repository URL such as https://github.com/owner/repo.');
    [owner, repo] = parts;
  } else {
    const parts = value.split('/').filter(Boolean);
    if (parts.length !== 2) throw new Error('Use owner/repo or a github.com repository URL.');
    [owner, repo] = parts;
  }

  repo = repo.replace(/\.git$/i, '');
  if (!validPart(owner) || !validPart(repo)) throw new Error('The GitHub repository identifier is invalid.');

  return {
    owner,
    repo,
    slug: `${owner}/${repo}`,
    url: `https://github.com/${owner}/${repo}`
  };
}

function headers(token, raw = false) {
  const result = {
    'User-Agent': 'AVGL/0.1',
    Accept: raw ? 'text/plain' : 'application/vnd.github+json'
  };
  if (token) result.Authorization = `Bearer ${token}`;
  return result;
}

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

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => run());
  await Promise.all(workers);
  return output;
}

async function expectJson(fetchImpl, url, token) {
  const response = await fetchImpl(url, { headers: headers(token) });
  if (!response.ok) {
    const rate = response.status === 403 || response.status === 429;
    const error = new Error(rate
      ? 'GitHub API rate limit or access policy blocked the scan.'
      : `GitHub request failed with status ${response.status}.`);
    error.statusCode = response.status;
    throw error;
  }
  return response.json();
}

export async function discoverGitHubRepository(input, options = {}) {
  const parsed = parseGitHubRepository(input);
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  if (typeof fetchImpl !== 'function') throw new Error('No fetch implementation is available.');

  const token = options.token;
  const maxFiles = options.maxFiles ?? DEFAULT_MAX_FILES;
  const maxFileBytes = options.maxFileBytes ?? MAX_FILE_BYTES;
  const concurrency = options.concurrency ?? DEFAULT_CONCURRENCY;

  const apiBase = `https://api.github.com/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}`;
  const repository = await expectJson(fetchImpl, apiBase, token);
  const ref = options.ref ?? repository.default_branch;
  if (!ref) throw new Error('The GitHub repository has no default branch.');

  const tree = await expectJson(fetchImpl, `${apiBase}/git/trees/${encodeURIComponent(ref)}?recursive=1`, token);
  if (tree.truncated) throw new Error('The GitHub tree is too large for the v0.1 bounded scanner.');

  const blobs = (tree.tree ?? [])
    .filter((entry) => entry.type === 'blob' && typeof entry.path === 'string')
    .map((entry) => ({ path: entry.path, size: entry.size ?? 0 }));

  const candidates = blobs
    .filter((file) => !isSensitivePath(file.path))
    .filter((file) => isTextCandidate(file.path))
    .filter((file) => file.size <= maxFileBytes)
    .slice(0, maxFiles);

  const contents = await mapConcurrent(candidates, concurrency, async (file) => {
    const path = file.path.split('/').map(encodeURIComponent).join('/');
    const rawUrl = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${encodeURIComponent(ref)}/${path}`;
    const response = await fetchImpl(rawUrl, { headers: headers(token, true) });
    if (!response.ok) return null;
    return { ...file, content: await response.text() };
  });

  const byPath = new Map(contents.filter(Boolean).map((file) => [file.path, file]));
  const files = blobs.map((file) => byPath.get(file.path) ?? file);
  const partial = candidates.length >= maxFiles && blobs.filter((file) =>
    !isSensitivePath(file.path) && isTextCandidate(file.path) && file.size <= maxFileBytes
  ).length > maxFiles;

  return discoverFiles(files, {
    kind: 'repository',
    label: parsed.slug
  }, {
    maxFileBytes,
    filesSeen: blobs.length,
    analysisMode: partial ? 'github-static-baseline-partial' : 'github-static-baseline'
  });
}

export async function analyzeGitHubRepository(input, options = {}) {
  const discovery = await discoverGitHubRepository(input, options);
  return bindAvglIr(discovery, classifyDiscoveries(discovery));
}
