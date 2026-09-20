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

// The package is a closed shape: schema/agent-context-package-v1.json declares
// additionalProperties:false on every object. Undeclared fields are rejected,
// never ignored — an ignored field is exactly how raw source
// (evidence[].snippet) or free-form content would re-enter a package that this
// contract defines as reference-only.
const PACKAGE_KEYS = new Set(['schema_version', 'package_id', 'source_binding', 'consumer', 'objects', 'relations', 'constraints', 'boundaries', 'provenance']);
const SOURCE_BINDING_KEYS = new Set(['ir_revision', 'projection_policy_id', 'projection_policy_revision', 'governance_reference']);
const OBJECT_KEYS = new Set(['id', 'semanticClass', 'label', 'statement', 'evidenceState', 'confidence', 'evidence', 'evidenceCount']);
const EVIDENCE_REFERENCE_KEYS = new Set(['path', 'line', 'sourceKind']);
const RELATION_KEYS = new Set(['id', 'type', 'from', 'to', 'basis', 'confidence']);
const ENDPOINT_KEYS = new Set(['kind', 'id']);
const BOUNDARY_KEYS = new Set(['hidden_count', 'unavailable_count']);
const PROVENANCE_KEYS = new Set(['created_by', 'authorized_by', 'projection_package_id', 'generated_at']);
const CREATED_BY_KEYS = new Set(['engine', 'engine_version']);
const AUTHORIZED_BY_KEYS = new Set(['type', 'id']);
const SOURCE_KINDS = new Set(['implementation', 'config', 'test', 'documentation', 'other']);

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function validString(value, maxLength = 240) {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength;
}

// Presence only: the contract declares no maximum length for these fields, so
// the validator must not invent one.
function nonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

function isUnitInterval(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
}

function isCount(value) {
  return Number.isInteger(value) && value >= 0;
}

function pushError(errors, code, path, message) {
  errors.push({ code, path, message });
}

