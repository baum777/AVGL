import test from 'node:test';
import assert from 'node:assert/strict';

test('public module surface instantiates without missing ESM exports', async () => {
  const module = await import('../src/index.js');
  assert.equal(typeof module.analyzeRepository, 'function');
  assert.equal(typeof module.analyzeGitHubRepository, 'function');
  assert.equal(typeof module.listUserInstallationRepositories, 'function');
  assert.equal(typeof module.verifyUserInstallationAccess, 'function');
});
