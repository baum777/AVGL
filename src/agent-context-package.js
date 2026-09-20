import { createHash } from 'node:crypto';

// AVGL-0295 — agent context package contract (A-02 validator + A-03 materializer).
// The agent receives an AVGL lens, not the repository. This module consumes a
// 0296 context package (avgl-context-package-v1) and materializes the governed
// agent-consumption artifact. It never redefines projection policy (0296 owns
// the disclosure boundary), never strengthens evidence, and never adds
// semantics. Raw source travels as references only (path/line/sourceKind):
// snippet/content fields are structurally absent from this contract.

export const AGENT_CONTEXT_PACKAGE_ARTIFACT = 'avgl-agent-context-package-v1';
export const AGENT_PACKAGE_ENGINE_ID = 'avgl-agent-context-package-engine';
export const AGENT_PACKAGE_ENGINE_VERSION = '0295-A-03';

const PROJECTION_PACKAGE_ARTIFACT = 'avgl-context-package-v1';
const EVIDENCE_STATES = new Set(['EXPLICIT', 'INFERRED', 'OBSERVED', 'UNKNOWN']);
const RELATION_BASES = new Set(['EXPLICIT', 'INFERRED', 'DERIVED']);
const SEMANTIC_CLASSES = new Set(['WHO', 'KNOW', 'THINK', 'CAN', 'MAY', 'ACT', 'DID']);
const CONSUMER_KEYS = new Set(['agent_id']);

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function validString(value, maxLength = 240) {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength;
}

function pushError(errors, code, path, message) {
  errors.push({ code, path, message });
}

// --- A-02: validate the 0296 projection package input -----------------------

function validateProjectionPackageInput(pkg, errors) {
  if (!isRecord(pkg)) {
    pushError(errors, 'invalid_projection_package', '$', 'A 0296 context package object is required.');
    return;
  }
  if (pkg.artifact !== PROJECTION_PACKAGE_ARTIFACT) {
    pushError(errors, 'unsupported_projection_artifact', '$.artifact', `Projection package artifact must be ${PROJECTION_PACKAGE_ARTIFACT}.`);
  }
  if (!validString(pkg.package_id, 160)) {
    pushError(errors, 'invalid_projection_package_id', '$.package_id', 'Projection package id is required.');
  }
  const binding = pkg.ir_binding;
  if (!isRecord(binding) || !validString(binding.revision, 240)) {
    pushError(errors, 'missing_ir_revision', '$.ir_binding.revision', 'Projection package must bind an immutable IR revision.');
  }
  const policy = pkg.policy_binding;
  if (!isRecord(policy) || !validString(policy.policy_id, 160) || !validString(policy.revision, 160)) {
    pushError(errors, 'missing_policy_binding', '$.policy_binding', 'Projection package must bind policy id and revision.');
  }
  const authorizedBy = pkg.provenance && pkg.provenance.authorized_by;
  if (!isRecord(authorizedBy) || authorizedBy.type !== 'governance_record' || !validString(authorizedBy.id, 280)) {
    pushError(errors, 'missing_projection_authorization', '$.provenance.authorized_by', 'Projection package must carry its external governance authorization.');
  }
  if (!Array.isArray(pkg.objects)) {
    pushError(errors, 'invalid_objects', '$.objects', 'Projection package objects array is required.');
  }
  if (!Array.isArray(pkg.relations)) {
    pushError(errors, 'invalid_relations', '$.relations', 'Projection package relations array is required.');
  }
  if (!Array.isArray(pkg.constraints)) {
    pushError(errors, 'invalid_constraints', '$.constraints', 'Projection package constraints array is required.');
  }
}

// --- A-03: materializer ------------------------------------------------------

function evidenceReference(evidence) {
  // Raw source never rehydrates: keep the reference triple only.
  return { path: evidence.path, line: evidence.line, sourceKind: evidence.sourceKind };
}

function agentObject(node) {
  return {
    id: node.id,
    semanticClass: node.semanticClass,
    label: node.label,
    statement: node.statement,
    evidenceState: node.evidenceState,
    confidence: node.confidence,
    evidence: Array.isArray(node.evidence) ? node.evidence.map(evidenceReference) : [],
    evidenceCount: node.evidenceCount
  };
}

function agentRelation(relation) {
  return {
    id: relation.id,
    type: relation.type,
    from: { kind: relation.from.kind, id: relation.from.id },
    to: { kind: relation.to.kind, id: relation.to.id },
    basis: relation.basis,
    confidence: relation.confidence
  };
}

