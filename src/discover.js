import { readdir, readFile, stat } from 'node:fs/promises';
import { basename, extname, join, relative, resolve } from 'node:path';
import {
  DEFAULT_EXCLUDED_DIRECTORIES,
  MAX_FILE_BYTES,
  TEXT_EXTENSIONS,
  TEXT_FILENAMES
} from './constants.js';
import { DETECTORS } from './detectors.js';

const CODE_EXTENSIONS = new Set([
  '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.py', '.go', '.rs', '.java',
  '.kt', '.rb', '.php'
]);
const CONFIG_EXTENSIONS = new Set(['.json', '.yaml', '.yml', '.toml', '.ini']);

export function isSensitivePath(path) {
  const name = basename(path).toLowerCase();
  return name === '.env' ||
    name.startsWith('.env.') ||
    name === '.npmrc' ||
    name === '.pypirc' ||
    name === 'id_rsa' ||
    name === 'id_ed25519' ||
    /\.(pem|key|p12|pfx)$/i.test(name);
}

export function isTextCandidate(path) {
  const name = basename(path);
  return TEXT_FILENAMES.has(name) || TEXT_EXTENSIONS.has(extname(name).toLowerCase());
}

export function sourceKindForPath(path) {
  const normalized = String(path ?? '').replaceAll('\\', '/');
  const lower = normalized.toLowerCase();
  const name = basename(lower);
  const extension = extname(name);

  if (
    lower.startsWith('docs/') ||
    lower.includes('/docs/') ||
    lower.startsWith('.agents/') ||
    lower.includes('/.agents/') ||
    extension === '.md' ||
    extension === '.txt' ||
    name === 'readme.md'
  ) return 'documentation';

  if (
    /(^|\/)(test|tests|__tests__|spec|specs)(\/|$)/.test(lower) ||
    /\.(test|spec)\.[^.]+$/.test(lower)
  ) return 'test';

  if (
    CONFIG_EXTENSIONS.has(extension) ||
    ['dockerfile', 'makefile', 'procfile'].includes(name)
  ) return 'config';

  if (CODE_EXTENSIONS.has(extension)) return 'implementation';
  return 'other';
}

function snippet(line) {
  return line.trim().replace(/\s+/g, ' ').slice(0, 180);
}

function scanContent(path, content, observations, sourceKind) {
  const lines = content.split(/\r?\n/);
  for (const detector of DETECTORS) {
    let hits = 0;
    for (let index = 0; index < lines.length && hits < 3; index += 1) {
      if (!detector.patterns.some((pattern) => pattern.test(lines[index]))) continue;
      observations.push({
        detectorId: detector.id,
        candidateClass: detector.semanticClass,
        label: detector.label,
        path,
        line: index + 1,
        snippet: snippet(lines[index]),
        confidence: detector.confidence,
        evidenceState: detector.evidenceState,
        sourceKind
      });
      hits += 1;
    }
  }
}

export function discoverFiles(files, source = { kind: 'repository', label: 'repository' }, options = {}) {
  const maxFileBytes = options.maxFileBytes ?? MAX_FILE_BYTES;
  const observations = [];
  const skippedSensitive = [];
  const skippedOversize = [];
  const sourceCoverage = {
    implementation: 0,
    config: 0,
    test: 0,
    documentation: 0,
    other: 0
  };
  let filesScanned = 0;

  for (const file of files) {
    const path = String(file?.path ?? '').replaceAll('\\', '/');
    if (!path) continue;

    if (isSensitivePath(path)) {
      skippedSensitive.push(path);
      continue;
    }
    if (!isTextCandidate(path)) continue;

    const content = typeof file.content === 'string' ? file.content : null;
    const size = Number.isFinite(file.size)
      ? file.size
      : content === null
        ? 0
        : Buffer.byteLength(content, 'utf8');

    if (size > maxFileBytes) {
      skippedOversize.push(path);
      continue;
    }
    if (content === null) continue;

    const sourceKind = file.sourceKind ?? sourceKindForPath(path);
    filesScanned += 1;
    sourceCoverage[sourceKind] = (sourceCoverage[sourceKind] ?? 0) + 1;
    scanContent(path, content, observations, sourceKind);
  }

  return {
    source,
    generatedAt: new Date().toISOString(),
    filesSeen: options.filesSeen ?? files.length,
    filesEligible: options.filesEligible ?? files.filter((file) => {
      const path = String(file?.path ?? '').replaceAll('\\', '/');
      return path && !isSensitivePath(path) && isTextCandidate(path) && (file.size ?? 0) <= maxFileBytes;
    }).length,
    filesScanned,
    scanComplete: options.scanComplete ?? true,
    sourceCoverage,
    skippedSensitive,
    skippedOversize,
    analysisMode: options.analysisMode,
    observations
  };
}

async function walk(current, files) {
  const entries = await readdir(current, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && DEFAULT_EXCLUDED_DIRECTORIES.has(entry.name)) continue;
    const fullPath = join(current, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath, files);
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
}

export async function discoverRepository(rootPath = '.', options = {}) {
  const root = resolve(rootPath);
  const maxFileBytes = options.maxFileBytes ?? MAX_FILE_BYTES;
  const paths = [];
  await walk(root, paths);

  const files = [];
  for (const fullPath of paths) {
    const path = relative(root, fullPath).replaceAll('\\', '/');
    if (isSensitivePath(path) || !isTextCandidate(path)) {
      files.push({ path });
      continue;
    }

    const info = await stat(fullPath);
    if (info.size > maxFileBytes) {
      files.push({ path, size: info.size });
      continue;
    }

    try {
      files.push({ path, size: info.size, content: await readFile(fullPath, 'utf8') });
    } catch {
      files.push({ path, size: info.size });
    }
  }

  const eligible = files.filter((file) => !isSensitivePath(file.path) && isTextCandidate(file.path) && (file.size ?? 0) <= maxFileBytes);
  const discovery = discoverFiles(files, {
    kind: 'repository',
    label: basename(root)
  }, {
    maxFileBytes,
    filesSeen: paths.length,
    filesEligible: eligible.length,
    scanComplete: true,
    analysisMode: 'deterministic-static-baseline'
  });
  discovery.transientFiles = files.filter((file) => typeof file.content === 'string');
  discovery.scanStrategy = 'full';
  discovery.filesSelected = discovery.filesScanned;
  discovery.bytesScanned = discovery.transientFiles.reduce((sum, file) => sum + (file.size ?? Buffer.byteLength(file.content, 'utf8')), 0);
  discovery.treeComplete = true;
  discovery.treeFallbackUsed = false;
  discovery.unsupportedFileCount = Math.max(0, paths.length - eligible.length - discovery.skippedSensitive.length - discovery.skippedOversize.length);
  discovery.contentFetchFailures = [];
  return discovery;
}
