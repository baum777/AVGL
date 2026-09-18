import { analyzeGitHubRepository } from '../src/index.js';
import { resolveGitHubAccess } from '../src/github-app-auth.js';
import { resolveGitHubRevision } from '../src/github-tree.js';
import { createWorkspaceIr, workspaceSummary } from '../src/workspace.js';

const MAX_BODY_BYTES = 128 * 1024;
const MAX_REPOSITORIES = 8;

async function mapConcurrent(items, limit, worker) {
  const output = new Array(items.length);
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor++;
      output[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()));
  return output;
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Use POST /api/workspace.' });
  }
  if (Number(request.headers['content-length'] ?? 0) > MAX_BODY_BYTES) {
    return response.status(413).json({ error: 'Request body is too large.' });
  }

  const repositories = Array.isArray(request.body?.repositories) ? request.body.repositories : [];
  if (repositories.length === 0 || repositories.length > MAX_REPOSITORIES) {
    return response.status(400).json({ error: 'repositories must contain between 1 and ' + MAX_REPOSITORIES + ' entries.' });
  }

  try {
    const access = await resolveGitHubAccess(request, request.body);
    const scanStrategy = request.body?.scanStrategy === 'bounded' ? 'bounded' : 'full';

    const entries = await mapConcurrent(repositories, 2, async (entry, index) => {
      const repository = typeof entry?.repository === 'string' ? entry.repository.trim() : '';
      if (!repository) throw Object.assign(new Error('Repository entry ' + index + ' is missing repository.'), { statusCode: 400 });

      const revision = await resolveGitHubRevision(repository, {
        token: access.token,
        ref: typeof entry.revision === 'string' && entry.revision.trim() ? entry.revision.trim() : undefined
      });

      const ir = await analyzeGitHubRepository(repository, {
        token: access.token,
        ref: revision.sha,
        scanStrategy,
        maxFiles: 120,
        concurrency: scanStrategy === 'full' ? 12 : 8,
        batchSize: scanStrategy === 'full' ? 64 : 48,
        treeConcurrency: 6
      });

      ir.source.revision = revision.sha;
      ir.source.requestedRef = revision.requestedRef;
      ir.sourceAccess = {
        mode: access.mode,
        installationId: access.installationId,
        tokenExpiresAt: access.expiresAt ?? null
      };

      return {
        id: entry.id || revision.parsed.slug,
        revision: revision.sha,
        provides: Array.isArray(entry.provides) ? entry.provides : [],
        packageName: typeof entry.packageName === 'string' ? entry.packageName : undefined,
        dependsOn: Array.isArray(entry.dependsOn) ? entry.dependsOn : [],
        ir
      };
    });

    const workspace = createWorkspaceIr(entries, {
      label: typeof request.body?.label === 'string' ? request.body.label : 'workspace',
      relations: Array.isArray(request.body?.relations) ? request.body.relations : []
    });
    workspace.sourceAccess = {
      mode: access.mode,
      installationId: access.installationId,
      rawSourcePersisted: false
    };

    return response.status(200).json({ workspace, summary: workspaceSummary(workspace) });
  } catch (error) {
    const status = Number.isInteger(error?.statusCode) && error.statusCode >= 400 && error.statusCode < 600
      ? error.statusCode
      : 422;
    return response.status(status).json({ error: error?.message || 'Workspace analysis failed.' });
  }
}
