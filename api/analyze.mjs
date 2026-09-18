import { analyzeGitHubRepository } from '../src/index.js';

const MAX_BODY_BYTES = 8 * 1024;

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Use POST /api/analyze.' });
  }

  const length = Number(request.headers['content-length'] ?? 0);
  if (length > MAX_BODY_BYTES) return response.status(413).json({ error: 'Request body is too large.' });

  const repository = typeof request.body?.repository === 'string' ? request.body.repository.trim() : '';
  const scanStrategy = request.body?.scanStrategy === 'bounded' ? 'bounded' : 'full';
  if (!repository) return response.status(400).json({ error: 'repository is required.' });

  try {
    const ir = await analyzeGitHubRepository(repository, {
      token: process.env.GITHUB_TOKEN || undefined,
      scanStrategy,
      maxFiles: 120,
      concurrency: scanStrategy === 'full' ? 12 : 8,
      batchSize: scanStrategy === 'full' ? 64 : 48,
      treeConcurrency: 6
    });
    return response.status(200).json({ ir });
  } catch (error) {
    const status = Number.isInteger(error?.statusCode) && error.statusCode >= 400 && error.statusCode < 500
      ? error.statusCode
      : 422;
    return response.status(status).json({ error: error?.message || 'Repository analysis failed.' });
  }
}