function stableAgentPackageId({ projectionPackageId, irRevision, policyId, policyRevision, governanceId, agentId }) {
  const binding = [
    AGENT_CONTEXT_PACKAGE_ARTIFACT,
    AGENT_PACKAGE_ENGINE_VERSION,
    projectionPackageId,
    irRevision,
    policyId,
    policyRevision,
    governanceId,
    agentId ?? ''
  ].join('|');
  return `agentctx-${createHash('sha256').update(binding).digest('hex').slice(0, 32)}`;
}

export function createAgentContextPackage({ projectionPackage, consumerContext } = {}) {
  const errors = [];

  validateProjectionPackageInput(projectionPackage, errors);

  let consumer = null;
  if (consumerContext !== undefined && consumerContext !== null) {
    if (!isRecord(consumerContext)) {
      pushError(errors, 'invalid_consumer_context', '$.consumerContext', 'consumerContext must be an object.');
    } else {
      for (const key of Object.keys(consumerContext)) {
        if (!CONSUMER_KEYS.has(key)) {
          // Callers cannot inject objects, relations, or any other package
          // content through the consumer context — it identifies a consumer,
          // it never carries repository semantics (no raw repo fallback).
          pushError(errors, 'undeclared_consumer_field', `$.consumerContext.${key}`, `consumerContext.${key} is not allowed; consumer context cannot inject package content.`);
        }
      }
      if (validString(consumerContext.agent_id, 160)) {
        consumer = { agent_id: consumerContext.agent_id };
      } else if (consumerContext.agent_id !== undefined) {
        pushError(errors, 'invalid_agent_id', '$.consumerContext.agent_id', 'agent_id must be a non-empty string up to 160 characters.');
      }
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors, package: null };
  }

  const governanceId = projectionPackage.provenance.authorized_by.id;
  const irRevision = projectionPackage.ir_binding.revision;
  const policyId = projectionPackage.policy_binding.policy_id;

  const generatedAt = new Date().toISOString();

  return {
    ok: true,
    errors: [],
    package: {
      schema_version: '1',
      package_id: stableAgentPackageId({
        projectionPackageId: projectionPackage.package_id,
        irRevision,
        policyId,
        policyRevision: projectionPackage.policy_binding.revision,
        governanceId,
        agentId: consumer ? consumer.agent_id : undefined
      }),
      source_binding: {
        ir_revision: irRevision,
        projection_policy_id: policyId,
        projection_policy_revision: projectionPackage.policy_binding.revision,
        governance_reference: `governance_record:${governanceId}`
      },
      ...(consumer ? { consumer } : {}),
      objects: projectionPackage.objects.map(agentObject),
      relations: projectionPackage.relations.map(agentRelation),
      constraints: [...projectionPackage.constraints],
      boundaries: {
        hidden_count: projectionPackage.boundaries.hidden_count,
        unavailable_count: projectionPackage.boundaries.unavailable_count
      },
      provenance: {
        created_by: {
          engine: AGENT_PACKAGE_ENGINE_ID,
          engine_version: AGENT_PACKAGE_ENGINE_VERSION
        },
        // 0295 transports authorization; it never creates it. The authorizer
        // remains the externally verified 0296 governance record.
        authorized_by: {
          type: 'governance_record',
          id: governanceId
        },
        projection_package_id: projectionPackage.package_id,
        // Envelope field: may vary between runs; semantic content must not.
        generated_at: generatedAt
      }
    }
  };
}

// --- A-02: validate an agent context package --------------------------------

