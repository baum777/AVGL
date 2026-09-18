import {
  clearCookie,
  createUserSession,
  exchangeOAuthCode,
  githubAppConfigFromEnv,
  readOAuthState,
  resolvePublicOrigin,
  serializeCookie,
  verifySignedToken,
  verifyUserInstallationAccess
} from '../../src/github-app-auth.js';

function redirectTarget(returnTo) {
  const safe = typeof returnTo === 'string' && returnTo.startsWith('/') && !returnTo.startsWith('//')
    ? returnTo
    : '/';
  const url = new URL(safe, 'https://avgl.invalid');
  url.searchParams.set('github', 'connected');
  return url.pathname + url.search + url.hash;
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error:'Use GET /api/github-app/oauth-callback.' });
  }

  try {
    const config = githubAppConfigFromEnv();
    if (!config.sessionSecret || !config.clientId || !config.clientSecret) {
      return response.status(503).json({ error:'GitHub App OAuth is not configured.' });
    }

    const stateCookie = readOAuthState(request, config.sessionSecret);
    const queryState = typeof request.query?.state === 'string' ? request.query.state : '';
    const statePayload = verifySignedToken(queryState, config.sessionSecret);
    if (!stateCookie || !statePayload || stateCookie.token !== queryState) {
      return response.status(401).json({ error:'Invalid or expired GitHub user authorization state.' });
    }

    const code = typeof request.query?.code === 'string' ? request.query.code : '';
    if (!code) return response.status(400).json({ error:'OAuth code is required.' });

    const origin = resolvePublicOrigin(config);
    const redirectUri = origin + '/api/github-app/oauth-callback';
    const oauth = await exchangeOAuthCode(code, {
      clientId:config.clientId,
      clientSecret:config.clientSecret,
      redirectUri
    });

    const verified = await verifyUserInstallationAccess(
      statePayload.installationId,
      oauth.accessToken
    );

    const session = createUserSession({
      installationId:statePayload.installationId,
      accessToken:oauth.accessToken,
      expiresIn:oauth.expiresIn,
      user:verified.user
    }, config.sessionSecret);

    response.setHeader('Set-Cookie', [
      serializeCookie('avgl_github_user_session', session.token, { maxAge:session.ttl }),
      clearCookie('avgl_github_oauth_state')
    ]);
    response.statusCode = 302;
    response.setHeader('Location', redirectTarget(statePayload.returnTo));
    return response.end();
  } catch (error) {
    const status = Number.isInteger(error?.statusCode) && error.statusCode >= 400 && error.statusCode < 600
      ? error.statusCode
      : 500;
    return response.status(status).json({ error:error?.message || 'GitHub user authorization failed.' });
  }
}
