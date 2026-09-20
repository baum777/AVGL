import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateProjection, PROJECTION_ENGINE_ID } from '../src/context-projection.js';
import { generateContextPackage, comparePackageContent } from '../src/context-package.js';
import { validateProjectionPolicy } from '../src/projection-policy.js';

const REGISTRY = {
  relationTypes: ['calls', 'depends_on', 'configures'],
  governanceReferences: ['ADR-0296-001']
};

function nodeFixture(id, semanticClass, evidenceState, overrides = {}) {
  return {
    id,
    semanticClass,
    label: id,
    statement: `statement for ${id}`,
    evidenceState,
    confidence: 1,
    evidence: [{ path: `src/${id}.js`, line: 1, snippet: '', detector: 'fixture', sourceKind: 'implementation' }],
    evidenceCount: 1,
    ...overrides
  };
}

function baseIr() {
  return {
    avglVersion: '0.1',
    nodes: [
      nodeFixture('runtime.api', 'CAN', 'EXPLICIT'),
      nodeFixture('runtime.credentials', 'MAY', 'EXPLICIT'),
      nodeFixture('runtime.guess', 'THINK', 'INFERRED'),
      nodeFixture('runtime.mystery', 'KNOW', 'UNKNOWN'),
      nodeFixture('deploy.pipeline', 'ACT', 'OBSERVED'),
      nodeFixture('did.receipt', 'DID', 'EXPLICIT')
    ],
    relations: [
      { id: 'rel-1', type: 'calls', from: { kind: 'node', id: 'runtime.api' }, to: { kind: 'node', id: 'did.receipt' }, basis: 'EXPLICIT', confidence: 1, evidence: [] },
      { id: 'rel-2', type: 'calls', from: { kind: 'node', id: 'runtime.api' }, to: { kind: 'node', id: 'runtime.credentials' }, basis: 'EXPLICIT', confidence: 1, evidence: [] },
      { id: 'rel-3', type: 'depends_on', from: { kind: 'node', id: 'runtime.api' }, to: { kind: 'node', id: 'runtime.mystery' }, basis: 'INFERRED', confidence: 0.5, evidence: [] }
    ],
    invariants: ['CAN != MAY', 'ACT != DID', 'Projection != Truth Creation'],
    unknowns: ['KNOW']
  };
}

function policyFixture(overrides = {}) {
  return {
    version: '1',
    identity: { id: 'policy-0296-test', revision: 'rev-1' },
    owner: { reference: { type: 'governance_record', id: 'ADR-0296-001' } },
    scope: {
      include: { objects: ['runtime.*', 'deploy.*', 'did.receipt'], relations: ['calls', 'depends_on'] },
      deny: { objects: ['runtime.credentials'], relations: [] }
    },
    evidenceBoundary: {
      allowedStates: ['EXPLICIT', 'OBSERVED'],
      inferredHandling: { mode: 'preserve_as_inferred' }
    },
    ...overrides
  };
}

function project(ir = baseIr(), policy = policyFixture(), revision = 'commit-abc123') {
  return evaluateProjection({ ir, policy, revision, ...REGISTRY });
}

test('positive fixture: authorized policy projects visible objects, relations, bindings, provenance', () => {
  const projection = project();
  assert.equal(projection.status, 'projected');

  const api = projection.objects.find((node) => node.id === 'runtime.api');
  assert.ok(api, 'runtime.api should be visible');
  assert.equal(api.evidenceState, 'EXPLICIT');
  assert.equal(api.evidence[0].path, 'src/runtime.api.js');

  assert.equal(projection.relations.length, 1);
  assert.equal(projection.relations[0].id, 'rel-1');
  assert.equal(projection.relations[0].basis, 'EXPLICIT');

  assert.deepEqual(projection.constraints, ['ACT != DID', 'CAN != MAY', 'Projection != Truth Creation']);

  assert.equal(projection.provenance.ir_revision, 'commit-abc123');
  assert.equal(projection.provenance.executor, PROJECTION_ENGINE_ID);
  assert.equal(projection.provenance.authorizer, 'governance_record:ADR-0296-001');
  assert.notEqual(projection.provenance.executor, projection.provenance.authorizer);
});

test('NF-0296-01: projection creates no evidence and UNKNOWN stays UNKNOWN', () => {
  const ir = baseIr();
  const snapshot = structuredClone(ir);
  const projection = project(ir);

  assert.ok(!projection.objects.some((node) => node.id === 'runtime.mystery'), 'UNKNOWN content must not project');
  for (const object of projection.objects) {
    const source = ir.nodes.find((node) => node.id === object.id);
    assert.equal(object.evidence.length, source.evidence.length, 'no evidence records may be added');
    assert.equal(object.evidenceState, source.evidenceState, 'evidence state may not change');
  }
  assert.deepEqual(ir, snapshot);
  const projectedContent = JSON.stringify({ objects: projection.objects, relations: projection.relations });
  assert.ok(!projectedContent.includes('runtime.mystery'));
});

