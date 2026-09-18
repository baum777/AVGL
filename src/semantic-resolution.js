export const SEMANTIC_RESOLVER_VERSION = '0.3';

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

function accepted(resolver, rule, reason) {
  return { accepted: true, mode: 'SEMANTIC', resolver, rule, reason };
}

function rejected(resolver, rule, reason) {
  return { accepted: false, mode: 'SEMANTIC', resolver, rule, reason };
}

function resolveKnowContext({ path, line, lines, lineIndex }) {
  const current = String(line ?? '');
  const surrounding = windowText(lines ?? [current], lineIndex ?? 0);
  const pathText = String(path ?? '');

  if (CANVAS_CONTEXT_PATTERNS.some((pattern) => pattern.test(current))) {
    return rejected(
      'know.context.v1',
      'canvas-rendering-context',
      'The token "context" resolves to a Canvas/WebGL rendering context, not an agentic context surface.'
    );
  }

  if (UI_CONTEXT_PATTERNS.some((pattern) => pattern.test(current))) {
    return rejected(
      'know.context.v1',
      'ui-or-vm-context',
      'The token "context" resolves to a UI/framework or VM context rather than an agentic context surface.'
    );
  }

  if (MEMORY_RETRIEVAL_PATTERN.test(current) || MEMORY_RETRIEVAL_PATTERN.test(surrounding)) {
    return accepted(
      'know.context.v1',
      'memory-retrieval-surface',
      'Memory or retrieval semantics provide an agentic KNOW surface.'
    );
  }

  if (STRONG_CONTEXT_PATTERNS.some((pattern) => pattern.test(current) || pattern.test(surrounding))) {
    return accepted(
      'know.context.v1',
      'agentic-context-api',
      'The context token participates in an explicit agent/runtime context API or structured context field.'
    );
  }

  if (CONTEXT_PATTERN.test(current)) {
    if (SUPPORTING_AGENTIC_PATTERN.test(surrounding) || AGENTIC_PATH_PATTERN.test(pathText)) {
      return accepted(
        'know.context.v1',
        'agentic-context-neighborhood',
        'The context token is supported by nearby agentic/runtime semantics or an agentic source path.'
      );
    }

    return rejected(
      'know.context.v1',
      'unresolved-context-token',
      'A generic context token is insufficient to establish an agentic KNOW surface.'
    );
  }

  if (RESOURCE_PATTERN.test(current)) {
    if (SUPPORTING_AGENTIC_PATTERN.test(surrounding) || AGENTIC_PATH_PATTERN.test(pathText)) {
      return accepted(
        'know.context.v1',
        'agentic-resource-neighborhood',
        'The resource/knowledge token is supported by nearby agentic/runtime semantics.'
      );
    }

    return rejected(
      'know.context.v1',
      'generic-resource-token',
      'A generic resource/knowledge token is insufficient to establish an agentic KNOW surface.'
    );
  }

  return rejected(
    'know.context.v1',
    'unresolved-know-candidate',
    'The lexical KNOW candidate could not be resolved to a supported agentic context, memory, retrieval, or resource surface.'
  );
}


