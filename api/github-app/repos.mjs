import { githubAppConfigFromEnv, listInstallationRepositories, readInstallationSession } from '../../src/github-app-auth.js';

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Use GET /api/github-app/repos.' });
  }

  try {
    const config = githubAppConfigFromEnv();
    if (!config.sessionSecret) return response.status(503).json({ error: 'GitHub App sessions are not configured.' });
    const session = readInstallationSession(request, config.sessionSecret);
    if (!session) return response.status(401).json({ error: 'GitHub App session is missing or expired.' });

    const result = await listInstallationRepositories(session.installationId, {
      appId: config.appId,
      privateKey: config.privateKey
    });
    return response.status(200).json({
      installationId: session.installationId,
      repositories: result.repositories,
      tokenExpiresAt: result.expiresAt
    });
  } catch (error) {
    const status = Number.isInteger(error?.statusCode) ? error.statusCode : 422;
    return response.status(status).json({ error: error?.message || 'Could not list installation repositories.' });
  }
}
