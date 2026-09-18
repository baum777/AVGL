import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRepository, rankRelevantFiles, summarizeRepositoryFile } from '../src/repository-inspect.js';

test('parseRepository accepts slug and github URL but rejects foreign hosts', () => {
  assert.deepEqual(parseRepository('baum777/AVGL'), { owner: 'baum777', repo: 'AVGL', slug: 'baum777/AVGL' });
  assert.deepEqual(parseRepository('https://github.com/baum777/AVGL'), { owner: 'baum777', repo: 'AVGL', slug: 'baum777/AVGL' });
  assert.throws(() => parseRepository('https://example.com/baum777/AVGL'), /Only github\.com/);
});

test('summarizeRepositoryFile produces grounded bilingual code description', () => {
  const file = summarizeRepositoryFile({
    path: 'runtime/permissions/permission-engine.mjs',
    sourceKind: 'implementation',
    size: 180,
    content: "export function createPermissionEngine(context) {\n  return { decide({ claim }) { return claim === 'filesystem.write' ? 'allow' : 'deny'; } };\n}\n"
  });
  assert.equal(file.role.en, 'Runtime permission enforcement');
  assert.equal(file.role.de, 'Runtime-Berechtigungsdurchsetzung');
  assert.ok(file.symbols.includes('createPermissionEngine'));
  assert.ok(file.semanticClasses.includes('MAY'));
  assert.match(file.summary.de, /Authority|Permission/);
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
