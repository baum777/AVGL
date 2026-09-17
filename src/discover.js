import { readdir, readFile, stat } from 'node:fs/promises';
import { basename, extname, join, relative, resolve } from 'node:path';
import {
  DEFAULT_EXCLUDED_DIRECTORIES,
  MAX_FILE_BYTES,
  TEXT_EXTENSIONS,
  TEXT_FILENAMES
} from './constants.js';
import { DETECTORS } from './detectors.js';

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

function snippet(line) {
  return line.trim().replace(/\s+/g, ' ').slice(0, 180);
}

function scanContent(path, content, observations) {
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
        evidenceState: detector.evidenceState
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

    filesScanned += 1;
    scanContent(path, content, observations);
  }

  return {
    source,
    generatedAt: new Date().toISOString(),
    filesSeen: options.filesSeen ?? files.length,
    filesScanned,
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

  return discoverFiles(files, {
    kind: 'repository',
    label: basename(root)
  }, {
    maxFileBytes,
    filesSeen: paths.length,
    analysisMode: 'deterministic-static-baseline'
  });
}
