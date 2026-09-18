import {
  githubAppConfigFromEnv,
  listUserInstallationRepositories,
  readUserSession
} from '../../src/github-app-auth.js';

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error:'Use GET /api/github-app/repos.' });
  }

  try {
    const config = githubAppConfigFromEnv();
    if (!config.sessionSecret) {
      return response.status(503).json({ error:'GitHub App sessions are not configured.' });
    }

    const session = readUserSession(request, config.sessionSecret);
    if (!session) {
      return response.status(401).json({ error:'GitHub user session is missing or expired.' });
    }

    const repositories = await listUserInstallationRepositories(
      session.installationId,
      session.accessToken
    );

    return response.status(200).json({
      installationId:session.installationId,
      user:session.user ?? null,
      repositories,
      tokenExpiresAt:new Date(session.exp * 1000).toISOString()
    });
  } catch (error) {
    const status = Number.isInteger(error?.statusCode) ? error.statusCode : 422;
    return response.status(status).json({ error:error?.message || 'Could not list user-accessible installation repositories.' });
  }
}
