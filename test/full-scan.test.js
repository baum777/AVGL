import test from 'node:test';
import assert from 'node:assert/strict';
import { discoverGitHubRepository } from '../src/github-source.js';
import { fetchCompleteGitHubTree } from '../src/github-tree.js';

function jsonResponse(value, status = 200) {
  return { ok: status >= 200 && status < 300, status, async json() { return value; }, async text() { return JSON.stringify(value); } };
}
function textResponse(value, status = 200) {
  return { ok: status >= 200 && status < 300, status, async json() { return JSON.parse(value); }, async text() { return value; } };
}

function fullTreeFetch(url) {
  if (url === 'https://api.github.com/repos/acme/full') return Promise.resolve(jsonResponse({ default_branch: 'main' }));
  if (url === 'https://api.github.com/repos/acme/full/git/trees/main?recursive=1') {
    return Promise.resolve(jsonResponse({ sha: 'root-tree', truncated: true, tree: [{ type: 'blob', path: 'partial.js', size: 10 }] }));
  }
  if (url === 'https://api.github.com/repos/acme/full/git/trees/root-tree') {
    return Promise.resolve(jsonResponse({ truncated: false, tree: [
      { type: 'blob', path: 'root.js', size: 80, sha: 'root-blob' },
      { type: 'tree', path: 'src', sha: 'src-tree' }
    ] }));
  }
  if (url === 'https://api.github.com/repos/acme/full/git/trees/src-tree') {
    return Promise.resolve(jsonResponse({ truncated: false, tree: [
      { type: 'blob', path: 'agent.js', size: 90, sha: 'agent-blob' },
      { type: 'blob', path: 'policy.ts', size: 70, sha: 'policy-blob' }
    ] }));
  }
  if (url === 'https://raw.githubusercontent.com/acme/full/main/root.js') return Promise.resolve(textResponse('export const tool = browser;'));
  if (url === 'https://raw.githubusercontent.com/acme/full/main/src/agent.js') return Promise.resolve(textResponse('const agent = { model: "llm", tools: [browser] }; executor.dispatch("task");'));
  if (url === 'https://raw.githubusercontent.com/acme/full/main/src/policy.ts') return Promise.resolve(textResponse('export const policy = { permission: "read", scope: "repo" }; verify("receipt");'));
  throw new Error(`Unexpected URL: ${url}`);
}

test('complete tree walker recovers all blobs after GitHub recursive truncation', async () => {
  const result = await fetchCompleteGitHubTree('acme/full', { fetchImpl: fullTreeFetch, treeConcurrency: 2 });
  assert.equal(result.treeComplete, true);
  assert.equal(result.treeFallbackUsed, true);
  assert.deepEqual(
    result.entries.filter((entry) => entry.type === 'blob').map((entry) => entry.path).sort(),
    ['root.js', 'src/agent.js', 'src/policy.ts']
  );
});

test('full scanner ignores maxFiles and scans every eligible text file', async () => {
  const discovery = await discoverGitHubRepository('acme/full', {
    fetchImpl: fullTreeFetch,
    scanStrategy: 'full',
    maxFiles: 1,
    batchSize: 2,
    concurrency: 2
  });
  assert.equal(discovery.scanStrategy, 'full');
  assert.equal(discovery.filesEligible, 3);
  assert.equal(discovery.filesSelected, 3);
  assert.equal(discovery.filesScanned, 3);
  assert.equal(discovery.scanComplete, true);
  assert.equal(discovery.treeFallbackUsed, true);
  assert.equal(discovery.contentFetchFailures.length, 0);
});

test('bounded scanner keeps weighted slot limit and reports incomplete coverage', async () => {
  const discovery = await discoverGitHubRepository('acme/full', {
    fetchImpl: fullTreeFetch,
    scanStrategy: 'bounded',
    maxFiles: 1,
    concurrency: 1
  });
  assert.equal(discovery.filesEligible, 3);
  assert.equal(discovery.filesSelected, 1);
  assert.equal(discovery.filesScanned, 1);
  assert.equal(discovery.scanComplete, false);
  assert.equal(discovery.analysisMode, 'github-static-baseline-partial');
});

test('full scanner fails closed when an eligible file cannot be fetched', async () => {
  const failingFetch = async (url, options) => {
    if (url === 'https://raw.githubusercontent.com/acme/full/main/src/policy.ts') return textResponse('not found', 404);
    return fullTreeFetch(url, options);
  };
  const discovery = await discoverGitHubRepository('acme/full', {
    fetchImpl: failingFetch,
    scanStrategy: 'full',
    concurrency: 2
  });
  assert.equal(discovery.scanComplete, false);
  assert.deepEqual(discovery.contentFetchFailures, ['src/policy.ts']);
  assert.equal(discovery.analysisMode, 'github-static-full-incomplete');
});


test('authenticated scanner uses Git blob API for private-compatible content reads', async () => {
  const seen = [];
  const fetchImpl = async (url, options) => {
    seen.push({ url, authorization: options?.headers?.Authorization });
    if (url === 'https://api.github.com/repos/acme/full') return jsonResponse({ default_branch: 'main', private: true });
    if (url === 'https://api.github.com/repos/acme/full/git/trees/main?recursive=1') {
      return jsonResponse({ sha: 'root-tree', truncated: false, tree: [
        { type: 'blob', path: 'root.js', size: 80, sha: 'root-blob' }
      ] });
    }
    if (url === 'https://api.github.com/repos/acme/full/git/blobs/root-blob') {
      return jsonResponse({ encoding:'base64', content:Buffer.from('export const tool = browser;').toString('base64') });
    }
    throw new Error('Unexpected URL: ' + url);
  };
  const discovery = await discoverGitHubRepository('acme/full', {
    fetchImpl,
    token:'user-scoped-token',
    scanStrategy:'full'
  });
  assert.equal(discovery.filesScanned, 1);
  assert.equal(discovery.scanComplete, true);
  assert.ok(seen.some((entry) => entry.url.endsWith('/git/blobs/root-blob') && entry.authorization === 'Bearer user-scoped-token'));
  assert.equal(seen.some((entry) => entry.url.includes('raw.githubusercontent.com')), false);
});
