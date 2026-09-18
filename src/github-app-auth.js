import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  createSign,
  randomBytes,
  timingSafeEqual
} from 'node:crypto';

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

function sessionKey(secret) {
  if (!secret) throw new Error('A session secret is required.');
  return createHash('sha256').update(String(secret)).digest();
}

function normalizeOrigin(value) {
  const url = new URL(String(value ?? ''));
  if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
    throw new Error('AVGL_PUBLIC_ORIGIN must use HTTPS.');
  }
  return url.origin;
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

export function createSealedToken(payload, secret) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', sessionKey(secret), iv);
  const plaintext = Buffer.from(JSON.stringify(payload), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, ciphertext, tag].map((part) => part.toString('base64url')).join('.');
}

export function openSealedToken(token, secret, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (!token || !secret) return null;
  const parts = String(token).split('.');
  if (parts.length !== 3) return null;
  try {
    const [iv, ciphertext, tag] = parts.map((part) => Buffer.from(part, 'base64url'));
    const decipher = createDecipheriv('aes-256-gcm', sessionKey(secret), iv);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    const payload = JSON.parse(plaintext.toString('utf8'));
    if (typeof payload.exp === 'number' && payload.exp < nowSeconds) return null;
    return payload;
  } catch {
    return null;
  }
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

export function createOAuthState(installationId, secret, options = {}) {
  const now = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  const numericId = Number(installationId);
  if (!Number.isSafeInteger(numericId) || numericId <= 0) throw new Error('Invalid GitHub installation ID.');
  return createSignedToken({
    type: 'github_app_user_oauth_state',
    installationId: numericId,
    nonce: randomBytes(18).toString('base64url'),
    iat: now,
    exp: now + (options.ttlSeconds ?? DEFAULT_STATE_TTL_SECONDS),
    returnTo: options.returnTo ?? '/'
  }, secret);
}

export function createUserSession(session, secret, options = {}) {
  const now = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  const installationId = Number(session?.installationId);
  if (!Number.isSafeInteger(installationId) || installationId <= 0) throw new Error('Invalid GitHub installation ID.');
  if (typeof session?.accessToken !== 'string' || !session.accessToken) throw new Error('GitHub user access token is required.');

  const tokenTtl = Number.isFinite(session.expiresIn)
    ? Math.max(60, Math.floor(session.expiresIn) - 60)
    : DEFAULT_SESSION_TTL_SECONDS;
  const ttl = Math.min(options.ttlSeconds ?? DEFAULT_SESSION_TTL_SECONDS, tokenTtl);

  return {
    token:createSealedToken({
      type:'github_app_user_session',
      installationId,
      accessToken:session.accessToken,
      user:session.user ?? null,
      iat:now,
      exp:now + ttl
    }, secret),
    ttl
  };
}

export function readUserSession(request, secret) {
  const cookies = parseCookies(request?.headers?.cookie ?? request?.headers?.Cookie ?? '');
  const payload = openSealedToken(cookies.avgl_github_user_session, secret);
  if (!payload || payload.type !== 'github_app_user_session') return null;
  return payload;
}

export function readInstallState(request, secret) {
  const cookies = parseCookies(request?.headers?.cookie ?? request?.headers?.Cookie ?? '');
  const payload = verifySignedToken(cookies.avgl_github_state, secret);
  if (!payload || payload.type !== 'github_app_install_state') return null;
  return { token:cookies.avgl_github_state, payload };
}

export function readOAuthState(request, secret) {
  const cookies = parseCookies(request?.headers?.cookie ?? request?.headers?.Cookie ?? '');
  const payload = verifySignedToken(cookies.avgl_github_oauth_state, secret);
  if (!payload || payload.type !== 'github_app_user_oauth_state') return null;
  return { token:cookies.avgl_github_oauth_state, payload };
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
  return serializeCookie(name, '', { maxAge:0 });
}

export function createGitHubAppJwt(options = {}) {
  const appId = String(options.appId ?? '').trim();
  const privateKey = normalizePrivateKey(options.privateKey);
  if (!appId || !privateKey) throw new Error('GitHub App credentials are not configured.');

  const now = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg:'RS256', typ:'JWT' }));
  const payload = base64url(JSON.stringify({
    iat:now - 30,
    exp:now + 540,
    iss:appId
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
    const error = new Error(payload?.message || payload?.error_description || 'GitHub request failed with status ' + response.status + '.');
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
      method:'POST',
      headers:{
        Authorization:'Bearer ' + appJwt,
        Accept:'application/vnd.github+json',
        'User-Agent':'AVGL/0.5'
      }
    }
  );
  if (typeof payload.token !== 'string' || !payload.token) throw new Error('GitHub did not return an installation token.');
  return {
    token:payload.token,
    expiresAt:payload.expires_at ?? null,
    permissions:payload.permissions ?? {},
    repositories:payload.repositories ?? null
  };
}