test('NF-0296-02..05: CAN/MAY/ACT/DID invariants survive projection unchanged', () => {
  const ir = baseIr();
  const snapshot = structuredClone(ir);
  const projection = project(ir);
  const pkg = generateContextPackage(projection, { now: () => '2026-09-20T00:00:00.000Z' });

  assert.deepEqual(ir, snapshot);
  const serialized = JSON.stringify(pkg);
  assert.doesNotMatch(serialized, /"(permission|authority|granted|capability_grant|can_[a-z_]+|may_[a-z_]+|verified|executed|deployed)"\s*:/);
  const mayNode = pkg.objects.find((node) => node.id === 'runtime.credentials');
  assert.equal(mayNode, undefined, 'denied MAY context stays hidden');
  const actNode = pkg.objects.find((node) => node.id === 'deploy.pipeline');
  assert.ok(actNode, 'ACT context may be visible');
  assert.equal(actNode.semanticClass, 'ACT', 'class label is preserved, not converted');
});

test('NF-0296-06: policy cannot self-authorize', () => {
  const selfApproved = policyFixture({ approved: true });
  const shapeResult = validateProjectionPolicy(selfApproved, REGISTRY);
  assert.equal(shapeResult.ok, false);
  assert.ok(shapeResult.errors.some((error) => error.code === 'undeclared_field'));

  const rejected = evaluateProjection({
    ir: baseIr(),
    policy: policyFixture(),
    revision: 'commit-abc123',
    relationTypes: REGISTRY.relationTypes,
    governanceReferences: ['SOME_OTHER_RECORD']
  });
  assert.equal(rejected.status, 'not_projected');
  assert.equal(rejected.reason, 'policy_invalid');
  assert.ok(rejected.errors.some((error) => error.code === 'governance_reference_unverified'));
  assert.deepEqual(rejected.objects, []);

  const authorized = project();
  assert.equal(authorized.status, 'projected');
});

test('NF-0296-07: deny beats include', () => {
  const projection = project();
  assert.equal(projection.dispositions.objects['runtime.credentials'], 'RESTRICTED');
  assert.equal(projection.dispositions.objects['runtime.api'], 'VISIBLE');

  const pkg = generateContextPackage(projection, { now: () => '2026-09-20T00:00:00.000Z' });
  assert.ok(pkg.boundaries.hidden_count >= 1);
  assert.doesNotMatch(JSON.stringify(pkg), /runtime\.credentials/);
});

test('NF-0296-08: no matching policy fails closed to zero projected content', () => {
  const withoutPolicy = project(baseIr(), null);
  assert.equal(withoutPolicy.status, 'not_projected');
  assert.equal(withoutPolicy.reason, 'policy_invalid');
  assert.deepEqual(withoutPolicy.objects, []);

  const noMatch = project(baseIr(), policyFixture({
    scope: {
      include: { objects: ['nothing.*'], relations: ['calls'] },
      deny: { objects: [], relations: [] }
    }
  }));
  assert.equal(noMatch.status, 'projected');
  assert.deepEqual(noMatch.objects, []);
  assert.deepEqual(noMatch.relations, []);
});

test('NF-0296-09: evidence and visibility axes never convert', () => {
  const projection = project();
  const api = projection.objects.find((node) => node.id === 'runtime.api');
  assert.equal(api.evidenceState, 'EXPLICIT', 'VISIBLE must not upgrade EXPLICIT to OBSERVED');

  const visibilityValues = new Set(Object.values(projection.dispositions.objects));
  for (const value of visibilityValues) {
    assert.ok(['VISIBLE', 'NOT_PROJECTED', 'RESTRICTED', 'UNAVAILABLE'].includes(value));
  }
  for (const object of projection.objects) {
    assert.notEqual(object.evidenceState, 'UNKNOWN', 'no object may surface with UNKNOWN content state');
  }
});

test('NF-0296-10: relation with hidden endpoint is omitted without identifier leakage', () => {
  const projection = project();
  assert.ok(!projection.relations.some((relation) => relation.id === 'rel-2'));
  assert.doesNotMatch(JSON.stringify(projection.relations), /runtime\.credentials/);
});

test('NF-0296-11: same IR and policy produce identical semantic package content', () => {
  const first = generateContextPackage(project(), { now: () => '2026-09-20T00:00:00.000Z' });
  const second = generateContextPackage(project(), { now: () => '2026-09-20T09:41:00.000Z' });

  assert.equal(first.package_id, second.package_id);
  assert.ok(comparePackageContent(first, second));
  assert.notEqual(first.provenance.generated_at, second.provenance.generated_at);
});

