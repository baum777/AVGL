import { createHash } from 'node:crypto';
import { PROJECTION_ENGINE_ID, PROJECTION_ENGINE_VERSION, packageBoundaryCounts } from './context-projection.js';

// AVGL-0296 A-04 — deterministic context package generator.
// Consumes a projected result from evaluateProjection and materializes the
// projection-generated package artifact. This is NOT the AVGL-0295
// agent-consumption/runtime contract and NOT an IR v0.2 schema — it is the
// bounded package artifact owned by 0296-A-04.

export const CONTEXT_PACKAGE_ARTIFACT = 'avgl-context-package-v1';

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function stablePackageId({ irRevision, policyId, policyRevision, governanceId, artifact }) {
  const binding = [artifact, PROJECTION_ENGINE_VERSION, irRevision, policyId, policyRevision, governanceId].join('|');
  return `ctxpkg-${createHash('sha256').update(binding).digest('hex').slice(0, 32)}`;
}

export function generateContextPackage(projection, options = {}) {
  if (!isRecord(projection) || projection.status !== 'projected') {
    throw new TypeError('generateContextPackage requires a projected projection result.');
  }

  const provenance = projection.provenance;
  if (!isRecord(provenance) || typeof provenance.ir_revision !== 'string' || !isRecord(provenance.policy)) {
    throw new TypeError('Projection result is missing binding provenance.');
  }

  const generatedAt = typeof options.now === 'function' ? options.now() : new Date().toISOString();

  return {
    package_id: stablePackageId({
      artifact: CONTEXT_PACKAGE_ARTIFACT,
      irRevision: provenance.ir_revision,
      policyId: provenance.policy.id,
      policyRevision: provenance.policy.revision,
      governanceId: provenance.governance_reference
    }),
    artifact: CONTEXT_PACKAGE_ARTIFACT,
    ir_binding: {
      revision: provenance.ir_revision
    },
    policy_binding: {
      policy_id: provenance.policy.id,
      revision: provenance.policy.revision,
      governance_reference: `governance_record:${provenance.governance_reference}`
    },
    objects: projection.objects,
    relations: projection.relations,
    constraints: projection.constraints,
    boundaries: packageBoundaryCounts(projection),
    provenance: {
      // Executor ≠ authorizer: the engine created the package; only the
      // externally verified governance record authorized the policy.
      created_by: {
        engine: PROJECTION_ENGINE_ID,
        engine_version: PROJECTION_ENGINE_VERSION
      },
      authorized_by: {
        type: 'governance_record',
        id: provenance.governance_reference
      },
      // Envelope field: may vary between runs; semantic content must not.
      generated_at: generatedAt
    }
  };
}

// Semantic content equality: identical for identical IR revision + policy
// revision regardless of the provenance envelope timestamp.
export function comparePackageContent(left, right) {
  const strip = (pkg) => {
    const { provenance, ...rest } = pkg;
    const { generated_at, ...stableProvenance } = provenance ?? {};
    return { ...rest, provenance: stableProvenance };
  };
  return JSON.stringify(strip(left)) === JSON.stringify(strip(right));
}