export function buildInstallationUrl(appSlug, state) {
  const slug = String(appSlug ?? '').trim();
  if (!/^[A-Za-z0-9-]+$/.test(slug)) throw new Error('GITHUB_APP_SLUG is not configured.');
  const url = new URL('https://github.com/apps/' + slug + '/installations/new');
  if (state) url.searchParams.set('state', state);
  return url.toString();
}

export function buildOAuthAuthorizeUrl(clientId, redirectUri, state) {
  const id = String(clientId ?? '').trim();
  if (!id) throw new Error('GITHUB_APP_CLIENT_ID is not configured.');
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', id);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);
  return url.toString();
}

export async function exchangeOAuthCode(code, options = {}) {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  if (!options.clientId || !options.clientSecret) throw new Error('GitHub App OAuth client credentials are not configured.');
  const payload = await expectJson(fetchImpl, 'https://github.com/login/oauth/access_token', {
    method:'POST',
    headers:{
      Accept:'application/json',
      'Content-Type':'application/json',
      'User-Agent':'AVGL/0.5'
    },
    body:JSON.stringify({
      client_id:options.clientId,
      client_secret:options.clientSecret,
      code,
      redirect_uri:options.redirectUri
    })
  });
  if (typeof payload.access_token !== 'string' || !payload.access_token) throw new Error('GitHub did not return a user access token.');
  return {
    accessToken:payload.access_token,
    expiresIn:Number(payload.expires_in) || null,
    refreshToken:typeof payload.refresh_token === 'string' ? payload.refresh_token : null,
    refreshTokenExpiresIn:Number(payload.refresh_token_expires_in) || null
  };
}

async function githubUserRequest(fetchImpl, url, accessToken) {
  return expectJson(fetchImpl, url, {
    headers:{
      Authorization:'Bearer ' + accessToken,
      Accept:'application/vnd.github+json',
      'X-GitHub-Api-Version':'2026-03-10',
      'User-Agent':'AVGL/0.5'
    }
  });
}

export async function listUserInstallationRepositories(installationId, accessToken, options = {}) {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const repositories = [];
  let page = 1;
  while (page <= 10) {
    const payload = await githubUserRequest(
      fetchImpl,
      'https://api.github.com/user/installations/' + encodeURIComponent(String(installationId)) + '/repositories?per_page=100&page=' + page,
      accessToken
    );
    repositories.push(...(payload.repositories ?? []));
    if ((payload.repositories ?? []).length < 100) break;
    page += 1;
  }
  return repositories.map((repo) => ({
    id:repo.id,
    fullName:repo.full_name,
    private:Boolean(repo.private),
    defaultBranch:repo.default_branch,
    permissions:repo.permissions ?? {}
  }));
}

export async function verifyUserInstallationAccess(installationId, accessToken, options = {}) {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const [user, repositories] = await Promise.all([
    githubUserRequest(fetchImpl, 'https://api.github.com/user', accessToken),
    listUserInstallationRepositories(installationId, accessToken, { fetchImpl })
  ]);
  return {
    user:{
      id:user.id,
      login:user.login,
      avatarUrl:user.avatar_url ?? null
    },
    repositories
  };
}

export function githubAppConfigFromEnv(env = process.env) {
  return {
    appId:env.GITHUB_APP_ID,
    appSlug:env.GITHUB_APP_SLUG,
    privateKey:env.GITHUB_APP_PRIVATE_KEY,
    clientId:env.GITHUB_APP_CLIENT_ID,
    clientSecret:env.GITHUB_APP_CLIENT_SECRET,
    sessionSecret:env.AVGL_SESSION_SECRET,
    publicOrigin:env.AVGL_PUBLIC_ORIGIN
  };
}

export function resolvePublicOrigin(config) {
  if (!config?.publicOrigin) throw new Error('AVGL_PUBLIC_ORIGIN is not configured.');
  return normalizeOrigin(config.publicOrigin);
}

export async function resolveGitHubAccess(request, body = {}, options = {}) {
  if (body?.accessMode !== 'github_app') {
    return {
      mode:'public',
      token:options.publicToken ?? process.env.GITHUB_TOKEN ?? undefined,
      installationId:null,
      user:null
    };
  }

  const config = options.config ?? githubAppConfigFromEnv(options.env);
  if (!config.sessionSecret) throw Object.assign(new Error('Private repository sessions are not configured.'), { statusCode:503 });

  const session = readUserSession(request, config.sessionSecret);
  if (!session) throw Object.assign(new Error('GitHub user session is missing or expired.'), { statusCode:401 });

  return {
    mode:'github_app',
    token:session.accessToken,
    installationId:session.installationId,
    user:session.user ?? null,
    expiresAt:new Date(session.exp * 1000).toISOString()
  };
}
