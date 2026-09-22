import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchRepositoryFile, parseRepository, rankRelevantFiles, summarizeRepositoryFile } from '../src/repository-inspect.js';

test('parseRepository accepts slug and github URL but rejects foreign hosts', () => {
  assert.deepEqual(parseRepository('baum777/AVGL'), { owner: 'baum777', repo: 'AVGL', slug: 'baum777/AVGL' });
  assert.deepEqual(parseRepository('https://github.com/baum777/AVGL'), { owner: 'baum777', repo: 'AVGL', slug: 'baum777/AVGL' });
  assert.throws(() => parseRepository('https://example.com/baum777/AVGL'), /Only github\.com/);
});

function jsonResponse(status, body) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

const yamlInventory = {
  repository: { owner: 'o', name: 'r', slug: 'o/r', url: '', description: '', defaultBranch: 'main', private: false },
  files: [{ path: 'architecture/capability.schema.yaml', size: 48, sha: 'abc123', sourceKind: 'config' }]
};

const yamlContent = 'capabilities:\n  - name: filesystem.read\n    effect: local read path\n';

test('fetchRepositoryFile loads a yaml file through the shared github helper (expectJson regression)', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return jsonResponse(200, { type: 'file', sha: 'abc123', content: Buffer.from(yamlContent, 'utf8').toString('base64') });
  };

  const file = await fetchRepositoryFile('o/r', 'architecture/capability.schema.yaml', {
    inventory: yamlInventory,
    fetchImpl,
    token: 'tok-1'
  });

  assert.equal(file.tooLarge, false);
  assert.match(file.content, /filesystem\.read/);
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /contents\/architecture\/capability\.schema\.yaml/);
  assert.match(calls[0].options.headers.Authorization, /^Bearer tok-1$/);

  const summary = summarizeRepositoryFile(file);
  assert.equal(summary.role.en, 'Repository file');
  assert.equal(summary.jsonMeta, null);
  assert.ok(summary.excerpt.includes('capabilities:'));
});

test('fetchRepositoryFile sends no Authorization header without a token', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return jsonResponse(200, { type: 'file', sha: 'abc123', content: Buffer.from('x: 1\n', 'utf8').toString('base64') });
  };
  await fetchRepositoryFile('o/r', 'architecture/capability.schema.yaml', { inventory: yamlInventory, fetchImpl });
  assert.equal(calls[0].options.headers.Authorization, undefined);
});

test('fetchRepositoryFile propagates GitHub error status codes', async () => {
  const fetchImpl = async () => jsonResponse(404, { message: 'Not Found' });
  await assert.rejects(
    fetchRepositoryFile('o/r', 'architecture/capability.schema.yaml', { inventory: yamlInventory, fetchImpl }),
    (error) => error.statusCode === 404
  );
});

test('fetchRepositoryFile keeps 401 distinguishable from 404 and 422', async () => {
  const fetchImpl = async () => jsonResponse(401, { message: 'Bad credentials' });
  await assert.rejects(
    fetchRepositoryFile('o/r', 'architecture/capability.schema.yaml', { inventory: yamlInventory, fetchImpl, token: 'expired-token' }),
    (error) => error.statusCode === 401 && /status 401/.test(error.message)
  );
});

test('fetchRepositoryFile rejects non-file payloads with 422', async () => {
  const fetchImpl = async () => jsonResponse(200, { type: 'dir' });
  await assert.rejects(
    fetchRepositoryFile('o/r', 'architecture/capability.schema.yaml', { inventory: yamlInventory, fetchImpl }),
    (error) => error.statusCode === 422 && /file payload/.test(error.message)
  );
});

test('summarizeRepositoryFile keeps file description structural and defers semantics to canonical IR', () => {
  const file = summarizeRepositoryFile({
    path: 'runtime/permissions/permission-engine.mjs',
    sourceKind: 'implementation',
    size: 180,
    content: "export function createPermissionEngine(context) {\n  return { decide({ claim }) { return claim === 'filesystem.write' ? 'allow' : 'deny'; } };\n}\n"
  });
  assert.equal(file.role.en, 'Runtime permission enforcement');
  assert.equal(file.role.de, 'Runtime-Berechtigungsdurchsetzung');
  assert.ok(file.symbols.includes('createPermissionEngine'));
  assert.deepEqual(file.semanticClasses, []);
  assert.equal(file.semanticSource, 'canonical-ir');
  assert.doesNotMatch(file.summary.en, /controls authority|effect paths|verification/i);
});

test('rankRelevantFiles prioritizes active file, question path matches, and evidence paths', () => {
  const files = [
    { path: 'runtime/auth/claim-binding.mjs', sourceKind: 'implementation' },
    { path: 'runtime/permissions/permission-engine.mjs', sourceKind: 'implementation' },
    { path: 'docs/runtime.md', sourceKind: 'documentation' }
  ];
  const ranked = rankRelevantFiles(files, 'How are permissions enforced?', {
    activeFile: 'runtime/auth/claim-binding.mjs',
    evidencePaths: ['runtime/permissions/permission-engine.mjs']
  });
  assert.equal(ranked[0].path, 'runtime/auth/claim-binding.mjs');
  assert.ok(ranked.some((file) => file.path === 'runtime/permissions/permission-engine.mjs'));
});
