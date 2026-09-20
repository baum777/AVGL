import { validateProjectionPolicy } from './projection-policy.js';

// AVGL-0296 A-03 — deterministic projection evaluator.
// Belongs to the PROJECT stage (SoT §18); it never resolves semantics and
// never creates evidence. Input is an adapter view over the existing IR v0.1
// contract (schema/avgl-ir-v0.1.json). This module does NOT define or claim
// the canonical IR v0.2 contract (see working plan AVGL-0296 A-03).

export const PROJECTION_ENGINE_ID = 'context-projection-engine';
export const PROJECTION_ENGINE_VERSION = '0296-A-03';

const VISIBILITY = Object.freeze({
  VISIBLE: 'VISIBLE',
  NOT_PROJECTED: 'NOT_PROJECTED',
  RESTRICTED: 'RESTRICTED',
  UNAVAILABLE: 'UNAVAILABLE'
});

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function asRegistry(value) {
  if (value instanceof Set) return new Set(value);
  if (Array.isArray(value)) return new Set(value);
  return new Set();
}

function validString(value, maxLength = 240) {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength;
}

// Selector semantics: exact match, or prefix match when the selector ends
// with `*` (e.g. `runtime.*`). Nothing else — intentionally minimal.
function selectorMatches(selector, value) {
  if (selector === value) return true;
  if (typeof selector === 'string' && selector.endsWith('*')) {
    return value.startsWith(selector.slice(0, -1));
  }
  return false;
}

function matchesAny(selectors, value) {
  return selectors.some((selector) => selectorMatches(selector, value));
}

function sortByCodepoint(records) {
  return [...records].sort((left, right) => {
    if (left.id < right.id) return -1;
    if (left.id > right.id) return 1;
    return 0;
  });
}

// Adapter mapping for relation evidence: IR v0.1 relations carry a `basis`,
// not an evidenceState. EXPLICIT maps directly; INFERRED maps directly;
// DERIVED is a derivation mechanism, not source evidence, and is handled
// conservatively under the policy's inferredHandling rule. Anything else is
// treated as UNKNOWN and never projected as asserted content.
function relationEvidenceState(basis) {
  if (basis === 'EXPLICIT') return 'EXPLICIT';
  if (basis === 'INFERRED' || basis === 'DERIVED') return 'INFERRED';
  return 'UNKNOWN';
}

function evidenceAdmitted(state, evidenceBoundary) {
  if (state === 'EXPLICIT' || state === 'OBSERVED') {
    return evidenceBoundary.allowedStates.includes(state);
  }
  if (state === 'INFERRED') {
    return evidenceBoundary.inferredHandling.mode === 'preserve_as_inferred';
  }
  return false;
}

function normalizeIrView(ir) {
  if (!isRecord(ir)) return null;
  if (!Array.isArray(ir.nodes) || !Array.isArray(ir.relations)) return null;
  return {
    nodes: ir.nodes,
    relations: ir.relations,
    invariants: Array.isArray(ir.invariants) ? ir.invariants : [],
    unknowns: Array.isArray(ir.unknowns) ? ir.unknowns : []
  };
}

function notProjected(reason, errors = []) {
  return {
    status: 'not_projected',
    reason,
    errors,
    objects: [],
    relations: [],
    constraints: [],
    dispositions: { objects: {}, counts: zeroCounts() },
    provenance: null
  };
}

function zeroCounts() {
  return {
    objects_visible: 0,
    objects_restricted: 0,
    objects_unavailable: 0,
    objects_not_projected: 0,
    relations_visible: 0,
    relations_hidden: 0
  };
}

