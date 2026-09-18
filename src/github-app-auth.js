import { createHmac, createSign, randomBytes, timingSafeEqual } from 'node:crypto';

const DEFAULT_SESSION_TTL_SECONDS = 3600;
const DEFAULT_STATE_TTL_SECONDS = 600;

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function parseCookies(header = '') {
  return Object.fromEntries(
    String(header)
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf('=');
        return index < 0 ? [part, ''] : [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      })
  );
}

function signValue(value, secret) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function secureEqual(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function normalizePrivateKey(value) {
  return String(value ?? '').replace(/\\n/g, '\n').trim();
}

export function createSignedToken(payload, secret) {
  if (!secret) throw new Error('A signing secret is required.');
  const encoded = base64url(JSON.stringify(payload));
  return encoded + '.' + signValue(encoded, secret);
}

export function verifySignedToken(token, secret, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (!token || !secret) return null;
  const [encoded, signature, extra] = String(token).split('.');
  if (!encoded || !signature || extra) return null;
  const expected = signValue(encoded, secret);
  if (!secureEqual(signature, expected)) return null;

  let payload;
  try {
    payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (typeof payload.exp === 'number' && payload.exp < nowSeconds) return null;
  return payload;
}

export function createInstallState(secret, options = {}) {
  const now = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  return createSignedToken({
    type: 'github_app_install_state',
    nonce: randomBytes(18).toString('base64url'),
    iat: now,
    exp: now + (options.ttlSeconds ?? DEFAULT_STATE_TTL_SECONDS),
    returnTo: options.returnTo ?? '/'
  }, secret);
}

export function createInstallationSession(installationId, secret, options = {}) {
  const now = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  const numericId = Number(installationId);
  if (!Number.isSafeInteger(numericId) || numericId <= 0) throw new Error('Invalid GitHub installation ID.');
  return createSignedToken({
    type: 'github_app_installation',
    installationId: numericId,
    iat: now,
    exp: now + (options.ttlSeconds ?? DEFAULT_SESSION_TTL_SECONDS)
  }, secret);
}

export function readInstallationSession(request, secret) {
  const cookies = parseCookies(request?.headers?.cookie ?? request?.headers?.Cookie ?? '');
  const payload = verifySignedToken(cookies.avgl_github_installation, secret);
  if (!payload || payload.type !== 'github_app_installation') return null;
  return payload;
}

export function readInstallState(request, secret) {
  const cookies = parseCookies(request?.headers?.cookie ?? request?.headers?.Cookie ?? '');
  const payload = verifySignedToken(cookies.avgl_github_state, secret);
  if (!payload || payload.type !== 'github_app_install_state') return null;
  return { token: cookies.avgl_github_state, payload };
}

export function serializeCookie(name, value, options = {}) {
  const parts = [name + '=' + encodeURIComponent(value)];
  parts.push('Path=' + (options.path ?? '/'));
  if (options.httpOnly !== false) parts.push('HttpOnly');
  if (options.secure !== false) parts.push('Secure');
  parts.push('SameSite=' + (options.sameSite ?? 'Lax'));
  if (Number.isFinite(options.maxAge)) parts.push('Max-Age=' + Math.max(0, Math.floor(options.maxAge)));
  return parts.join('; ');
}

export function clearCookie(name) {
  return serializeCookie(name, '', { maxAge: 0 });
}

export function createGitHubAppJwt(options = {}) {
  const appId = String(options.appId ?? '').trim();
  const privateKey = normalizePrivateKey(options.privateKey);
  if (!appId || !privateKey) throw new Error('GitHub App credentials are not configured.');

  const now = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    iat: now - 30,
    exp: now + 540,
    iss: appId
  }));
  const unsigned = header + '.' + payload;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  return unsigned + '.' + signer.sign(privateKey).toString('base64url');
}

async function expectJson(fetchImpl, url, options = {}) {
  const response = await fetchImpl(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload?.message || 'GitHub App request failed with status ' + response.status + '.');
    error.statusCode = response.status;
    throw error;
  }
  return payload;
}

export async function mintInstallationToken(installationId, options = {}) {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const appJwt = createGitHubAppJwt(options);
  const payload = await expectJson(
    fetchImpl,
    'https://api.github.com/app/installations/' + encodeURIComponent(String(installationId)) + '/access_tokens',
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + appJwt,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'AVGL/0.4'
      }
    }
  );
  if (typeof payload.token !== 'string' || !payload.token) throw new Error('GitHub did not return an installation token.');
  return {
    token: payload.token,
    expiresAt: payload.expires_at ?? null,
    permissions: payload.permissions ?? {},
    repositories: payload.repositories ?? null
  };
}

export async function listInstallationRepositories(installationId, options = {}) {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const minted = await mintInstallationToken(installationId, options);
  const repositories = [];
  let page = 1;
  while (page <= 10) {
    const payload = await expectJson(
      fetchImpl,
      'https://api.github.com/installation/repositories?per_page=100&page=' + page,
      {
        headers: {
          Authorization: 'Bearer ' + minted.token,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'AVGL/0.4'
        }
      }
    );
    repositories.push(...(payload.repositories ?? []));
    if ((payload.repositories ?? []).length < 100) break;
    page += 1;
  }
  return {
    token: minted.token,
    expiresAt: minted.expiresAt,
    repositories: repositories.map((repo) => ({
      id: repo.id,
      fullName: repo.full_name,
      private: Boolean(repo.private),
      defaultBranch: repo.default_branch,
      permissions: repo.permissions ?? {}
    }))
  };
}

export function buildInstallationUrl(appSlug, state) {
  const slug = String(appSlug ?? '').trim();
  if (!/^[A-Za-z0-9-]+$/.test(slug)) throw new Error('GITHUB_APP_SLUG is not configured.');
  const url = new URL('https://github.com/apps/' + slug + '/installations/new');
  if (state) url.searchParams.set('state', state);
  return url.toString();
}

export function githubAppConfigFromEnv(env = process.env) {
  return {
    appId: env.GITHUB_APP_ID,
    appSlug: env.GITHUB_APP_SLUG,
    privateKey: env.GITHUB_APP_PRIVATE_KEY,
    sessionSecret: env.AVGL_SESSION_SECRET
  };
}

export async function resolveGitHubAccess(request, body = {}, options = {}) {
  if (body?.accessMode !== 'github_app') {
    return { mode: 'public', token: options.publicToken ?? process.env.GITHUB_TOKEN ?? undefined, installationId: null };
  }

  const config = options.config ?? githubAppConfigFromEnv(options.env);
  if (!config.sessionSecret) throw Object.assign(new Error('Private repository sessions are not configured.'), { statusCode: 503 });

  const session = readInstallationSession(request, config.sessionSecret);
  if (!session) throw Object.assign(new Error('GitHub App session is missing or expired.'), { statusCode: 401 });

  const minted = await mintInstallationToken(session.installationId, {
    appId: config.appId,
    privateKey: config.privateKey,
    fetchImpl: options.fetchImpl
  });
  return {
    mode: 'github_app',
    token: minted.token,
    installationId: session.installationId,
    expiresAt: minted.expiresAt
  };
}
