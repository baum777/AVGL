function validPart(value) {
  return /^[A-Za-z0-9_.-]+$/.test(value) && value !== '.' && value !== '..';
}

export function parseGitHubRepository(input) {
  const value = String(input ?? '').trim();
  if (!value) throw Object.assign(new Error('A GitHub repository is required.'), { statusCode: 400 });

  let owner;
  let repo;
  if (/^https?:\/\//i.test(value)) {
    const url = new URL(value);
    if (!['github.com', 'www.github.com'].includes(url.hostname.toLowerCase())) {
      throw Object.assign(new Error('Only github.com repository URLs are supported.'), { statusCode: 400 });
    }
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length !== 2) {
      throw Object.assign(new Error('Use a repository URL such as https://github.com/owner/repo.'), { statusCode: 400 });
    }
    [owner, repo] = parts;
  } else {
    const parts = value.split('/').filter(Boolean);
    if (parts.length !== 2) {
      throw Object.assign(new Error('Use owner/repo or a github.com repository URL.'), { statusCode: 400 });
    }
    [owner, repo] = parts;
  }

  repo = repo.replace(/\.git$/i, '');
  if (!validPart(owner) || !validPart(repo)) {
    throw Object.assign(new Error('The GitHub repository identifier is invalid.'), { statusCode: 400 });
  }

  return {
    owner,
    repo,
    slug: `${owner}/${repo}`,
    url: `https://github.com/${owner}/${repo}`
  };
}

export function githubHeaders(token, raw = false) {
  const headers = {
    Accept: raw ? 'text/plain' : 'application/vnd.github+json',
    'User-Agent': 'AVGL/0.2'
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function expectGitHubJson(fetchImpl, url, token) {
  const response = await fetchImpl(url, { headers: githubHeaders(token) });
  if (!response.ok) {
    const error = new Error(
      response.status === 403 || response.status === 429
        ? 'GitHub rate limit or access policy blocked the request.'
        : `GitHub request failed with status ${response.status}.`
    );
    error.statusCode = response.status;
    throw error;
  }
  return response.json();
}

async function mapConcurrent(items, limit, worker) {
  const output = new Array(items.length);
  let cursor = 0;

  async function run() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      output[index] = await worker(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(Math.max(1, limit), items.length || 1) }, () => run()));
  return output;
}

async function walkTree(apiBase, rootSha, options) {
  const fetchImpl = options.fetchImpl;
  const token = options.token;
  const concurrency = options.treeConcurrency ?? 6;
  const entries = [];
  const queue = [{ sha: rootSha, prefix: '' }];

  while (queue.length > 0) {
    const batch = queue.splice(0, concurrency);
    const trees = await mapConcurrent(batch, concurrency, async (item) => {
      const tree = await expectGitHubJson(
        fetchImpl,
        `${apiBase}/git/trees/${encodeURIComponent(item.sha)}`,
        token
      );
      if (tree.truncated) {
        throw Object.assign(new Error('GitHub returned a truncated non-recursive tree; a complete scan cannot be guaranteed.'), {
          statusCode: 422
        });
      }
      return { item, tree };
    });

    for (const { item, tree } of trees) {
      for (const entry of tree.tree ?? []) {
        const path = item.prefix ? `${item.prefix}/${entry.path}` : entry.path;
        if (entry.type === 'tree') {
          queue.push({ sha: entry.sha, prefix: path });
        } else {
          entries.push({ ...entry, path });
        }
      }
    }
  }

  return entries;
}

export async function resolveGitHubRevision(input, options = {}) {
  const parsed = typeof input === 'string' ? parseGitHubRepository(input) : input;
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  if (typeof fetchImpl !== 'function') throw new Error('No fetch implementation is available.');

  const token = options.token;
  const apiBase = `https://api.github.com/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}`;
  const repository = options.repository ?? await expectGitHubJson(fetchImpl, apiBase, token);
  const requested = options.ref ?? repository.default_branch;
  if (!requested) throw Object.assign(new Error('The GitHub repository has no resolvable revision.'), { statusCode: 422 });

  const commit = await expectGitHubJson(
    fetchImpl,
    `${apiBase}/commits/${encodeURIComponent(requested)}`,
    token
  );
  if (typeof commit.sha !== 'string' || !/^[a-f0-9]{40}$/i.test(commit.sha)) {
    throw Object.assign(new Error('GitHub did not return an immutable commit SHA.'), { statusCode: 422 });
  }
  return {
    parsed,
    repository,
    requestedRef:requested,
    sha:commit.sha
  };
}

export async function fetchCompleteGitHubTree(input, options = {}) {
  const parsed = typeof input === 'string' ? parseGitHubRepository(input) : input;
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  if (typeof fetchImpl !== 'function') throw new Error('No fetch implementation is available.');

  const token = options.token;
  const apiBase = `https://api.github.com/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}`;
  const repository = options.repository ?? await expectGitHubJson(fetchImpl, apiBase, token);
  const ref = options.ref ?? repository.default_branch;
  if (!ref) {
    throw Object.assign(new Error('The GitHub repository has no default branch.'), { statusCode: 422 });
  }

  const recursive = await expectGitHubJson(
    fetchImpl,
    `${apiBase}/git/trees/${encodeURIComponent(ref)}?recursive=1`,
    token
  );

  if (!recursive.truncated) {
    return {
      parsed,
      repository,
      ref,
      apiBase,
      entries: recursive.tree ?? [],
      treeComplete: true,
      treeFallbackUsed: false
    };
  }

  if (!recursive.sha) {
    throw Object.assign(new Error('GitHub truncated the repository tree without returning a root tree SHA.'), {
      statusCode: 422
    });
  }

  const entries = await walkTree(apiBase, recursive.sha, {
    fetchImpl,
    token,
    treeConcurrency: options.treeConcurrency
  });

  return {
    parsed,
    repository,
    ref,
    apiBase,
    entries,
    treeComplete: true,
    treeFallbackUsed: true
  };
}
