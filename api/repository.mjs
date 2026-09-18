import { fetchRepositoryInventory } from '../src/repository-inspect.js';

const MAX_BODY_BYTES = 8 * 1024;

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Use POST /api/repository.' });
  }
  if (Number(request.headers['content-length'] ?? 0) > MAX_BODY_BYTES) {
    return response.status(413).json({ error: 'Request body is too large.' });
  }
  const repository = typeof request.body?.repository === 'string' ? request.body.repository.trim() : '';
  if (!repository) return response.status(400).json({ error: 'repository is required.' });

  try {
    const inventory = await fetchRepositoryInventory(repository, { token: process.env.GITHUB_TOKEN || undefined });
    return response.status(200).json(inventory);
  } catch (error) {
    const status = Number.isInteger(error?.statusCode) && error.statusCode >= 400 && error.statusCode < 500 ? error.statusCode : 422;
    return response.status(status).json({ error: error?.message || 'Repository inventory failed.' });
  }
}
