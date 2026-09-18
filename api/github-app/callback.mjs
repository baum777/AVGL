import {
  clearCookie,
  createInstallationSession,
  githubAppConfigFromEnv,
  readInstallState,
  serializeCookie,
  verifySignedToken
} from '../../src/github-app-auth.js';

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Use GET /api/github-app/callback.' });
  }

  try {
    const config = githubAppConfigFromEnv();
    if (!config.sessionSecret) return response.status(503).json({ error: 'GitHub App sessions are not configured.' });

    const stateCookie = readInstallState(request, config.sessionSecret);
    const queryState = typeof request.query?.state === 'string' ? request.query.state : '';
    const queryPayload = verifySignedToken(queryState, config.sessionSecret);
    if (!stateCookie || !queryPayload || stateCookie.token !== queryState) {
      return response.status(401).json({ error: 'Invalid or expired GitHub App installation state.' });
    }

    const installationId = Number(request.query?.installation_id);
    if (!Number.isSafeInteger(installationId) || installationId <= 0) {
      return response.status(400).json({ error: 'installation_id is required.' });
    }

    const session = createInstallationSession(installationId, config.sessionSecret);
    response.setHeader('Set-Cookie', [
      serializeCookie('avgl_github_installation', session, { maxAge: 3600 }),
      clearCookie('avgl_github_state')
    ]);
    response.statusCode = 302;
    response.setHeader('Location', queryPayload.returnTo || '/?github=connected');
    return response.end();
  } catch (error) {
    return response.status(500).json({ error: error?.message || 'GitHub App callback failed.' });
  }
}
