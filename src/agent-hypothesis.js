// AVGL-0295 A-04 — agent return boundary.
// Agent output never mutates the Semantic IR and never becomes a system fact.
// This module wraps agent statements as explicitly marked INFERRED hypotheses
// destined for the normal AVGL evidence gates (SoT §24/§15/§16). It is a pure
// constructor: it writes nothing, verifies nothing, authorizes nothing.

export const AGENT_HYPOTHESIS_ARTIFACT = 'avgl-agent-hypothesis-v1';

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function validString(value, maxLength = 2000) {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength;
}

export function createAgentHypothesis({ agentContextPackage, statement, relatedObjectIds = [] } = {}) {
  const errors = [];

  if (!isRecord(agentContextPackage) || agentContextPackage.schema_version !== '1' || !validString(agentContextPackage.package_id, 160)) {
    errors.push({ code: 'invalid_agent_context_package', path: '$.agentContextPackage', message: 'A validated agent context package is required as hypothesis origin.' });
  }
  if (!validString(statement)) {
    errors.push({ code: 'invalid_statement', path: '$.statement', message: 'A hypothesis statement string is required.' });
  }
  if (!Array.isArray(relatedObjectIds)) {
    errors.push({ code: 'invalid_related_object_ids', path: '$.relatedObjectIds', message: 'relatedObjectIds must be an array of package object ids.' });
  } else {
    for (const id of relatedObjectIds) {
      if (typeof id !== 'string') {
        errors.push({ code: 'invalid_related_object_id', path: '$.relatedObjectIds', message: 'relatedObjectIds entries must be strings.' });
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
      marked: 'INFERRED_HYPOTHESIS',
      evidence_state: 'INFERRED',
      statement,
      related_object_ids: [...new Set(relatedObjectIds)],
      source: {
        agent_context_package_id: agentContextPackage.package_id,
        ir_revision: agentContextPackage.source_binding ? agentContextPackage.source_binding.ir_revision : undefined
      },
      // The only forward path: pending review through the normal AVGL
      // evidence gates. Nothing in this envelope constitutes verification.
      acceptance: 'pending_evidence_gate',
      authority_granted: false,
      verification_claimed: false
    }
  };
}
