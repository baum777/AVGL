#!/usr/bin/env node
import { analyzeRepository, projectHarnessCard, projectJson, projectStory } from '../src/index.js';

function help() {
  return `AVGL v0.1\n\nUsage:\n  avgl analyze [path] [--format story|card|json]\n\nExamples:\n  avgl analyze .\n  avgl analyze ../my-agent --format card\n  avgl analyze ../my-agent --format json\n`;
}

const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(help());
  process.exit(0);
}

const command = args.shift();
if (command !== 'analyze') {
  console.error(`Unknown command: ${command}\n\n${help()}`);
  process.exit(1);
}

let target = '.';
if (args[0] && !args[0].startsWith('--')) target = args.shift();

let format = 'story';
const formatIndex = args.indexOf('--format');
if (formatIndex >= 0) {
  format = args[formatIndex + 1] ?? '';
}
if (!['story', 'card', 'json'].includes(format)) {
  console.error(`Unsupported format: ${format || '(missing)'}\nExpected story, card, or json.`);
  process.exit(1);
}

try {
  const ir = await analyzeRepository(target);
  const output = format === 'json'
    ? projectJson(ir)
    : format === 'card'
      ? projectHarnessCard(ir)
      : projectStory(ir);
  console.log(output);
} catch (error) {
  console.error(`AVGL analysis failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
