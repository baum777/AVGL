// AVGL-0295 A-04 — agent return boundary.
// Agent output never mutates the Semantic IR and never becomes a system fact.
// This module wraps agent statements as explicitly marked INFERRED hypotheses
// destined for the normal AVGL evidence gates (SoT §24/§15/§16). It is a pure
// constructor: it writes nothing, verifies nothing, authorizes nothing.

import { validateAgentContextPackage } from './agent-context-package.js';

export const AGENT_HYPOTHESIS_ARTIFACT = 'avgl-agent-hypothesis-v1';

function validString(value, maxLength = 2000) {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength;
}

export function createAgentHypothesis({ agentContextPackage, statement, relatedObjectIds = [] } = {}) {
  const errors = [];

  // The origin must be a package this contract actually validated. A shape that
  // merely looks like one (schema_version + package_id) would otherwise yield a
  // package-linked hypothesis with no binding at all: no ir_revision, no
  // provenance, no verifiable source.
  const origin = validateAgentContextPackage(agentContextPackage);
  if (!origin.ok) {
    errors.push({
      code: 'invalid_agent_context_package',
      path: '$.agentContextPackage',
      message: 'A validated agent context package is required as hypothesis origin.',
      cause: origin.errors
    });
  }
  if (!validString(statement)) {
    errors.push({ code: 'invalid_statement', path: '$.statement', message: 'A hypothesis statement string is required.' });
  }

  const relatedIds = Array.isArray(relatedObjectIds) ? relatedObjectIds : null;
  if (relatedIds === null) {
    errors.push({ code: 'invalid_related_object_ids', path: '$.relatedObjectIds', message: 'relatedObjectIds must be an array of package object ids.' });
  } else {
    for (const id of relatedIds) {
      if (typeof id !== 'string') {
        errors.push({ code: 'invalid_related_object_id', path: '$.relatedObjectIds', message: 'relatedObjectIds entries must be strings.' });
      }
    }
  }

  // Hypotheses may only reference objects the origin package actually exposes:
  // an unbound id would smuggle context the package never granted.
  if (errors.length === 0) {
    const exposed = new Set(origin.package.objects.map((node) => node.id));
    for (const [index, id] of [...new Set(relatedIds)].entries()) {
      if (!exposed.has(id)) {
        errors.push({
          code: 'unbound_related_object_id',
          path: `$.relatedObjectIds[${index}]`,
          message: `relatedObjectIds entry ${id} is not present in the origin package objects.`
        });
      }
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors, hypothesis: null };
  }

  return {
    ok: true,
    errors: [],
    hypothesis: {
      artifact: AGENT_HYPOTHESIS_ARTIFACT,
      // Explicit marking: this is a hypothesis, never a verified fact, never
      // a receipt, never authority. Evidence state is pinned to INFERRED —
      // agent statements cannot claim EXPLICIT/OBSERVED/UNKNOWN semantics.
      // INFERRED here is the epistemic classification of the hypothesis,
      // not a new AVGL evidence record: only a downstream AVGL evidence gate
      // may ever accept it as a source-bound semantic assertion.
      marked: 'INFERRED_HYPOTHESIS',
      evidence_state: 'INFERRED',
      statement,
      related_object_ids: [...new Set(relatedIds)],
      source: {
        agent_context_package_id: origin.package.package_id,
        ir_revision: origin.package.source_binding.ir_revision
      },
      // The only forward path: pending review through the normal AVGL
      // evidence gates. Nothing in this envelope constitutes verification.
      acceptance: 'pending_evidence_gate',
      authority_granted: false,
      verification_claimed: false
    }
  };
}
