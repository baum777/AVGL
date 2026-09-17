import { readdir, readFile, stat } from 'node:fs/promises';
import { basename, extname, join, relative, resolve } from 'node:path';
import {
  DEFAULT_EXCLUDED_DIRECTORIES,
  MAX_FILE_BYTES,
  TEXT_EXTENSIONS,
  TEXT_FILENAMES
} from './constants.js';
import { DETECTORS } from './detectors.js';

function isSensitivePath(path) {
  const name = basename(path).toLowerCase();
  return name === '.env' ||
    name.startsWith('.env.') ||
    name === '.npmrc' ||
    name === '.pypirc' ||
    name === 'id_rsa' ||
    name === 'id_ed25519' ||
    /\.(pem|key|p12|pfx)$/i.test(name);
}

function isTextCandidate(path) {
  const name = basename(path);
  return TEXT_FILENAMES.has(name) || TEXT_EXTENSIONS.has(extname(name).toLowerCase());
}

function snippet(line) {
  return line.trim().replace(/\s+/g, ' ').slice(0, 180);
}

async function walk(root, current, files) {
  const entries = await readdir(current, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && DEFAULT_EXCLUDED_DIRECTORIES.has(entry.name)) continue;
    const fullPath = join(current, entry.name);
    if (entry.isDirectory()) {
      await walk(root, fullPath, files);
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
}

export async function discoverRepository(rootPath = '.', options = {}) {
  const root = resolve(rootPath);
  const maxFileBytes = options.maxFileBytes ?? MAX_FILE_BYTES;
  const files = [];
  await walk(root, root, files);

  const observations = [];
  const skippedSensitive = [];
  const skippedOversize = [];
  let filesScanned = 0;

  for (const fullPath of files) {
    const path = relative(root, fullPath).replaceAll('\\', '/');

    if (isSensitivePath(path)) {
      skippedSensitive.push(path);
      continue;
    }
    if (!isTextCandidate(path)) continue;

    const info = await stat(fullPath);
    if (info.size > maxFileBytes) {
      skippedOversize.push(path);
      continue;
    }

    let content;
    try {
      content = await readFile(fullPath, 'utf8');
    } catch {
      continue;
    }

    filesScanned += 1;
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

  return {
    source: {
      kind: 'repository',
      label: basename(root)
    },
    generatedAt: new Date().toISOString(),
    filesSeen: files.length,
    filesScanned,
    skippedSensitive,
    skippedOversize,
    observations
  };
}
