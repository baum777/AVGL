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

test('maps repository evidence onto the seven AVGL semantic classes', async (t) => {
  const root = await fixture({
    'src/agent.js': `
      export const agent = { role: 'reviewer', instructions: 'Review code' };
      const context = memory.retrieve('repository');
      const model = openai.model('reasoning');
      const tools = [runTests];
      if (!policy.authorize('test.run')) throw new Error('denied');
      await executor.dispatch(runTests);
      audit.verify(receipt);
    `
  });
  t.after(() => rm(root, { recursive: true, force: true }));

  const ir = await analyzeRepository(root);
  const classes = new Set(ir.nodes.map((node) => node.semanticClass));
  for (const expected of ['WHO', 'KNOW', 'THINK', 'CAN', 'MAY', 'ACT', 'DID']) {
    assert.equal(classes.has(expected), true, `expected ${expected}`);
  }
  assert.deepEqual(ir.unknowns, []);
});

test('keeps missing authority explicit instead of turning CAN into MAY', async (t) => {
  const root = await fixture({
    'src/agent.js': `
      export const agent = { role: 'reader' };
      export const tools = [browser];
    `
  });
  t.after(() => rm(root, { recursive: true, force: true }));

  const ir = await analyzeRepository(root);
  assert.equal(ir.nodes.some((node) => node.semanticClass === 'CAN'), true);
  assert.equal(ir.nodes.some((node) => node.semanticClass === 'MAY'), false);
  assert.equal(ir.unknowns.includes('MAY'), true);

  const story = projectStory(ir);
  assert.match(story, /Was darf es\?/);
  assert.match(story, /Nicht belegt/);
});

test('does not read common secret file surfaces', async (t) => {
  const root = await fixture({
    '.env': 'OPENAI_API_KEY=secret',
    'src/index.js': `const model = 'local';`
  });
  t.after(() => rm(root, { recursive: true, force: true }));

  const ir = await analyzeRepository(root);
  assert.equal(ir.analysis.skippedSensitive.includes('.env'), true);
  assert.equal(ir.nodes.some((node) => node.evidence.some((item) => item.path === '.env')), false);
});
