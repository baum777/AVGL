import {
  buildOAuthAuthorizeUrl,
  clearCookie,
  createOAuthState,
  githubAppConfigFromEnv,
  readInstallState,
  resolvePublicOrigin,
  serializeCookie,
  verifySignedToken
} from '../../src/github-app-auth.js';

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error:'Use GET /api/github-app/callback.' });
  }

  try {
    const config = githubAppConfigFromEnv();
    if (!config.sessionSecret || !config.clientId) {
      return response.status(503).json({ error:'GitHub App OAuth is not configured.' });
    }

    const stateCookie = readInstallState(request, config.sessionSecret);
    const queryState = typeof request.query?.state === 'string' ? request.query.state : '';
    const queryPayload = verifySignedToken(queryState, config.sessionSecret);
    if (!stateCookie || !queryPayload || stateCookie.token !== queryState) {
      return response.status(401).json({ error:'Invalid or expired GitHub App installation state.' });
    }

    const installationId = Number(request.query?.installation_id);
    if (!Number.isSafeInteger(installationId) || installationId <= 0) {
      return response.status(400).json({ error:'installation_id is required.' });
    }

    const origin = resolvePublicOrigin(config);
    const redirectUri = origin + '/api/github-app/oauth-callback';
    const oauthState = createOAuthState(installationId, config.sessionSecret, {
      returnTo:queryPayload.returnTo || '/'
    });

    response.setHeader('Set-Cookie', [
      serializeCookie('avgl_github_oauth_state', oauthState, { maxAge:600 }),
      clearCookie('avgl_github_state')
    ]);
    response.statusCode = 302;
    response.setHeader('Location', buildOAuthAuthorizeUrl(config.clientId, redirectUri, oauthState));
    return response.end();
  } catch (error) {
    return response.status(500).json({ error:error?.message || 'GitHub App setup callback failed.' });
  }
}