function rejectUndeclared(errors, value, allowed, path, code) {
  if (!isRecord(value)) return;
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      pushError(errors, code, `${path}.${key}`, `Undeclared field ${key}: this contract's shape is closed and the field is not part of it.`);
    }
  }
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
  } else {
    // Element shapes are checked here so the materializer never dereferences a
    // malformed element and never throws out of a result-style API.
    for (const [index, node] of pkg.objects.entries()) {
      if (!isRecord(node) || !validString(node.id)) {
        pushError(errors, 'invalid_projection_object', `$.objects[${index}]`, 'Every projection package object must be an object carrying an id.');
      }
    }
  }
  if (!Array.isArray(pkg.relations)) {
    pushError(errors, 'invalid_relations', '$.relations', 'Projection package relations array is required.');
  } else {
    for (const [index, relation] of pkg.relations.entries()) {
      if (!isRecord(relation) || !isRecord(relation.from) || !isRecord(relation.to)) {
        pushError(errors, 'invalid_projection_relation', `$.relations[${index}]`, 'Every projection package relation must be an object carrying from/to endpoints.');
      }
    }
  }
  if (!Array.isArray(pkg.constraints)) {
    pushError(errors, 'invalid_constraints', '$.constraints', 'Projection package constraints array is required.');
  } else {
    for (const [index, constraint] of pkg.constraints.entries()) {
      if (!nonEmptyString(constraint)) {
        pushError(errors, 'invalid_projection_constraint', `$.constraints[${index}]`, 'Projection package constraints must be non-empty strings.');
      }
    }
  }
  if (!isRecord(pkg.boundaries) || !isCount(pkg.boundaries.hidden_count) || !isCount(pkg.boundaries.unavailable_count)) {
    pushError(errors, 'invalid_projection_boundaries', '$.boundaries', 'Projection package boundaries require non-negative integer hidden_count and unavailable_count.');
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

  const candidate = {
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
  };

  // Self-consistency guard: the materializer never emits a package that its own
  // validator rejects. A 0296 view that clears the input checks but cannot yield
  // a contract-conformant package fails closed here rather than handing an
  // unvalidated artifact downstream.
  const selfCheck = validateAgentContextPackage(candidate);
  if (!selfCheck.ok) {
    return { ok: false, errors: selfCheck.errors, package: null };
  }

  return { ok: true, errors: [], package: candidate };
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
  rejectUndeclared(errors, pkg, PACKAGE_KEYS, '$', 'undeclared_package_field');

  const binding = pkg.source_binding;
  if (!isRecord(binding)) {
    pushError(errors, 'missing_source_binding', '$.source_binding', 'source_binding is required.');
  } else {
    rejectUndeclared(errors, binding, SOURCE_BINDING_KEYS, '$.source_binding', 'undeclared_source_binding_field');
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
    } else {
      rejectUndeclared(errors, pkg.consumer, CONSUMER_KEYS, '$.consumer', 'undeclared_consumer_field');
      if (pkg.consumer.agent_id !== undefined && !validString(pkg.consumer.agent_id, 160)) {
        pushError(errors, 'invalid_agent_id', '$.consumer.agent_id', 'agent_id must be a non-empty string up to 160 characters.');
      }
    }
  }

  const objectIds = new Set();
  if (!Array.isArray(pkg.objects)) {
    pushError(errors, 'invalid_objects', '$.objects', 'objects must be an array.');
  } else {
    for (const [index, node] of pkg.objects.entries()) {
      const nodePath = `$.objects[${index}]`;
      // No element is ever skipped silently: an unvalidated element is an
      // unvalidated package.
      if (!isRecord(node)) {
        pushError(errors, 'invalid_object', nodePath, 'Every package object must be an object.');
        continue;
      }
      rejectUndeclared(errors, node, OBJECT_KEYS, nodePath, 'undeclared_object_field');
      if (!validString(node.id)) {
        pushError(errors, 'missing_object_id', `${nodePath}.id`, 'Object id is required.');
      } else {
        objectIds.add(node.id);
      }
      if (!nonEmptyString(node.label)) {
        pushError(errors, 'missing_object_label', `${nodePath}.label`, 'Object label is required.');
      }
      if (!nonEmptyString(node.statement)) {
        pushError(errors, 'missing_object_statement', `${nodePath}.statement`, 'Object statement is required.');
      }
      if (!EVIDENCE_STATES.has(node.evidenceState)) {
        pushError(errors, 'invalid_evidence_state', `${nodePath}.evidenceState`, `Object ${node.id} carries an invalid evidence state.`);
      }
      if (!SEMANTIC_CLASSES.has(node.semanticClass)) {
        pushError(errors, 'invalid_semantic_class', `${nodePath}.semanticClass`, `Object ${node.id} carries an invalid semantic class.`);
      }
      if (!isUnitInterval(node.confidence)) {
        pushError(errors, 'invalid_confidence', `${nodePath}.confidence`, `Object ${node.id} confidence must be a number between 0 and 1.`);
      }
      if (!isCount(node.evidenceCount)) {
        pushError(errors, 'invalid_evidence_count', `${nodePath}.evidenceCount`, `Object ${node.id} evidenceCount must be a non-negative integer.`);
      }
      if (!Array.isArray(node.evidence)) {
        pushError(errors, 'invalid_evidence', `${nodePath}.evidence`, `Object ${node.id} evidence must be an array.`);
      } else {
        for (const [evidenceIndex, evidence] of node.evidence.entries()) {
          const evidencePath = `${nodePath}.evidence[${evidenceIndex}]`;
          if (!isRecord(evidence)) {
            pushError(errors, 'invalid_evidence_reference', evidencePath, 'Evidence entries must be objects.');
            continue;
          }
          // Reference-only boundary: the contract admits exactly path/line/
          // sourceKind. snippet, detector, excerpts or any free-form content
          // field are undeclared and therefore rejected — raw source never
          // travels in an agent package.
          rejectUndeclared(errors, evidence, EVIDENCE_REFERENCE_KEYS, evidencePath, 'undeclared_evidence_field');
          if (!nonEmptyString(evidence.path)) {
            pushError(errors, 'missing_evidence_path', `${evidencePath}.path`, 'Evidence reference path is required.');
          }
          if (!Number.isInteger(evidence.line) || evidence.line < 1) {
            pushError(errors, 'invalid_evidence_line', `${evidencePath}.line`, 'Evidence reference line must be an integer >= 1.');
          }
          if (!SOURCE_KINDS.has(evidence.sourceKind)) {
            pushError(errors, 'invalid_evidence_source_kind', `${evidencePath}.sourceKind`, 'Evidence reference sourceKind is not a declared source kind.');
          }
        }
      }
    }
  }

  if (!Array.isArray(pkg.relations)) {
    pushError(errors, 'invalid_relations', '$.relations', 'relations must be an array.');
  } else {
    for (const [index, relation] of pkg.relations.entries()) {
      const relationPath = `$.relations[${index}]`;
      if (!isRecord(relation)) {
        pushError(errors, 'invalid_relation', relationPath, 'Every package relation must be an object.');
        continue;
      }
      rejectUndeclared(errors, relation, RELATION_KEYS, relationPath, 'undeclared_relation_field');
      if (!validString(relation.id)) {
        pushError(errors, 'missing_relation_id', `${relationPath}.id`, 'Relation id is required.');
      }
      if (!validString(relation.type)) {
        pushError(errors, 'missing_relation_type', `${relationPath}.type`, 'Relation type is required.');
      }
      if (!RELATION_BASES.has(relation.basis)) {
        pushError(errors, 'invalid_relation_basis', `${relationPath}.basis`, `Relation ${relation.id} carries an invalid basis.`);
      }
      if (!isUnitInterval(relation.confidence)) {
        pushError(errors, 'invalid_confidence', `${relationPath}.confidence`, `Relation ${relation.id} confidence must be a number between 0 and 1.`);
      }
      for (const endpointName of ['from', 'to']) {
        const endpoint = relation[endpointName];
        const endpointPath = `${relationPath}.${endpointName}`;
        if (!isRecord(endpoint)) {
          pushError(errors, 'invalid_relation_endpoint', endpointPath, `Relation ${relation.id} ${endpointName} endpoint must be an object.`);
          continue;
        }
        rejectUndeclared(errors, endpoint, ENDPOINT_KEYS, endpointPath, 'undeclared_relation_endpoint_field');
        if (!validString(endpoint.kind) || !validString(endpoint.id)) {
          pushError(errors, 'invalid_relation_endpoint', endpointPath, `Relation ${relation.id} ${endpointName} endpoint requires kind and id.`);
        }
      }
      // Endpoint closure: relations may only point at package-visible objects.
      const fromId = isRecord(relation.from) ? relation.from.id : undefined;
      const toId = isRecord(relation.to) ? relation.to.id : undefined;
      if (!objectIds.has(fromId) || !objectIds.has(toId)) {
        pushError(errors, 'dangling_relation_endpoint', relationPath, `Relation ${relation.id} references an endpoint absent from the package objects.`);
      }
    }
  }

  if (!Array.isArray(pkg.constraints)) {
    pushError(errors, 'invalid_constraints', '$.constraints', 'constraints must be an array.');
  } else {
    for (const [index, constraint] of pkg.constraints.entries()) {
      if (!nonEmptyString(constraint)) {
        pushError(errors, 'invalid_constraint', `$.constraints[${index}]`, 'Constraint entries must be non-empty strings.');
      }
    }
  }

  if (!isRecord(pkg.boundaries)) {
    pushError(errors, 'invalid_boundaries', '$.boundaries', 'boundaries requires non-negative integer hidden_count and unavailable_count.');
  } else {
    rejectUndeclared(errors, pkg.boundaries, BOUNDARY_KEYS, '$.boundaries', 'undeclared_boundary_field');
    if (!isCount(pkg.boundaries.hidden_count) || !isCount(pkg.boundaries.unavailable_count)) {
      pushError(errors, 'invalid_boundaries', '$.boundaries', 'boundaries requires non-negative integer hidden_count and unavailable_count.');
    }
  }

  const provenance = pkg.provenance;
  if (!isRecord(provenance)) {
    pushError(errors, 'missing_provenance', '$.provenance', 'provenance is required.');
  } else {
    rejectUndeclared(errors, provenance, PROVENANCE_KEYS, '$.provenance', 'undeclared_provenance_field');
    if (!isRecord(provenance.created_by)) {
      pushError(errors, 'invalid_created_by', '$.provenance.created_by', 'created_by engine and engine_version are required.');
    } else {
      rejectUndeclared(errors, provenance.created_by, CREATED_BY_KEYS, '$.provenance.created_by', 'undeclared_created_by_field');
      if (!validString(provenance.created_by.engine) || !validString(provenance.created_by.engine_version)) {
        pushError(errors, 'invalid_created_by', '$.provenance.created_by', 'created_by engine and engine_version are required.');
      }
    }
    if (!isRecord(provenance.authorized_by)) {
      pushError(errors, 'invalid_authorized_by', '$.provenance.authorized_by', 'authorized_by must reference an external governance record.');
    } else {
      rejectUndeclared(errors, provenance.authorized_by, AUTHORIZED_BY_KEYS, '$.provenance.authorized_by', 'undeclared_authorized_by_field');
      if (provenance.authorized_by.type !== 'governance_record' || !validString(provenance.authorized_by.id, 280)) {
        pushError(errors, 'invalid_authorized_by', '$.provenance.authorized_by', 'authorized_by must reference an external governance record.');
      }
    }
    if (!validString(provenance.projection_package_id, 160)) {
      pushError(errors, 'missing_projection_link', '$.provenance.projection_package_id', 'The consumed 0296 projection package id is required.');
    }
    if (provenance.generated_at !== undefined && !validString(provenance.generated_at, 64)) {
      pushError(errors, 'invalid_generated_at', '$.provenance.generated_at', 'generated_at must be a non-empty timestamp string up to 64 characters.');
    }
  }

  return { ok: errors.length === 0, errors, package: errors.length === 0 ? pkg : null };
}
