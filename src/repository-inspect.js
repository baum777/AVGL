import { sourceKindForPath } from './discover.js';
import { expectGitHubJson, fetchCompleteGitHubTree, parseGitHubRepository } from './github-tree.js';

const MAX_DETAIL_BYTES = 320 * 1024;
const MAX_CHAT_FILE_BYTES = 96 * 1024;

export function parseRepository(input) {
  const parsed = parseGitHubRepository(input);
  return { owner: parsed.owner, repo: parsed.repo, slug: parsed.slug };
}

export async function fetchRepositoryInventory(input, options = {}) {
  const tree = await fetchCompleteGitHubTree(input, {
    fetchImpl: options.fetchImpl ?? globalThis.fetch,
    token: options.token,
    ref: options.ref,
    treeConcurrency: options.treeConcurrency
  });

  const files = tree.entries
    .filter((entry) => entry.type === 'blob' && typeof entry.path === 'string')
    .map((entry) => ({
      path: entry.path,
      size: entry.size ?? 0,
      sha: entry.sha,
      sourceKind: sourceKindForPath(entry.path)
    }));

  return {
    repository: {
      owner: tree.parsed.owner,
      name: tree.parsed.repo,
      slug: tree.parsed.slug,
      url: tree.parsed.url,
      description: tree.repository.description ?? '',
      defaultBranch: tree.ref,
      private: Boolean(tree.repository.private)
    },
    treeTruncated: false,
    treeComplete: Boolean(tree.treeComplete),
    treeFallbackUsed: Boolean(tree.treeFallbackUsed),
    files
  };
}

function encodedPath(path) {
  return String(path).split('/').filter(Boolean).map(encodeURIComponent).join('/');
}

export async function fetchRepositoryFile(input, filePath, options = {}) {
  const inventory = options.inventory ?? await fetchRepositoryInventory(input, options);
  const file = inventory.files.find((candidate) => candidate.path === filePath);
  if (!file) throw Object.assign(new Error('File not found in repository tree.'), { statusCode: 404 });

  const maxBytes = options.maxBytes ?? MAX_DETAIL_BYTES;
  if (file.size > maxBytes) {
    return { ...file, content: null, tooLarge: true, ref: inventory.repository.defaultBranch };
  }

  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const parsed = parseRepository(input);
  const token = options.token;
  const url = `https://api.github.com/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}/contents/${encodedPath(filePath)}?ref=${encodeURIComponent(inventory.repository.defaultBranch)}`;
  const payload = await expectGitHubJson(fetchImpl, url, token);
  if (payload.type !== 'file' || typeof payload.content !== 'string') {
    throw Object.assign(new Error('GitHub did not return a file payload.'), { statusCode: 422 });
  }
  return {
    ...file,
    sha: payload.sha,
    ref: inventory.repository.defaultBranch,
    content: Buffer.from(payload.content.replace(/\n/g, ''), 'base64').toString('utf8'),
    tooLarge: false
  };
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function firstHeading(content) {
  return content.match(/^#{1,3}\s+(.+)$/m)?.[1]?.trim() ?? null;
}

function exportedSymbols(content) {
  const symbols = [];
  const patterns = [
    /export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g,
    /export\s+class\s+([A-Za-z_$][\w$]*)/g,
    /export\s+const\s+([A-Za-z_$][\w$]*)/g,
    /module\.exports\s*=\s*\{([^}]+)\}/g
  ];
  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      if (match[1]?.includes(',')) symbols.push(...match[1].split(',').map((part) => part.trim().split(':')[0]));
      else symbols.push(match[1]);
      if (symbols.length >= 12) break;
    }
  }
  return unique(symbols).slice(0, 12);
}