export function evaluateProjection({ ir, policy, revision, relationTypes, governanceReferences } = {}) {
  // 1 + 2 — policy validation and authorization verification. The engine
  // never self-authorizes: the governance reference must arrive in the
  // externally supplied, already-verified reference registry.
  const decision = validateProjectionPolicy(policy, {
    relationTypes: asRegistry(relationTypes),
    governanceReferences: asRegistry(governanceReferences)
  });
  if (!decision.ok) {
    return notProjected('policy_invalid', decision.errors);
  }

  // 3 — strict IR adapter view (compatibility boundary over IR v0.1 fields).
  const view = normalizeIrView(ir);
  if (!view) {
    return notProjected('invalid_ir', [{
      code: 'invalid_ir',
      path: '$',
      message: 'Projection input must expose IR node and relation arrays.'
    }]);
  }

  // The IR v0.1 contract carries no native revision field; the caller binds
  // the immutable source revision here. Fail closed without it — a package
  // must never be generated against an unbound IR.
  if (!validString(revision, 240)) {
    return notProjected('missing_revision', [{
      code: 'missing_revision',
      path: '$.revision',
      message: 'An immutable source revision binding is required for projection.'
    }]);
  }

  // Normalized policy shape guarantees scope/evidenceBoundary presence.
  const { include, deny } = decision.policy.scope;
  const { evidenceBoundary } = decision.policy;

  // 4 + 5 + 6 + 8 — candidate selection, deny precedence, evidence boundary,
  // visibility classification. Objects: include ∧ ¬deny ∧ evidence admitted.
  const dispositions = {};
  const counts = zeroCounts();
  for (const node of view.nodes) {
    if (!isRecord(node) || !validString(node.id)) continue;
    if (!matchesAny(include.objects, node.id)) {
      dispositions[node.id] = VISIBILITY.NOT_PROJECTED;
      counts.objects_not_projected += 1;
      continue;
    }
    if (matchesAny(deny.objects, node.id)) {
      dispositions[node.id] = VISIBILITY.RESTRICTED;
      counts.objects_restricted += 1;
      continue;
    }
    if (!evidenceAdmitted(node.evidenceState, evidenceBoundary)) {
      dispositions[node.id] = VISIBILITY.UNAVAILABLE;
      counts.objects_unavailable += 1;
      continue;
    }
    dispositions[node.id] = VISIBILITY.VISIBLE;
    counts.objects_visible += 1;
  }

  const visibleIds = new Set(Object.keys(dispositions).filter((id) => dispositions[id] === VISIBILITY.VISIBLE));
  const visibleNodes = sortByCodepoint(view.nodes.filter((node) => isRecord(node) && visibleIds.has(node.id)));

  // 7 — relation projection: type allowed ∧ both endpoints visible ∧
  // evidence permitted. Endpoints are never guessed and hidden relations
  // never leak identifiers.
  const visibleRelations = [];
  let relationsHidden = 0;
  for (const relation of view.relations) {
    if (!isRecord(relation)) continue;
    const typeIncluded = matchesAny(include.relations, relation.type);
    const typeDenied = matchesAny(deny.relations, relation.type);
    const endpointsVisible = isRecord(relation.from) && isRecord(relation.to)
      && visibleIds.has(relation.from.id) && visibleIds.has(relation.to.id);
    const evidenceOk = evidenceAdmitted(relationEvidenceState(relation.basis), evidenceBoundary);

    if (typeIncluded && !typeDenied && endpointsVisible && evidenceOk) {
      visibleRelations.push(relation);
      counts.relations_visible += 1;
    } else {
      relationsHidden += 1;
      counts.relations_hidden += 1;
    }
  }

  const constraints = sortByCodepoint([...new Set(view.invariants.filter((item) => typeof item === 'string'))]
    .map((text) => ({ id: text })))
    .map((entry) => entry.id);

  const governanceId = decision.policy.owner.reference.id;
  return {
    status: 'projected',
    reason: null,
    errors: [],
    objects: visibleNodes,
    relations: sortByCodepoint(visibleRelations),
    constraints,
    dispositions: { objects: dispositions, counts },
    provenance: {
      engine_id: PROJECTION_ENGINE_ID,
      engine_version: PROJECTION_ENGINE_VERSION,
      executor: PROJECTION_ENGINE_ID,
      authorizer: `governance_record:${governanceId}`,
      policy: {
        id: decision.policy.identity.id,
        revision: decision.policy.identity.revision
      },
      governance_reference: governanceId,
      ir_revision: revision
    }
  };
}

export function packageBoundaryCounts(projection) {
  if (!isRecord(projection) || projection.status !== 'projected') {
    return { hidden_count: 0, unavailable_count: 0 };
  }
  const counts = projection.dispositions.counts;
  // Aggregate-only boundary (owner-final A5): RESTRICTED existence metadata
  // never leaks identifiers — only counts. Hidden relations count into
  // hidden_count alongside restricted objects; unknown-evidence objects are
  // reported separately as unavailable.
  return {
    hidden_count: counts.objects_restricted + counts.relations_hidden,
    unavailable_count: counts.objects_unavailable
  };
}

export { VISIBILITY };