const WHO_NEGATIVE_PATTERNS = Object.freeze([
  {
    rule: 'http-user-agent',
    pattern: /\b(?:user[-_ ]?agent|userAgent)\b/i,
    reason: 'HTTP/browser User-Agent metadata is not an agentic actor definition.'
  },
  {
    rule: 'browser-worker',
    pattern: /\b(?:new\s+(?:Shared)?Worker\s*\(|ServiceWorker|WorkerGlobalScope|serviceWorker\b)/i,
    reason: 'A browser/service worker is a runtime primitive, not evidence of an agentic actor by itself.'
  },
  {
    rule: 'ui-role',
    pattern: /\brole\s*(?:=|:)\s*['"`](?:button|tab|dialog|navigation|main|menu|menuitem|checkbox|radio|presentation|status|alert|link|img|listbox|option|textbox|search)['"`]/i,
    reason: 'A UI/ARIA role is not an agentic role definition.'
  },
  {
    rule: 'ssh-agent',
    pattern: /\bssh-agent\b/i,
    reason: 'An SSH authentication agent is not an AVGL agent actor.'
  }
]);

const WHO_DIRECT_PATTERNS = Object.freeze([
  /\b(?:create|define|register|build|spawn)Agent\s*\(/i,
  /\bnew\s+(?:Agent|Assistant|Orchestrator)\s*\(/,
  /\bclass\s+\w*(?:Agent|Assistant|Orchestrator)\w*\b/,
  /\b(?:systemPrompt|system_prompt)\b/,
  /\bharness\b/i
]);

const WHO_DECLARATION_PATTERN = /\b(?:agent|assistant|worker|role|instructions?)\b/i;
const WHO_SUPPORTING_PATTERN = /\b(model|llm|tools?|mcp|prompt|systemPrompt|system_prompt|instructions?|workflow|task|memory|context|capabilit(?:y|ies)|delegate|handoff|planner|executor)\b/i;
const WHO_PATH_PATTERN = /(?:^|[\/_.-])(agents?|assistant|harness|orchestrator|swarm|crew|runtime|workflow)(?:[\/_.-]|$)/i;
const WHO_STRUCTURED_PATTERN = /\b(?:agent|assistant|worker)\s*[:=]\s*[{[]|\brole\s*[:=]\s*['"`][^'"`]+['"`]/i;

function resolveWhoActor({ path, line, lines, lineIndex }) {
  const current = String(line ?? '');
  const surrounding = windowText(lines ?? [current], lineIndex ?? 0);
  const pathText = String(path ?? '');

  for (const negative of WHO_NEGATIVE_PATTERNS) {
    if (negative.pattern.test(current)) {
      return rejected('who.actor.v1', negative.rule, negative.reason);
    }
  }

  if (WHO_DIRECT_PATTERNS.some((pattern) => pattern.test(current))) {
    return accepted(
      'who.actor.v1',
      'explicit-agent-harness-definition',
      'The source contains an explicit agent, assistant, orchestrator, system-prompt, or harness definition.'
    );
  }

  if (WHO_STRUCTURED_PATTERN.test(current) && WHO_SUPPORTING_PATTERN.test(surrounding)) {
    return accepted(
      'who.actor.v1',
      'structured-actor-definition',
      'The actor/role declaration is structurally coupled to agentic model, prompt, tool, workflow, or instruction semantics.'
    );
  }

  if (WHO_DECLARATION_PATTERN.test(current)) {
    if (WHO_PATH_PATTERN.test(pathText) && WHO_SUPPORTING_PATTERN.test(surrounding)) {
      return accepted(
        'who.actor.v1',
        'agentic-actor-neighborhood',
        'The actor token occurs inside an agentic/harness source path with supporting runtime semantics.'
      );
    }

    if (/\b(agent|assistant)\b/i.test(current) && WHO_SUPPORTING_PATTERN.test(surrounding)) {
      return accepted(
        'who.actor.v1',
        'supported-agent-reference',
        'The agent/assistant reference is supported by nearby model, prompt, tool, workflow, or instruction semantics.'
      );
    }

    return rejected(
      'who.actor.v1',
      'unresolved-actor-token',
      'A generic agent, assistant, worker, role, or instruction token is insufficient to establish WHO.'
    );
  }

  return rejected(
    'who.actor.v1',
    'unresolved-who-candidate',
    'The WHO lexical candidate could not be resolved to an agentic actor or harness definition.'
  );
}


const THINK_NEGATIVE_PATTERNS = Object.freeze([
  {
    rule: 'data-or-orm-model',
    pattern: /(?:\bmongoose\.model\b|\bsequelize\.define\b|\bdatabase\.models?\b|\bdb\.models?\b|\bViewModel\b|\bDataModel\b|\bDomainModel\b|\bmodel\s+\w+\s*\{|\bdata\s+model\b|\bdomain\s+model\b|\bdatabase\s+model\b|\bschema\s+model\b|\b3d\s+model\b|\bmodel\s+(?:number|year)\b)/i,
    reason: 'A data, ORM, UI, schema, physical, or product model is not evidence of LLM cognition.'
  },
  {
    rule: 'non-agentic-planning',
    pattern: /\b(?:project|capacity|resource|sprint|roadmap|financial|production|event|calendar|route|trip|meal)\s+(?:plan|planner|planning)\b/i,
    reason: 'Operational or domain planning is not agentic cognition by itself.'
  },
  {
    rule: 'generic-planner-class',
    pattern: /\b(?:Route|Trip|Meal|Capacity|Resource|Project|Event)Planner\b/,
    reason: 'A domain-specific planner is not an agentic planner by itself.'
  }
]);

const THINK_LLM_CALL_PATTERNS = Object.freeze([
  /\bopenai\.(?:responses\.create|chat\.completions\.create)\s*\(/i,
  /\banthropic\.messages\.create\s*\(/i,
  /\b(?:client\.)?(?:responses|chat\.completions|messages)\.create\s*\(/i,
  /\b(?:generateText|streamText|generateObject|invokeModel|generateContent)\s*\(/,
  /\b(?:llm|model)\.(?:invoke|generate|generateContent|complete|chat|stream)\s*\(/i
]);

const THINK_PROVIDER_PATTERNS = Object.freeze([
  /\bfrom\s+["'](?:openai|@anthropic-ai\/sdk|@google\/generative-ai|@google\/genai)["']/,
  /\brequire\s*\(\s*["'](?:openai|@anthropic-ai\/sdk|@google\/generative-ai|@google\/genai)["']\s*\)/,
  /\b(?:OpenAI|Anthropic|GoogleGenerativeAI)\s*\(/
]);

const THINK_MODEL_CONFIG_PATTERN = /\bmodel\s*[:=]\s*["'\x60][^"'\x60]*(?:gpt|o[1-9]|claude|gemini|llama|mistral|qwen|deepseek|glm|nemotron|command-r)[^"'\x60]*["'\x60]/i;
const THINK_REASONING_CONFIG_PATTERN = /\b(?:reasoning(?:Effort)?|reasoning_effort|thinkingBudget|thinking_budget)\s*[:=]/i;
const THINK_ORCHESTRATION_PATTERN = /\b(?:planner|planning|replan|reasoning|subagent|sub-agent|handoff|delegate|delegation)\b/i;
const THINK_AGENTIC_SUPPORT_PATTERN = /\b(agent|assistant|orchestrator|workflow|task|prompt|model|llm|tool|context|memory|executor|runtime|messages?)\b/i;
const THINK_MODEL_SUPPORT_PATTERN = /\b(agent|assistant|orchestrator|workflow|task|prompt|llm|tool|context|memory|executor|runtime|messages?)\b/i;
const THINK_PATH_PATTERN = /(?:^|[\/_.-])(agents?|assistant|planner|planning|reasoning|orchestrator|runtime|workflow|model|llm|subagents?)(?:[\/_.-]|$)/i;

function resolveThinkCognition({ path, line, lines, lineIndex, sourceKind }) {
  const current = String(line ?? '');
  const surrounding = windowText(lines ?? [current], lineIndex ?? 0);
  const pathText = String(path ?? '');

  for (const negative of THINK_NEGATIVE_PATTERNS) {
    if (negative.pattern.test(current)) {
      return rejected('think.cognition.v1', negative.rule, negative.reason);
    }
  }

  if (THINK_LLM_CALL_PATTERNS.some((pattern) => pattern.test(current))) {
    return accepted(
      'think.cognition.v1',
      'llm-model-invocation',
      'The source contains an explicit LLM/model invocation surface.'
    );
  }

  if (THINK_MODEL_CONFIG_PATTERN.test(current)) {
    return accepted(
      'think.cognition.v1',
      'explicit-llm-model-config',
      'The source binds a model setting to a recognized LLM model family.'
    );
  }

  if (THINK_REASONING_CONFIG_PATTERN.test(current)) {
    return accepted(
      'think.cognition.v1',
      'reasoning-configuration',
      'The source contains an explicit model reasoning/thinking configuration.'
    );
  }

  if (THINK_PROVIDER_PATTERNS.some((pattern) => pattern.test(current))) {
    if (sourceKind === 'implementation' || sourceKind === 'config') {
      return accepted(
        'think.cognition.v1',
        'llm-provider-surface',
        'The implementation/config source imports or instantiates a recognized LLM provider SDK.'
      );
    }
  }

  if (THINK_ORCHESTRATION_PATTERN.test(current)) {
    if (THINK_AGENTIC_SUPPORT_PATTERN.test(surrounding) && (THINK_PATH_PATTERN.test(pathText) || sourceKind === 'implementation')) {
      return accepted(
        'think.cognition.v1',
        'agentic-cognition-orchestration',
        'Planning, reasoning, replan, subagent, or handoff semantics are coupled to an agentic runtime/workflow surface.'
      );
    }

    return rejected(
      'think.cognition.v1',
      'unresolved-cognition-token',
      'A generic planning, reasoning, or subagent token is insufficient to establish THINK.'
    );
  }

  if (/\b(?:openai|anthropic|gemini|llm|model)\b/i.test(current)) {
    if (THINK_MODEL_SUPPORT_PATTERN.test(surrounding) && THINK_PATH_PATTERN.test(pathText)) {
      return accepted(
        'think.cognition.v1',
        'supported-model-reference',
        'The model/provider reference is supported by an agentic model/runtime source neighborhood.'
      );
    }

    return rejected(
      'think.cognition.v1',
      'unresolved-model-token',
      'A generic model/provider token is insufficient without an LLM invocation, recognized model configuration, or agentic runtime support.'
    );
  }

  return rejected(
    'think.cognition.v1',
    'unresolved-think-candidate',
    'The THINK lexical candidate could not be resolved to an LLM/model cognition or agentic planning surface.'
  );
}

export function resolveSemanticCandidate(candidate) {
  if (candidate?.detector?.id === 'who.agent-definition') return resolveWhoActor(candidate);
  if (candidate?.detector?.id === 'know.context-resource') return resolveKnowContext(candidate);
  if (candidate?.detector?.id === 'think.model-cognition') return resolveThinkCognition(candidate);

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
