// Context Intelligence Layer
// Phase 2 foundation: evidence-bound context resolution.

export const CONTEXT_RESOLVER_VERSION = '0.1';

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

export function resolveContext(input = {}) {
  const {
    identity = {},
    evidence = [],
    relations = [],
    effects = []
  } = input;

  return {
    resolver: 'context.resolution.v1',
    mode: 'SEMANTIC',
    identity,
    relations: unique(relations),
    effects: unique(effects),
    evidence,
    confidence: evidence.length ? 'EVIDENCE_BOUND' : 'UNKNOWN'
  };
}

export function deriveContextRole(file = {}) {
  return {
    type: file.type || 'unknown',
    role: file.role || 'unknown',
    source: file.path || null
  };
}
