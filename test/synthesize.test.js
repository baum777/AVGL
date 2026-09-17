import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { analyzeRepository, projectStory } from '../src/index.js';

async function fixture(files) {
  const root = await mkdtemp(join(tmpdir(), 'avgl-synth-'));
  for (const [path, content] of Object.entries(files)) {
    const full = join(root, path);
    await mkdir(full.substring(0, full.lastIndexOf('/')), { recursive: true });
    await writeFile(full, content, 'utf8');
  }
  return root;
}

test('synthesizes repository-specific capability, authority, effect, and evidence families', async (t) => {
  const root = await fixture({
    'src/agent.ts': `
      const agent = { instructions: 'review', model: openai('gpt-5') };
      const context = memory.retrieve('repo');
      const tools = [mcp, filesystem, browser];
      if (!policy.authorize('repo.write')) return approval.required;
      await executor.dispatch(fetch('https://api.example.test'));
      audit.verify(receipt);
    `,
    'test/agent.test.ts': `test('verifies outcome', () => assert(result));`
  });
  t.after(() => rm(root, { recursive: true, force: true }));

  const ir = await analyzeRepository(root);
  assert.deepEqual(ir.analysis.pipeline, ['DISCOVER', 'CLASSIFY', 'BIND', 'SYNTHESIZE', 'PROJECT']);
  assert.equal(ir.synthesis.mode, 'deterministic-evidence-aggregation');
  assert.match(ir.synthesis.areas.THINK.summary, /OpenAI|model runtime/i);
  assert.match(ir.synthesis.areas.CAN.summary, /MCP|filesystem|browser/i);
  assert.match(ir.synthesis.areas.MAY.summary, /authorization|approval/i);
  assert.match(ir.synthesis.areas.ACT.summary, /executor|network/i);
  assert.match(ir.synthesis.areas.DID.summary, /verification|audit|tests/i);
  assert.match(projectStory(ir), /Capability surfaces:/);
});

test('synthesis stays unknown when the semantic gate has no accepted evidence', async (t) => {
  const root = await fixture({ 'src/agent.ts': `export const agent = { tools: [browser], model: 'llm' };` });
  t.after(() => rm(root, { recursive: true, force: true }));
  const ir = await analyzeRepository(root);
  assert.equal(ir.synthesis.areas.MAY.status, 'UNKNOWN');
  assert.equal(ir.synthesis.areas.ACT.status, 'UNKNOWN');
  assert.equal(ir.synthesis.areas.DID.status, 'UNKNOWN');
});