function codeSymbols(content) {
  const values = [...exportedSymbols(content)];
  for (const match of content.matchAll(/(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g)) values.push(match[1]);
  for (const match of content.matchAll(/class\s+([A-Za-z_$][\w$]*)\s*/g)) values.push(match[1]);
  return unique(values).slice(0, 12);
}

function semanticSignals(content) {
  const rules = [
    ['WHO', /\b(agent|assistant|worker|role|harness|systemPrompt|instructions)\b/i],
    ['KNOW', /\b(context|memory|retrieval|rag|knowledge|resource|state)\b/i],
    ['THINK', /\b(model|llm|reasoning|planner|planning|handoff|subagent|routing)\b/i],
    ['CAN', /\b(tool|mcp|adapter|connector|browser|filesystem|shell|api)\b/i],
    ['MAY', /\b(permission|approval|authorize|policy|grant|scope|deny|allow)\b/i],
    ['ACT', /\b(execute|dispatch|send|write|commit|push|deploy|mutation|fetch\()\b/i],
    ['DID', /\b(receipt|audit|verify|validation|evidence|trace|observability|outcome)\b/i]
  ];
  return rules.filter(([, pattern]) => pattern.test(content)).map(([name]) => name);
}

function roleForPath(path) {
  const lower = path.toLowerCase();
  const table = [
    [/^api\//, ['Server API endpoint', 'Server-API-Endpunkt']],
    [/^web\//, ['Browser interface', 'Browser-Oberfläche']],
    [/^runtime\/permissions\//, ['Runtime permission enforcement', 'Runtime-Berechtigungsdurchsetzung']],
    [/^runtime\/auth\//, ['Runtime identity and claim binding', 'Runtime-Identitäts- und Claim-Bindung']],
    [/^runtime\/observability\//, ['Runtime evidence and observability', 'Runtime-Evidence und Observability']],
    [/^runtime\//, ['Runtime implementation', 'Runtime-Implementierung']],
    [/(^|\/)tests?\//, ['Automated test', 'Automatisierter Test']],
    [/(^|\/)docs?\//, ['Documentation', 'Dokumentation']],
    [/(^|\/)contracts?\//, ['Contract or configuration surface', 'Contract- oder Konfigurationsfläche']],
    [/(^|\/)schema\//, ['Schema definition', 'Schema-Definition']],
    [/(^|\/)scripts?\//, ['Repository tooling', 'Repository-Tooling']],
    [/(^|\/)\.github\//, ['CI / repository automation', 'CI- / Repository-Automation']],
    [/(^|\/)(\.agents|\.claude)\//, ['Agent instructions / skill surface', 'Agent-Instruktions- / Skill-Fläche']]
  ];
  return table.find(([pattern]) => pattern.test(lower))?.[1] ?? ['Repository file', 'Repository-Datei'];
}

export function summarizeRepositoryFile(file) {
  const path = file.path;
  const content = file.content ?? '';
  const role = roleForPath(path);
  const sourceKind = file.sourceKind ?? sourceKindForPath(path);
  const symbols = content ? codeSymbols(content) : [];
  const heading = content ? firstHeading(content) : null;
  let jsonMeta = null;
  if (content && /\.json$/i.test(path)) {
    try {
      const parsed = JSON.parse(content);
      jsonMeta = {
        title: typeof parsed.title === 'string' ? parsed.title : null,
        description: typeof parsed.description === 'string' ? parsed.description : null,
        schemaVersion: parsed.schemaVersion ?? parsed.version ?? null,
        keys: Object.keys(parsed).slice(0, 12)
      };
    } catch {
      jsonMeta = null;
    }
  }

  const name = path.split('/').pop();
  const subject = jsonMeta?.title || heading || name;
  const symbolEn = symbols.length ? ` Exposes or defines: ${symbols.slice(0, 6).join(', ')}.` : '';
  const symbolDe = symbols.length ? ` Definiert bzw. exportiert: ${symbols.slice(0, 6).join(', ')}.` : '';
  const jsonEn = jsonMeta?.description ? ` Declared purpose: ${jsonMeta.description}` : '';
  const jsonDe = jsonMeta?.description ? ` Enthält eine deklarierte Beschreibung im Source: ${jsonMeta.description}` : '';

  return {
    path,
    size: file.size ?? Buffer.byteLength(content, 'utf8'),
    sourceKind,
    role: { en: role[0], de: role[1] },
    subject,
    summary: {
      en: `${role[0]} “${subject}”.${symbolEn}${jsonEn}`.trim(),
      de: `${role[1]} „${subject}“.${symbolDe}${jsonDe}`.trim()
    },
    semanticClasses: [],
    semanticSource: 'canonical-ir',
    symbols,
    lineCount: content ? content.split(/\r?\n/).length : null,
    jsonMeta,
    excerpt: content ? content.slice(0, 12000) : '',
    tooLarge: Boolean(file.tooLarge)
  };
}

function tokenize(value) {
  return unique(String(value ?? '').toLowerCase().match(/[a-z0-9_.-]{3,}/g) ?? []);
}

export function rankRelevantFiles(files, question, options = {}) {
  const terms = tokenize(question);
  const activeFile = options.activeFile ?? null;
  const evidencePaths = new Set(options.evidencePaths ?? []);
  const preferred = ['readme.md', 'package.json', 'agents.md', 'src/index.js', 'runtime/cli/runtime-dry-run.mjs'];

  return files
    .map((file) => {
      const lower = file.path.toLowerCase();
      let score = 0;
      if (file.path === activeFile) score += 1000;
      if (evidencePaths.has(file.path)) score += 40;
      for (const term of terms) {
        if (lower.includes(term)) score += 12;
        if (lower.split('/').pop()?.includes(term)) score += 8;
      }
      const preferredIndex = preferred.indexOf(lower);
      if (preferredIndex >= 0) score += 8 - preferredIndex;
      if (file.sourceKind === 'implementation') score += 2;
      if (file.sourceKind === 'config') score += 1;
      return { ...file, score };
    })
    .filter((file) => file.score > 0)
    .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));
}

export async function fetchChatContextFiles(input, question, options = {}) {
  const inventory = options.inventory ?? await fetchRepositoryInventory(input, options);
  const ranked = rankRelevantFiles(inventory.files, question, options);
  const fallback = inventory.files
    .filter((file) => ['README.md', 'AGENTS.md', 'package.json'].includes(file.path))
    .map((file) => ({ ...file, score: 1 }));
  const candidates = unique([...ranked, ...fallback].map((item) => item.path)).slice(0, 6);
  const results = [];
  for (const path of candidates) {
    try {
      const file = await fetchRepositoryFile(input, path, { ...options, inventory, maxBytes: MAX_CHAT_FILE_BYTES });
      if (file.content) results.push({ path, content: file.content.slice(0, 16000), sourceKind: file.sourceKind });
    } catch {
      // Bounded assistant context: one unreadable file must not fail the full chat request.
    }
  }
  return { inventory, files: results };
}
