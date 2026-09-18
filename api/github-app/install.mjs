import { buildInstallationUrl, createInstallState, githubAppConfigFromEnv, serializeCookie } from '../../src/github-app-auth.js';

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Use GET /api/github-app/install.' });
  }

  try {
    const config = githubAppConfigFromEnv();
    if (!config.appSlug || !config.sessionSecret) {
      return response.status(503).json({ error: 'GitHub App installation is not configured.' });
    }

    const returnTo = typeof request.query?.returnTo === 'string' && request.query.returnTo.startsWith('/')
      ? request.query.returnTo
      : '/';
    const state = createInstallState(config.sessionSecret, { returnTo });
    response.setHeader('Set-Cookie', serializeCookie('avgl_github_state', state, { maxAge: 600 }));
    response.statusCode = 302;
    response.setHeader('Location', buildInstallationUrl(config.appSlug, state));
    return response.end();
  } catch (error) {
    return response.status(500).json({ error: error?.message || 'GitHub App install flow failed.' });
  }
}
