import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeGitHubRepository, discoverGitHubRepository, parseGitHubRepository, selectGitHubCandidates } from '../src/github-source.js';

function jsonResponse(value, status = 200) {
  return { ok: status >= 200 && status < 300, status, async json() { return value; }, async text() { return JSON.stringify(value); } };
}
function textResponse(value, status = 200) {
  return { ok: status >= 200 && status < 300, status, async json() { return JSON.parse(value); }, async text() { return value; } };
}
function mockFetch(url) {
  if (url === 'https://api.github.com/repos/acme/agent') return Promise.resolve(jsonResponse({ default_branch: 'main' }));
  if (url === 'https://api.github.com/repos/acme/agent/git/trees/main?recursive=1') {
    return Promise.resolve(jsonResponse({ truncated: false, tree: [
      { type: 'blob', path: 'docs/architecture.md', size: 80 },
      { type: 'blob', path: 'agent.js', size: 90 },
      { type: 'blob', path: 'policy.ts', size: 70 },
      { type: 'blob', path: '.env', size: 40 }
    ] }));
  }
  if (url.endsWith('/docs/architecture.md')) return Promise.resolve(textResponse('policy approval grant. executor dispatch. receipt verification.'));
  if (url.endsWith('/agent.js')) return Promise.resolve(textResponse('const agent = { model: "llm", tools: ["browser"] };\nexecutor.dispatch("task");\n'));
  if (url.endsWith('/policy.ts')) return Promise.resolve(textResponse('export const policy = { permission: "read", scope: "repo" };\nverify("receipt");\n'));
  throw new Error(`Unexpected URL: ${url}`);
}

test('parseGitHubRepository accepts slug and canonical URL', () => {
  assert.deepEqual(parseGitHubRepository('acme/agent').slug, 'acme/agent');
  assert.deepEqual(parseGitHubRepository('https://github.com/acme/agent').slug, 'acme/agent');
  assert.throws(() => parseGitHubRepository('https://github.com/acme/agent/blob/main/a.js'));
});

test('bounded selection prioritizes implementation/config over documentation', () => {
  const eligible = [
    { path: '.agents/references/a.md', size: 10, sourceKind: 'documentation' },
    { path: 'docs/b.md', size: 10, sourceKind: 'documentation' },
    { path: 'src/agent.ts', size: 10, sourceKind: 'implementation' },
    { path: 'src/tool.ts', size: 10, sourceKind: 'implementation' },
    { path: 'policy.yaml', size: 10, sourceKind: 'config' }
  ];
  const selected = selectGitHubCandidates(eligible, 2);
  assert.equal(selected.some((file) => file.sourceKind === 'documentation'), false);
  assert.equal(selected.every((file) => ['implementation', 'config'].includes(file.sourceKind)), true);
});

test('GitHub discovery never fetches sensitive files and reports analyzable coverage', async () => {
  const discovery = await discoverGitHubRepository('acme/agent', { fetchImpl: mockFetch });
  assert.equal(discovery.filesSeen, 4);
  assert.equal(discovery.filesEligible, 3);
  assert.equal(discovery.filesScanned, 3);
  assert.equal(discovery.scanComplete, true);
  assert.deepEqual(discovery.skippedSensitive, ['.env']);
  assert.ok(discovery.observations.some((item) => item.candidateClass === 'CAN'));
});

test('GitHub analysis produces shared IR and strong authority evidence from code/config', async () => {
  const ir = await analyzeGitHubRepository('https://github.com/acme/agent', { fetchImpl: mockFetch });
  assert.equal(ir.source.label, 'acme/agent');
  assert.equal(ir.analysis.mode, 'github-static-baseline');
  assert.ok(ir.nodes.some((node) => node.semanticClass === 'THINK'));
  assert.ok(ir.nodes.some((node) => node.semanticClass === 'MAY'));
  assert.ok(ir.nodes.some((node) => node.semanticClass === 'DID'));
  assert.ok(ir.invariants.includes('CAN != MAY'));
  const may = ir.nodes.find((node) => node.semanticClass === 'MAY');
  assert.equal(may.evidence.some((item) => item.sourceKind === 'documentation'), false);
});
