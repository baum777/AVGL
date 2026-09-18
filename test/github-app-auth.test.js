import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import {
  createGitHubAppJwt,
  createInstallationSession,
  createSignedToken,
  mintInstallationToken,
  verifySignedToken
} from '../src/github-app-auth.js';

test('signed session token verifies and expires fail-closed', () => {
  const secret = 'test-secret';
  const token = createSignedToken({ type:'x', exp:200 }, secret);
  assert.equal(verifySignedToken(token, secret, 100)?.type, 'x');
  assert.equal(verifySignedToken(token, secret, 201), null);
  assert.equal(verifySignedToken(token + 'tamper', secret, 100), null);
});

test('installation session binds a numeric installation id', () => {
  const token = createInstallationSession(42, 'secret', { nowSeconds:100, ttlSeconds:60 });
  const payload = verifySignedToken(token, 'secret', 120);
  assert.equal(payload.installationId, 42);
  assert.equal(payload.type, 'github_app_installation');
});

test('GitHub App JWT is RS256 signed and installation token mint is server-side', async () => {
  const { privateKey } = generateKeyPairSync('rsa', { modulusLength:2048 });
  const pem = privateKey.export({ type:'pkcs8', format:'pem' });
  const jwt = createGitHubAppJwt({ appId:'123', privateKey:pem, nowSeconds:1000 });
  assert.equal(jwt.split('.').length, 3);

  let authorization = '';
  const result = await mintInstallationToken(77, {
    appId:'123',
    privateKey:pem,
    nowSeconds:1000,
    fetchImpl:async (url, options) => {
      authorization = options.headers.Authorization;
      assert.match(url, /installations\/77\/access_tokens$/);
      return {
        ok:true,
        status:201,
        async json(){ return { token:'installation-token', expires_at:'2026-09-18T03:00:00Z', permissions:{ contents:'read' } }; }
      };
    }
  });
  assert.match(authorization, /^Bearer /);
  assert.equal(result.token, 'installation-token');
  assert.equal(result.permissions.contents, 'read');
});
