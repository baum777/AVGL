import { fetchRepositoryFile, summarizeRepositoryFile } from '../src/repository-inspect.js';
import { resolveGitHubAccess } from '../src/github-app-auth.js';

const MAX_BODY_BYTES = 12 * 1024;

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Use POST /api/file.' });
  }
  if (Number(request.headers['content-length'] ?? 0) > MAX_BODY_BYTES) {
    return response.status(413).json({ error: 'Request body is too large.' });
  }
  const repository = typeof request.body?.repository === 'string' ? request.body.repository.trim() : '';
  const path = typeof request.body?.path === 'string' ? request.body.path.trim() : '';
  if (!repository || !path) return response.status(400).json({ error: 'repository and path are required.' });

  try {
    const access = await resolveGitHubAccess(request, request.body);
    const file = await fetchRepositoryFile(repository, path, { token: access.token });
    return response.status(200).json({
      file: summarizeRepositoryFile(file),
      sourceAccess: { mode: access.mode, installationId: access.installationId }
    });
  } catch (error) {
    const status = Number.isInteger(error?.statusCode) && error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 422;
    return response.status(status).json({ error: error?.message || 'File inspection failed.' });
  }
}
