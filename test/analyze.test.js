import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { analyzeRepository, projectStory } from '../src/index.js';

async function fixture(files) {
  const root = await mkdtemp(join(tmpdir(), 'avgl-'));
  for (const [path, content] of Object.entries(files)) {
    const full = join(root, path);
    await mkdir(full.substring(0, full.lastIndexOf('/')), { recursive: true });
    await writeFile(full, content, 'utf8');
  }
  return root;
}

test('maps implementation evidence onto the seven AVGL semantic classes', async (t) => {
  const root = await fixture({ 'src/agent.js': `
      export const agent = { role: 'reviewer', instructions: 'Review code' };
      const context = memory.retrieve('repository');
      const model = openai.model('reasoning');
      const tools = [runTests];
      if (!policy.authorize('test.run')) throw new Error('denied');
      await executor.dispatch(runTests);
      audit.verify(receipt);
    ` });
  t.after(() => rm(root, { recursive: true, force: true }));
  const ir = await analyzeRepository(root);
  const classes = new Set(ir.nodes.map((node) => node.semanticClass));
  for (const expected of ['WHO', 'KNOW', 'THINK', 'CAN', 'MAY', 'ACT', 'DID']) assert.equal(classes.has(expected), true, `expected ${expected}`);
  assert.deepEqual(ir.unknowns, []);
  assert.equal(ir.analysis.sourceCoverage.implementation, 1);
});

test('keeps missing authority explicit instead of turning CAN into MAY', async (t) => {
  const root = await fixture({ 'src/agent.js': `export const agent = { role: 'reader' }; export const tools = [browser];` });
  t.after(() => rm(root, { recursive: true, force: true }));
  const ir = await analyzeRepository(root);
  assert.equal(ir.nodes.some((node) => node.semanticClass === 'CAN'), true);
  assert.equal(ir.nodes.some((node) => node.semanticClass === 'MAY'), false);
  assert.equal(ir.unknowns.includes('MAY'), true);
  const story = projectStory(ir);
  assert.match(story, /Was darf es\?/);
  assert.match(story, /Nicht belegt/);
});

test('documentation alone cannot prove MAY, ACT, or DID', async (t) => {
  const root = await fixture({ 'docs/architecture.md': `
    The agent has tools and model context.
    policy permission approval grant scope.
    executor dispatch send write deploy.
    receipt audit verification outcome.
  ` });
  t.after(() => rm(root, { recursive: true, force: true }));
  const ir = await analyzeRepository(root);
  assert.equal(ir.nodes.some((node) => node.semanticClass === 'CAN'), true);
  assert.equal(ir.unknowns.includes('MAY'), true);
  assert.equal(ir.unknowns.includes('ACT'), true);
  assert.equal(ir.unknowns.includes('DID'), true);
  assert.ok(ir.analysis.rejectedWeakEvidence >= 3);
});

test('does not read common secret file surfaces', async (t) => {
  const root = await fixture({ '.env': 'OPENAI_API_KEY=secret', 'src/index.js': `const model = 'local';` });
  t.after(() => rm(root, { recursive: true, force: true }));
  const ir = await analyzeRepository(root);
  assert.equal(ir.analysis.skippedSensitive.includes('.env'), true);
  assert.equal(ir.nodes.some((node) => node.evidence.some((item) => item.path === '.env')), false);
});
