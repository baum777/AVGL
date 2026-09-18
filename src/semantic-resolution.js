export const SEMANTIC_RESOLVER_VERSION = '0.1';

const CANVAS_CONTEXT_PATTERNS = Object.freeze([
  /\.getContext\s*\(\s*['"`](?:2d|webgl2?|bitmaprenderer)['"`]\s*\)/i,
  /\bCanvasRenderingContext(?:2D|WebGL2?)?\b/i,
  /\b(?:context|ctx)\.(?:fillStyle|strokeStyle|fillRect|strokeRect|clearRect|drawImage|measureText|beginPath|closePath|moveTo|lineTo|arc|font|textAlign|textBaseline|save|restore|translate|rotate|scale|setTransform|globalAlpha|globalCompositeOperation)\b/i
]);

const UI_CONTEXT_PATTERNS = Object.freeze([
  /\b(?:React\.)?createContext\s*\(/,
  /\buseContext\s*\(/,
  /\bvm\.createContext\s*\(/
]);

const STRONG_CONTEXT_PATTERNS = Object.freeze([
  /\b(?:create|build|assemble|resolve|load|merge|hydrate|prepare|compose)\w*Context\s*\(/i,
  /\b(?:Agent|Runtime|Execution|Request|Workflow|Tool|Model|Prompt|Conversation|Session|Memory|Retrieval)Context\b/,
  /\b(?:context|ctx)\.(?:messages?|memory|resources?|instructions?|prompts?|systemPrompt|userPrompt|tools?|metadata|history|session|state|variables|inputs?|outputs?)\b/i,
  /\b(?:context|ctx)\s*[:=]\s*.*\b(?:messages?|memory|instructions?|prompts?|tools?|resources?|session|history|workflow|agent|model)\b/i
]);

const MEMORY_RETRIEVAL_PATTERN = /\b(memory|retriev(?:e|al)?|rag|vector(?:store|db)?)\b/i;
const CONTEXT_PATTERN = /\b(context|ctx)\b/i;
const RESOURCE_PATTERN = /\b(knowledge|resource)\b/i;
const SUPPORTING_AGENTIC_PATTERN = /\b(agent|assistant|worker|workflow|runtime|model|llm|prompt|tool|memory|retrieval|message|conversation|session|instruction|resource|knowledge)\b/i;
const AGENTIC_PATH_PATTERN = /(?:^|[\/_.-])(agent|assistant|workflow|runtime|prompt|context|memory|retrieval|rag|harness|model|llm)(?:[\/_.-]|$)/i;

function windowText(lines, lineIndex, radius = 2) {
  const start = Math.max(0, lineIndex - radius);
  const end = Math.min(lines.length, lineIndex + radius + 1);
  return lines.slice(start, end).join('\n');
}

function accepted(rule, reason) {
  return { accepted: true, mode: 'SEMANTIC', resolver: 'know.context.v1', rule, reason };
}

function rejected(rule, reason) {
  return { accepted: false, mode: 'SEMANTIC', resolver: 'know.context.v1', rule, reason };
}

function resolveKnowContext({ path, line, lines, lineIndex }) {
  const current = String(line ?? '');
  const surrounding = windowText(lines ?? [current], lineIndex ?? 0);
  const pathText = String(path ?? '');

  if (CANVAS_CONTEXT_PATTERNS.some((pattern) => pattern.test(current))) {
    return rejected(
      'canvas-rendering-context',
      'The token "context" resolves to a Canvas/WebGL rendering context, not an agentic context surface.'
    );
  }

  if (UI_CONTEXT_PATTERNS.some((pattern) => pattern.test(current))) {
    return rejected(
      'ui-or-vm-context',
      'The token "context" resolves to a UI/framework or VM context rather than an agentic context surface.'
    );
  }

  if (MEMORY_RETRIEVAL_PATTERN.test(current) || MEMORY_RETRIEVAL_PATTERN.test(surrounding)) {
    return accepted(
      'memory-retrieval-surface',
      'Memory or retrieval semantics provide an agentic KNOW surface.'
    );
  }

  if (STRONG_CONTEXT_PATTERNS.some((pattern) => pattern.test(current) || pattern.test(surrounding))) {
    return accepted(
      'agentic-context-api',
      'The context token participates in an explicit agent/runtime context API or structured context field.'
    );
  }

  if (CONTEXT_PATTERN.test(current)) {
    if (SUPPORTING_AGENTIC_PATTERN.test(surrounding) || AGENTIC_PATH_PATTERN.test(pathText)) {
      return accepted(
        'agentic-context-neighborhood',
        'The context token is supported by nearby agentic/runtime semantics or an agentic source path.'
      );
    }

    return rejected(
      'unresolved-context-token',
      'A generic context token is insufficient to establish an agentic KNOW surface.'
    );
  }

  if (RESOURCE_PATTERN.test(current)) {
    if (SUPPORTING_AGENTIC_PATTERN.test(surrounding) || AGENTIC_PATH_PATTERN.test(pathText)) {
      return accepted(
        'agentic-resource-neighborhood',
        'The resource/knowledge token is supported by nearby agentic/runtime semantics.'
      );
    }

    return rejected(
      'generic-resource-token',
      'A generic resource/knowledge token is insufficient to establish an agentic KNOW surface.'
    );
  }

  return rejected(
    'unresolved-know-candidate',
    'The lexical KNOW candidate could not be resolved to a supported agentic context, memory, retrieval, or resource surface.'
  );
}

export function resolveSemanticCandidate(candidate) {
  if (candidate?.detector?.id === 'know.context-resource') return resolveKnowContext(candidate);

  return {
    accepted: true,
    mode: 'LEXICAL_FALLBACK',
    resolver: 'legacy.lexical.v0',
    rule: 'not-yet-semantic-resolved',
    reason: 'This detector has not yet been migrated to semantic resolution.'
  };
}

export function createSemanticResolutionSummary() {
  return {
    version: SEMANTIC_RESOLVER_VERSION,
    candidatesSeen: 0,
    accepted: 0,
    rejected: 0,
    semanticAccepted: 0,
    lexicalFallbackAccepted: 0
  };
}

export function recordSemanticResolution(summary, resolution) {
  summary.candidatesSeen += 1;
  if (resolution.accepted) {
    summary.accepted += 1;
    if (resolution.mode === 'SEMANTIC') summary.semanticAccepted += 1;
    else summary.lexicalFallbackAccepted += 1;
  } else {
    summary.rejected += 1;
  }
  return summary;
}

export function mergeSemanticResolutionSummaries(target, source) {
  if (!source) return target;
  target.candidatesSeen += source.candidatesSeen ?? 0;
  target.accepted += source.accepted ?? 0;
  target.rejected += source.rejected ?? 0;
  target.semanticAccepted += source.semanticAccepted ?? 0;
  target.lexicalFallbackAccepted += source.lexicalFallbackAccepted ?? 0;
  return target;
}
