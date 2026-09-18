import { SEMANTIC_CLASSES } from './constants.js';

const FAMILY_RULES = Object.freeze({
  WHO: [
    ['agent-definitions', 'agent definitions', /\b(agent|assistant|worker)\b/i],
    ['harness-instructions', 'harness / instructions', /\b(harness|systemprompt|system_prompt|instructions?)\b/i],
    ['roles', 'roles', /\brole\b/i]
  ],
  KNOW: [
    ['memory', 'memory', /\bmemory\b/i],
    ['retrieval-rag', 'retrieval / RAG', /\b(rag|retriev(?:e|al)?|vector(?:store|db)?)\b/i],
    ['context-state', 'context / state', /\b(context|state|history|conversation)\b/i],
    ['resources-files', 'resources / files', /\b(resource|file(?:system)?|document|knowledge)\b/i]
  ],
  THINK: [
    ['openai', 'OpenAI models', /\b(openai|gpt[-\w.]*)\b/i],
    ['anthropic', 'Anthropic models', /\b(anthropic|claude[-\w.]*)\b/i],
    ['gemini', 'Gemini models', /\b(gemini|google generative|google-genai)\b/i],
    ['planning', 'planning / replanning', /\b(planner|planning|replan)\b/i],
    ['reasoning', 'reasoning', /\b(reasoning|reasoner)\b/i],
    ['delegation', 'handoffs / subagents', /\b(subagent|handoff|delegate|delegation)\b/i],
    ['routing', 'model / task routing', /\b(router|routing|route model|model router)\b/i],
    ['model-runtime', 'model runtime', /\b(model|llm)\b/i]
  ],
  CAN: [
    ['mcp', 'MCP', /\bmcp\b/i],
    ['filesystem', 'filesystem', /\b(file(?:system)?|readfile|writefile|path)\b/i],
    ['browser-web', 'browser / web', /\b(browser|web search|web_search|http|https|fetch\()\b/i],
    ['shell-process', 'shell / process', /\b(shell|bash|terminal|subprocess|child_process|exec\()\b/i],
    ['function-tools', 'function tools', /\b(function_call|functioncall|function tool|tool\(|tools\b)\b/i],
    ['database-storage', 'database / storage', /\b(database|postgres|sqlite|sql|redis|storage|supabase)\b/i],
    ['git-repository', 'Git / repository', /\b(git|github|repository|repo)\b/i],
    ['messaging', 'messaging / email', /\b(email|mail|message|slack|sendgrid)\b/i],
    ['calendar', 'calendar', /\b(calendar|event)\b/i]
  ],
  MAY: [
    ['authorization-policy', 'authorization / policy', /\b(authori[sz](?:e|ation)|policy)\b/i],
    ['approval-hitl', 'approval / human control', /\b(approval|approve|human.?in.?the.?loop|hitl)\b/i],
    ['permission-scope', 'permissions / scope', /\b(permission|scope|allow|deny)\b/i],
    ['grants-delegation', 'grants / delegation', /\b(grant|delegat(?:e|ion))\b/i],
    ['revocation-expiry', 'revocation / expiry', /\b(revok(?:e|ed|ation)|expir(?:e|y)|ttl)\b/i]
  ],
  ACT: [
    ['executor-dispatch', 'executor / dispatch', /\b(executor|execute|dispatch)\b/i],
    ['file-mutation', 'file mutation', /\b(writefile|write file|file write|mutat(?:e|ion))\b/i],
    ['git-mutation', 'Git mutation', /\b(commit|push|merge|pull request)\b/i],
    ['network-send', 'network / API dispatch', /\b(send|post\(|put\(|patch\(|request\(|fetch\()\b/i],
    ['deployment', 'deployment', /\b(deploy|deployment|release)\b/i],
    ['database-mutation', 'database mutation', /\b(insert|update|delete|upsert|transaction)\b/i],
    ['command-execution', 'command execution', /\b(exec\(|spawn\(|subprocess|shell|command)\b/i]
  ],
  DID: [
    ['verification', 'verification', /\b(verify|verification|validated?|assert)\b/i],
    ['receipts', 'receipts', /\breceipt\b/i],
    ['audit-logging', 'audit / logging', /\b(audit|log(?:ging)?|event log)\b/i],
    ['tests', 'tests', /\b(test|spec|assert|pytest|vitest|jest)\b/i],
    ['tracing-observability', 'tracing / observability', /\b(trace|tracing|telemetry|observability|span)\b/i],
    ['reconciliation', 'reconciliation', /\b(reconcile|reconciliation)\b/i],
    ['outcomes', 'outcomes / results', /\b(outcome|result|status)\b/i]
  ]
});

const SUMMARY_PREFIX = Object.freeze({
  WHO: 'Agent structure', KNOW: 'Context surfaces', THINK: 'Cognition signals', CAN: 'Capability surfaces',
  MAY: 'Authority controls', ACT: 'Effect paths', DID: 'Evidence paths'
});

function evidenceKey(evidence) {
  return `${evidence.path}:${evidence.line}`;
}

function textForEvidence(evidence) {
  return `${evidence.path}\n${evidence.snippet ?? ''}`;
}

function familyForRule(id, label, evidence) {
  const refs = [];
  const seen = new Set();
  for (const item of evidence) {
    const key = evidenceKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    refs.push({ path: item.path, line: item.line, sourceKind: item.sourceKind });
    if (refs.length >= 8) break;
  }
  return { id, label, evidenceCount: evidence.length, evidenceRefs: refs };
}

function synthesizeArea(ir, semanticClass) {
  const nodes = ir.nodes.filter((node) => node.semanticClass === semanticClass);
  if (nodes.length === 0) {
    return { semanticClass, status: 'UNKNOWN', summary: `No bounded evidence passed the ${semanticClass} gate.`, families: [], evidenceKinds: [] };
  }

  const evidence = nodes.flatMap((node) => node.evidence ?? []);
  const families = [];
  const matchedEvidence = new Set();
  for (const [id, label, pattern] of FAMILY_RULES[semanticClass] ?? []) {
    const matches = evidence.filter((item) => pattern.test(textForEvidence(item)));
    if (matches.length === 0) continue;
    for (const item of matches) matchedEvidence.add(evidenceKey(item));
    families.push(familyForRule(id, label, matches));
  }

  families.sort((a, b) => b.evidenceCount - a.evidenceCount || a.label.localeCompare(b.label));
  const visibleFamilies = families.slice(0, 6);
  const labels = visibleFamilies.map((family) => family.label);
  const fallback = nodes.map((node) => node.label).filter((value, index, values) => values.indexOf(value) === index);
  const summaryParts = labels.length > 0 ? labels : fallback;
  const evidenceKinds = [...new Set(evidence.map((item) => item.sourceKind).filter(Boolean))];
  const prefix = SUMMARY_PREFIX[semanticClass] ?? semanticClass;
  const summary = summaryParts.length > 0 ? `${prefix}: ${summaryParts.join(', ')}.` : `${prefix}: bounded signals found.`;

  return {
    semanticClass,
    status: 'EVIDENCED',
    summary,
    families: visibleFamilies,
    evidenceKinds,
    unmatchedEvidenceCount: Math.max(0, evidence.length - matchedEvidence.size)
  };
}

export function synthesizeAvglIr(ir) {
  const areas = Object.fromEntries(SEMANTIC_CLASSES.map((semanticClass) => [semanticClass, synthesizeArea(ir, semanticClass)]));
  return {
    ...ir,
    analysis: { ...ir.analysis, pipeline: ['DISCOVER', 'EXTRACT', 'RESOLVE_SEMANTICS', 'CLASSIFY', 'BIND', 'RESOLVE_RELATIONS', 'TRACE_EFFECTS', 'SYNTHESIZE', 'PROJECT'] },
    synthesis: {
      version: '0.1',
      mode: 'deterministic-evidence-aggregation',
      areas
    }
  };
}
