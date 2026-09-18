#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import {
  analyzeRepository,
  assertTransportSafeIr,
  createWorkspaceIr,
  projectHarnessCard,
  projectJson,
  projectStory,
  sanitizeIrForTransport,
  workspaceSummary
} from '../src/index.js';

function help() {
  return `AVGL v0.4

Usage:
  avgl analyze [path] [--format story|card|json]
  avgl local-private [path] [--out file] [--no-paths]
  avgl workspace <manifest.json> [--out file] [--transport-safe]

Examples:
  avgl analyze .
  avgl local-private ../private-agent --out avgl.private.json
  avgl workspace ./avgl.workspace.json --out workspace.avgl.json --transport-safe
`;
}

function optionValue(args, name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function positional(args) {
  return args.filter((value, index) => {
    if (value.startsWith('--')) return false;
    const previous = args[index - 1];
    return !['--format','--out'].includes(previous);
  });
}

async function runAnalyze(args) {
  const target = positional(args)[0] ?? '.';
  const format = optionValue(args, '--format') ?? 'story';
  if (!['story','card','json'].includes(format)) {
    throw new Error('Unsupported format: ' + format + '. Expected story, card, or json.');
  }
  const ir = await analyzeRepository(target);
  return format === 'json'
    ? projectJson(ir)
    : format === 'card'
      ? projectHarnessCard(ir)
      : projectStory(ir);
}

async function runLocalPrivate(args) {
  const target = positional(args)[0] ?? '.';
  const outputPath = optionValue(args, '--out');
  const allowPaths = !args.includes('--no-paths');

  const ir = await analyzeRepository(target);
  const safe = sanitizeIrForTransport(ir, { allowPaths });
  assertTransportSafeIr(safe);
  const output = JSON.stringify(safe, null, 2);

  if (outputPath) {
    await writeFile(outputPath, output + '\n', 'utf8');
    return JSON.stringify({
      mode:'LOCAL_PRIVATE',
      output:outputPath,
      rawSourceTransported:false,
      filePathsTransported:allowPaths
    }, null, 2);
  }
  return output;
}

async function runWorkspace(args) {
  const manifestPath = positional(args)[0];
  if (!manifestPath) throw new Error('workspace requires a manifest JSON file.');
  const outputPath = optionValue(args, '--out');
  const transportSafe = args.includes('--transport-safe');

  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (!Array.isArray(manifest.repositories) || manifest.repositories.length === 0) {
    throw new Error('Workspace manifest requires repositories[].');
  }

  const entries = [];
  for (let index = 0; index < manifest.repositories.length; index += 1) {
    const item = manifest.repositories[index];
    if (typeof item.path !== 'string' || !item.path.trim()) {
      throw new Error('Workspace repository ' + index + ' requires a local path.');
    }
    let ir = await analyzeRepository(item.path);
    if (transportSafe) {
      ir = sanitizeIrForTransport(ir, { allowPaths: item.allowPaths !== false });
      assertTransportSafeIr(ir);
    }
    entries.push({
      id:item.id,
      revision:item.revision,
      provides:Array.isArray(item.provides) ? item.provides : [],
      packageName:item.packageName,
      dependsOn:Array.isArray(item.dependsOn) ? item.dependsOn : [],
      ir
    });
  }

  const workspace = createWorkspaceIr(entries, {
    label:manifest.label ?? 'workspace',
    relations:Array.isArray(manifest.relations) ? manifest.relations : []
  });
  if (transportSafe) {
    workspace.privacy = {
      mode:'LOCAL_PRIVATE',
      rawSourceTransported:false,
      repositoryCount:entries.length
    };
  }

  const output = JSON.stringify({ workspace, summary:workspaceSummary(workspace) }, null, 2);
  if (outputPath) {
    await writeFile(outputPath, output + '\n', 'utf8');
    return JSON.stringify({ output:outputPath, ...workspaceSummary(workspace), transportSafe }, null, 2);
  }
  return output;
}

const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(help());
  process.exit(0);
}

const command = args.shift();

try {
  const output = command === 'analyze'
    ? await runAnalyze(args)
    : command === 'local-private'
      ? await runLocalPrivate(args)
      : command === 'workspace'
        ? await runWorkspace(args)
        : null;

  if (output === null) throw new Error('Unknown command: ' + command);
  console.log(output);
} catch (error) {
  console.error('AVGL failed: ' + (error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
}