export function validateAgentContextPackage(pkg) {
  const errors = [];

  if (!isRecord(pkg)) {
    return { ok: false, errors: [{ code: 'invalid_package', path: '$', message: 'Agent context package must be an object.' }], package: null };
  }
  if (pkg.schema_version !== '1') {
    pushError(errors, 'unsupported_version', '$.schema_version', 'Agent context package schema_version must be "1".');
  }
  if (!validString(pkg.package_id, 160)) {
    pushError(errors, 'invalid_package_id', '$.package_id', 'package_id must be a non-empty string up to 160 characters.');
  }

  const binding = pkg.source_binding;
  if (!isRecord(binding)) {
    pushError(errors, 'missing_source_binding', '$.source_binding', 'source_binding is required.');
  } else {
    if (!validString(binding.ir_revision, 240)) {
      pushError(errors, 'missing_ir_revision', '$.source_binding.ir_revision', 'Immutable IR revision binding is required.');
    }
    if (!validString(binding.projection_policy_id, 160)) {
      pushError(errors, 'missing_policy_id', '$.source_binding.projection_policy_id', 'Projection policy id binding is required.');
    }
    if (!validString(binding.projection_policy_revision, 160)) {
      pushError(errors, 'missing_policy_revision', '$.source_binding.projection_policy_revision', 'Projection policy revision binding is required.');
    }
    if (binding.governance_reference !== undefined && !validString(binding.governance_reference, 280)) {
      pushError(errors, 'invalid_governance_reference', '$.source_binding.governance_reference', 'governance_reference must be a non-empty string.');
    }
  }

  if (pkg.consumer !== undefined) {
    if (!isRecord(pkg.consumer)) {
      pushError(errors, 'invalid_consumer', '$.consumer', 'consumer must be an object.');
    } else if (pkg.consumer.agent_id !== undefined && !validString(pkg.consumer.agent_id, 160)) {
      pushError(errors, 'invalid_agent_id', '$.consumer.agent_id', 'agent_id must be a non-empty string up to 160 characters.');
    }
  }

  const objectIds = new Set();
  if (!Array.isArray(pkg.objects)) {
    pushError(errors, 'invalid_objects', '$.objects', 'objects must be an array.');
  } else {
    for (const [index, node] of pkg.objects.entries()) {
      if (!isRecord(node) || !validString(node.id)) continue;
      objectIds.add(node.id);
      if (!EVIDENCE_STATES.has(node.evidenceState)) {
        pushError(errors, 'invalid_evidence_state', `$.objects[${index}].evidenceState`, `Object ${node.id} carries an invalid evidence state.`);
      }
      if (!SEMANTIC_CLASSES.has(node.semanticClass)) {
        pushError(errors, 'invalid_semantic_class', `$.objects[${index}].semanticClass`, `Object ${node.id} carries an invalid semantic class.`);
      }
    }
  }

  if (!Array.isArray(pkg.relations)) {
    pushError(errors, 'invalid_relations', '$.relations', 'relations must be an array.');
  } else {
    for (const [index, relation] of pkg.relations.entries()) {
      if (!isRecord(relation)) continue;
      if (!RELATION_BASES.has(relation.basis)) {
        pushError(errors, 'invalid_relation_basis', `$.relations[${index}].basis`, `Relation ${relation.id} carries an invalid basis.`);
      }
      // Endpoint closure: relations may only point at package-visible objects.
      const fromId = isRecord(relation.from) ? relation.from.id : undefined;
      const toId = isRecord(relation.to) ? relation.to.id : undefined;
      if (!objectIds.has(fromId) || !objectIds.has(toId)) {
        pushError(errors, 'dangling_relation_endpoint', `$.relations[${index}]`, `Relation ${relation.id} references an endpoint absent from the package objects.`);
      }
    }
  }

  if (!Array.isArray(pkg.constraints)) {
    pushError(errors, 'invalid_constraints', '$.constraints', 'constraints must be an array.');
  }

  if (!isRecord(pkg.boundaries)
    || !Number.isInteger(pkg.boundaries.hidden_count)
    || pkg.boundaries.hidden_count < 0
    || !Number.isInteger(pkg.boundaries.unavailable_count)
    || pkg.boundaries.unavailable_count < 0) {
    pushError(errors, 'invalid_boundaries', '$.boundaries', 'boundaries requires non-negative integer hidden_count and unavailable_count.');
  }

  const provenance = pkg.provenance;
  if (!isRecord(provenance)) {
    pushError(errors, 'missing_provenance', '$.provenance', 'provenance is required.');
  } else {
    if (!isRecord(provenance.created_by) || !validString(provenance.created_by.engine) || !validString(provenance.created_by.engine_version)) {
      pushError(errors, 'invalid_created_by', '$.provenance.created_by', 'created_by engine and engine_version are required.');
    }
    if (!isRecord(provenance.authorized_by) || provenance.authorized_by.type !== 'governance_record' || !validString(provenance.authorized_by.id, 280)) {
      pushError(errors, 'invalid_authorized_by', '$.provenance.authorized_by', 'authorized_by must reference an external governance record.');
    }
    if (!validString(provenance.projection_package_id, 160)) {
      pushError(errors, 'missing_projection_link', '$.provenance.projection_package_id', 'The consumed 0296 projection package id is required.');
    }
  }

  return { ok: errors.length === 0, errors, package: errors.length === 0 ? pkg : null };
}
