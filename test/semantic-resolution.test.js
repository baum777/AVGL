import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { classifyDiscoveries, discoverFiles } from '../src/index.js';

const canonicalCanvasFixture = new URL('./fixtures/semantic-resolution/canvas-context-negative.mjs', import.meta.url);
const canonicalWhoNegativeFixture = new URL('./fixtures/semantic-resolution/who-non-agent-negative.mjs', import.meta.url);
const canonicalThinkNegativeFixture = new URL('./fixtures/semantic-resolution/think-non-cognition-negative.mjs', import.meta.url);

test('canonical negative fixture rejects Canvas 2D context as agentic KNOW evidence', async () => {
  const content = await readFile(canonicalCanvasFixture, 'utf8');
  const discovery = discoverFiles([{
    path: 'examples/snake/snake.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  const know = discovery.observations.filter((item) => item.candidateClass === 'KNOW');
  assert.equal(know.length, 0);
  assert.ok(discovery.semanticResolution.rejected >= 3);
  assert.ok(discovery.semanticRejections.some((item) => item.rule === 'canvas-rendering-context'));
});

test('semantic resolver accepts explicit runtime context APIs and preserves provenance', () => {
  const content = `
    export function createRunContext(messages, memory) {
      const context = { messages, memory, tools: [] };
      return context;
    }
  `;

  const discovery = discoverFiles([{
    path: 'runtime/kernel/runtime-context.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  const know = discovery.observations.find((item) => item.candidateClass === 'KNOW');
  assert.ok(know);
  assert.equal(know.semanticResolution.mode, 'SEMANTIC');
  assert.equal(know.semanticResolution.resolver, 'know.context.v1');

  const classified = classifyDiscoveries(discovery);
  const claim = classified.classifications.find((item) => item.semanticClass === 'KNOW');
  assert.ok(claim);
  assert.equal(claim.evidence[0].semanticResolution.mode, 'SEMANTIC');
  assert.match(claim.evidence[0].semanticResolution.rule, /context|memory/);
});

test('generic context tokens fail closed instead of becoming KNOW by word match alone', () => {
  const content = `
    export function normalize(value) {
      const context = {};
      return { value, context };
    }
  `;

  const discovery = discoverFiles([{
    path: 'src/normalize.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  assert.equal(discovery.observations.some((item) => item.candidateClass === 'KNOW'), false);
  assert.ok(discovery.semanticRejections.some((item) => item.rule === 'unresolved-context-token'));
});

test('canonical WHO negative fixture rejects User-Agent, UI role, and browser Worker', async () => {
  const content = await readFile(canonicalWhoNegativeFixture, 'utf8');
  const discovery = discoverFiles([{
    path: 'web/client.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  const who = discovery.observations.filter((item) => item.candidateClass === 'WHO');
  assert.equal(who.length, 0);
  const rules = new Set(discovery.semanticRejections.filter((item) => item.candidateClass === 'WHO').map((item) => item.rule));
  assert.equal(rules.has('http-user-agent'), true);
  assert.equal(rules.has('ui-role'), true);
  assert.equal(rules.has('browser-worker'), true);
});

test('WHO accepts structured agent definitions and preserves semantic provenance', () => {
  const content = `
    export const agent = {
      role: 'reviewer',
      instructions: 'Review the repository',
      model,
      tools: [runTests]
    };
  `;
  const discovery = discoverFiles([{
    path: 'src/agents/reviewer.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  const who = discovery.observations.find((item) => item.candidateClass === 'WHO');
  assert.ok(who);
  assert.equal(who.semanticResolution.mode, 'SEMANTIC');
  assert.equal(who.semanticResolution.resolver, 'who.actor.v1');
  assert.match(who.semanticResolution.rule, /actor|agent|harness/);
});

test('generic worker or role tokens fail closed without agentic support', () => {
  const content = `
    const worker = queue.next();
    const role = account.role;
  `;
  const discovery = discoverFiles([{
    path: 'src/queue.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  assert.equal(discovery.observations.some((item) => item.candidateClass === 'WHO'), false);
  assert.ok(discovery.semanticRejections.some((item) => item.rule === 'unresolved-actor-token'));
});

test('canonical THINK negative fixture rejects ORM models, route planners, project planning, and generic reasoning prose', async () => {
  const content = await readFile(canonicalThinkNegativeFixture, 'utf8');
  const discovery = discoverFiles([{
    path: 'src/domain/planning.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  const think = discovery.observations.filter((item) => item.candidateClass === 'THINK');
  assert.equal(think.length, 0);

  const rules = new Set(
    discovery.semanticRejections
      .filter((item) => item.candidateClass === 'THINK')
      .map((item) => item.rule)
  );

  assert.equal(rules.has('data-or-orm-model'), true);
  assert.equal(rules.has('generic-planner-class'), true);
  assert.equal(rules.has('non-agentic-planning'), true);
  assert.equal(rules.has('unresolved-cognition-token'), true);
});

test('THINK accepts explicit LLM invocation and preserves semantic provenance', () => {
  const content = [
    'const response = await openai.responses.create({',
    "  model: 'gpt-5.6',",
    '  input: messages',
    '});'
  ].join('\n');

  const discovery = discoverFiles([{
    path: 'runtime/model/openai-adapter.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  const think = discovery.observations.find((item) => item.candidateClass === 'THINK');
  assert.ok(think);
  assert.equal(think.semanticResolution.mode, 'SEMANTIC');
  assert.equal(think.semanticResolution.resolver, 'think.cognition.v1');
  assert.equal(think.semanticResolution.rule, 'llm-model-invocation');
});

test('THINK accepts recognized LLM model configuration', () => {
  const content = "export const runtime = { model: 'claude-sonnet-4-5' };";
  const discovery = discoverFiles([{
    path: 'runtime/model/config.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  const think = discovery.observations.find((item) => item.candidateClass === 'THINK');
  assert.ok(think);
  assert.equal(think.semanticResolution.resolver, 'think.cognition.v1');
  assert.equal(think.semanticResolution.rule, 'explicit-llm-model-config');
});

test('THINK accepts planning only when coupled to agentic runtime semantics', () => {
  const content = [
    'export function planner(agent, workflow, model) {',
    '  return planning({ agent, workflow, model, prompt: agent.prompt });',
    '}'
  ].join('\n');

  const discovery = discoverFiles([{
    path: 'runtime/planner/agent-planner.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  const think = discovery.observations.find((item) => item.candidateClass === 'THINK');
  assert.ok(think);
  assert.equal(think.semanticResolution.resolver, 'think.cognition.v1');
  assert.equal(think.semanticResolution.rule, 'agentic-cognition-orchestration');
});

test('generic model tokens fail closed without LLM/runtime support', () => {
  const content = 'const model = catalog.model;';
  const discovery = discoverFiles([{
    path: 'src/catalog.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  assert.equal(discovery.observations.some((item) => item.candidateClass === 'THINK'), false);
  assert.ok(discovery.semanticRejections.some((item) => item.rule === 'unresolved-model-token'));
});

test('unmigrated semantic classes remain explicitly marked as lexical fallback', () => {
  const content = 'const tools = registerTools();';
  const discovery = discoverFiles([{
    path: 'src/tools.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  const can = discovery.observations.find((item) => item.candidateClass === 'CAN');
  assert.ok(can);
  assert.equal(can.semanticResolution.mode, 'LEXICAL_FALLBACK');
  assert.equal(discovery.semanticResolution.lexicalFallbackAccepted > 0, true);
});