test('NF-0296-12: policy mutation changes the binding deterministically', () => {
  const first = generateContextPackage(project(), { now: () => '2026-09-20T00:00:00.000Z' });
  const mutated = generateContextPackage(project(baseIr(), policyFixture({
    identity: { id: 'policy-0296-test', revision: 'rev-2' }
  })), { now: () => '2026-09-20T00:00:00.000Z' });

  assert.equal(first.policy_binding.revision, 'rev-1');
  assert.equal(mutated.policy_binding.revision, 'rev-2');
  assert.notEqual(first.package_id, mutated.package_id);
});

test('NF-0296-13: unknown relation type fails policy validation before projection', () => {
  const rejected = evaluateProjection({
    ir: baseIr(),
    policy: policyFixture({
      scope: {
        include: { objects: ['runtime.*'], relations: ['calls', 'warp_drive'] },
        deny: { objects: [], relations: [] }
      }
    }),
    revision: 'commit-abc123',
    relationTypes: REGISTRY.relationTypes,
    governanceReferences: REGISTRY.governanceReferences
  });
  assert.equal(rejected.status, 'not_projected');
  assert.ok(rejected.errors.some((error) => error.code === 'unknown_relation_type'));
});

test('NF-0296-14: INFERRED content is preserved as INFERRED', () => {
  const projection = project();
  const guess = projection.objects.find((node) => node.id === 'runtime.guess');
  assert.ok(guess, 'preserve_as_inferred keeps INFERRED content visible');
  assert.equal(guess.evidenceState, 'INFERRED');
  assert.notEqual(guess.evidenceState, 'EXPLICIT');
  assert.notEqual(guess.evidenceState, 'OBSERVED');
});

test('NF-0296-15: inferredHandling deny blocks content but never mutates evidence', () => {
  const ir = baseIr();
  const snapshot = structuredClone(ir);
  const projection = project(ir, policyFixture({
    evidenceBoundary: {
      allowedStates: ['EXPLICIT', 'OBSERVED'],
      inferredHandling: { mode: 'deny' }
    }
  }));

  assert.ok(!projection.objects.some((node) => node.id === 'runtime.guess'));
  assert.equal(projection.dispositions.objects['runtime.guess'], 'UNAVAILABLE');
  const source = ir.nodes.find((node) => node.id === 'runtime.guess');
  assert.equal(source.evidenceState, 'INFERRED');
  assert.deepEqual(ir, snapshot);
});

test('DERIVED relation basis is handled conservatively under inferredHandling', () => {
  const ir = baseIr();
  ir.relations.push({
    id: 'rel-4', type: 'depends_on',
    from: { kind: 'node', id: 'runtime.api' }, to: { kind: 'node', id: 'deploy.pipeline' },
    basis: 'DERIVED', confidence: 0.4, evidence: []
  });

  const preserved = project(ir);
  assert.ok(preserved.relations.some((relation) => relation.id === 'rel-4'));

  const denied = project(ir, policyFixture({
    evidenceBoundary: {
      allowedStates: ['EXPLICIT', 'OBSERVED'],
      inferredHandling: { mode: 'deny' }
    }
  }));
  assert.ok(!denied.relations.some((relation) => relation.id === 'rel-4'));
});

test('projection fails closed without a revision binding', () => {
  const projection = evaluateProjection({ ir: baseIr(), policy: policyFixture(), revision: undefined, ...REGISTRY });
  assert.equal(projection.status, 'not_projected');
  assert.equal(projection.reason, 'missing_revision');
});

test('selector semantics: exact and trailing-wildcard prefix matching only', () => {
  const projection = project(baseIr(), policyFixture({
    scope: {
      include: { objects: ['runtime.api', 'deploy.*'], relations: ['calls'] },
      deny: { objects: [], relations: [] }
    }
  }));
  assert.deepEqual(projection.objects.map((node) => node.id).sort(), ['deploy.pipeline', 'runtime.api']);
});

test('package boundaries stay aggregate-only', () => {
  const pkg = generateContextPackage(project(), { now: () => '2026-09-20T00:00:00.000Z' });
  assert.equal(pkg.boundaries.hidden_count, 3);
  assert.equal(pkg.boundaries.unavailable_count, 1);
  assert.ok(Object.keys(pkg.boundaries).every((key) => key.endsWith('_count')));
});

test('public seam exposes the three 0296 contracts', async () => {
  const module = await import('../src/index.js');
  assert.equal(typeof module.validateProjectionPolicy, 'function');
  assert.equal(typeof module.evaluateProjection, 'function');
  assert.equal(typeof module.generateContextPackage, 'function');
});
