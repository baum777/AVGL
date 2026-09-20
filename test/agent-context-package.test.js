import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateProjection } from '../src/context-projection.js';
import { generateContextPackage } from '../src/context-package.js';
import {
  createAgentContextPackage,
  validateAgentContextPackage,
  AGENT_PACKAGE_ENGINE_ID
} from '../src/agent-context-package.js';
import { createAgentHypothesis } from '../src/agent-hypothesis.js';

const REGISTRY = {
  relationTypes: ['calls', 'depends_on'],
  governanceReferences: ['ADR-0295-001']
};

function nodeFixture(id, semanticClass, evidenceState, overrides = {}) {
  return {
    id,
    semanticClass,
    label: id,
    statement: `statement for ${id}`,
    evidenceState,
    confidence: 1,
    evidence: [{ path: `src/${id}.js`, line: 3, snippet: `raw source of ${id}`, detector: 'fixture', sourceKind: 'implementation' }],
    evidenceCount: 1,
    ...overrides
  };
}

function projectionPackageFixture() {
  const ir = {
    avglVersion: '0.1',
    nodes: [
      nodeFixture('runtime.api', 'CAN', 'EXPLICIT'),
      nodeFixture('runtime.scheduler', 'THINK', 'INFERRED'),
      nodeFixture('deploy.pipeline', 'ACT', 'OBSERVED'),
      nodeFixture('db.credentials', 'MAY', 'EXPLICIT')
    ],
    relations: [
      { id: 'rel-1', type: 'calls', from: { kind: 'node', id: 'runtime.api' }, to: { kind: 'node', id: 'deploy.pipeline' }, basis: 'EXPLICIT', confidence: 1, evidence: [] }
    ],
    invariants: ['CAN != MAY', 'ACT != DID', 'Projection != Truth Creation'],
    unknowns: ['KNOW']
  };
  const policy = {
    version: '1',
    identity: { id: 'policy-0295-test', revision: 'rev-1' },
    owner: { reference: { type: 'governance_record', id: 'ADR-0295-001' } },
    scope: {
      include: { objects: ['runtime.*', 'deploy.*', 'db.*'], relations: ['calls'] },
      deny: { objects: ['db.credentials'], relations: [] }
    },
    evidenceBoundary: {
      allowedStates: ['EXPLICIT', 'OBSERVED'],
      inferredHandling: { mode: 'preserve_as_inferred' }
    }
  };
  const projection = evaluateProjection({ ir, policy, revision: 'commit-0295', ...REGISTRY });
  assert.equal(projection.status, 'projected');
  return generateContextPackage(projection, { now: () => '2026-09-20T00:00:00.000Z' });
}

function materialize(consumerContext) {
  return createAgentContextPackage({ projectionPackage: projectionPackageFixture(), consumerContext });
}

test('positive: valid 0296 package materializes a valid governed agent package', () => {
  const projectionPackage = projectionPackageFixture();
  const snapshot = structuredClone(projectionPackage);
  const result = materialize({ agent_id: 'agent-alpha' });

  assert.equal(result.ok, true);
  const pkg = result.package;
  assert.equal(pkg.schema_version, '1');
  assert.equal(pkg.consumer.agent_id, 'agent-alpha');
  assert.equal(pkg.source_binding.ir_revision, 'commit-0295');
  assert.equal(pkg.source_binding.projection_policy_id, 'policy-0295-test');
  assert.equal(pkg.source_binding.projection_policy_revision, 'rev-1');
  assert.equal(pkg.source_binding.governance_reference, 'governance_record:ADR-0295-001');
  assert.equal(pkg.provenance.projection_package_id, projectionPackage.package_id);
  assert.equal(pkg.provenance.created_by.engine, AGENT_PACKAGE_ENGINE_ID);
  assert.equal(pkg.provenance.authorized_by.id, 'ADR-0295-001');

  // identities, evidence references, constraints, boundaries preserved
  assert.deepEqual(pkg.objects.map((node) => node.id).sort(), ['deploy.pipeline', 'runtime.api', 'runtime.scheduler']);
  assert.deepEqual(pkg.objects[0].evidence, [{ path: pkg.objects[0].evidence[0].path, line: 3, sourceKind: 'implementation' }]);
  assert.deepEqual(pkg.constraints, projectionPackage.constraints);
  assert.deepEqual(pkg.boundaries, projectionPackage.boundaries);

  assert.equal(validateAgentContextPackage(pkg).ok, true);
  // no semantics added: object count identical to projection package
  assert.equal(pkg.objects.length, projectionPackage.objects.length);
  assert.equal(pkg.relations.length, projectionPackage.relations.length);
  // the consumed projection package is untouched
  assert.deepEqual(projectionPackage, snapshot);
});

test('NF-0295: raw private source cannot rehydrate — evidence carries references only', () => {
  const result = materialize();
  const serialized = JSON.stringify(result.package);
  assert.doesNotMatch(serialized, /raw source of/);
  assert.doesNotMatch(serialized, /"snippet"/);
  for (const node of result.package.objects) {
    for (const evidence of node.evidence) {
      assert.deepEqual(Object.keys(evidence).sort(), ['line', 'path', 'sourceKind']);
    }
  }
});

test('NF-0295: hidden/restricted content cannot reappear', () => {
  const result = materialize();
  const serialized = JSON.stringify(result.package);
  assert.doesNotMatch(serialized, /db\.credentials/);
  assert.equal(result.package.boundaries.hidden_count >= 1, true);
  assert.equal(result.package.objects.some((node) => node.id === 'db.credentials'), false);
});

test('NF-0295: 0295 cannot accept arbitrary unevidenced objects bypassing 0296', () => {
  const injected = materialize({ objects: [{ id: 'smuggled.node' }], relations: [] });
  assert.equal(injected.ok, false);
  assert.ok(injected.errors.some((error) => error.code === 'undeclared_consumer_field'));

  const arbitrary = createAgentContextPackage({
    projectionPackage: { artifact: 'avgl-context-package-v1', objects: [{ id: 'x', evidenceState: 'EXPLICIT', semanticClass: 'CAN' }] }
  });
  assert.equal(arbitrary.ok, false);
  assert.ok(arbitrary.errors.length > 0);
});

test('NF-0295: context visibility creates no CAN, MAY, or ACT capability/authority fields', () => {
  const result = materialize();
  const serialized = JSON.stringify(result.package);
  assert.doesNotMatch(serialized, /"(permission|authority|granted|can_[a-z_]+|may_[a-z_]+|verified|executed|deployed)"\s*:/);

  const canNode = result.package.objects.find((node) => node.semanticClass === 'CAN');
  assert.ok(canNode, 'CAN-class context may be visible as a labelled object');
  assert.equal(typeof canNode.capabilities, 'undefined');
  assert.equal(typeof canNode.can, 'undefined');

  const actNode = result.package.objects.find((node) => node.semanticClass === 'ACT');
  assert.ok(actNode);
  assert.equal(typeof actNode.execution, 'undefined');
  assert.equal(typeof actNode.executed, 'undefined');
});

test('NF-0295: evidence states cannot be upgraded', () => {
  const result = materialize();
  const projectionPackage = projectionPackageFixture();
  for (const agentObject of result.package.objects) {
    const source = projectionPackage.objects.find((node) => node.id === agentObject.id);
    assert.equal(agentObject.evidenceState, source.evidenceState);
  }
  const inferred = result.package.objects.find((node) => node.id === 'runtime.scheduler');
  assert.equal(inferred.evidenceState, 'INFERRED');
});

test('NF-0295: revision and policy binding cannot be dropped', () => {
  const result = materialize();
  const pkg = result.package;

  for (const key of ['ir_revision', 'projection_policy_id', 'projection_policy_revision']) {
    const broken = structuredClone(pkg);
    delete broken.source_binding[key];
    const outcome = validateAgentContextPackage(broken);
    assert.equal(outcome.ok, false);
    assert.ok(outcome.errors.some((error) => error.path === `$.source_binding.${key}`));
  }

  const noProvenanceLink = structuredClone(pkg);
  delete noProvenanceLink.provenance.projection_package_id;
  assert.equal(validateAgentContextPackage(noProvenanceLink).ok, false);
});

test('NF-0295: relations cannot reference absent endpoints', () => {
  const result = materialize();
  const pkg = result.package;

  const dangling = structuredClone(pkg);
  dangling.relations.push({ id: 'rel-ghost', type: 'calls', from: { kind: 'node', id: 'runtime.api' }, to: { kind: 'node', id: 'not.in.package' }, basis: 'EXPLICIT', confidence: 1 });
  const outcome = validateAgentContextPackage(dangling);
  assert.equal(outcome.ok, false);
  assert.ok(outcome.errors.some((error) => error.code === 'dangling_relation_endpoint'));

  // the materializer itself cannot produce dangling relations from a valid 0296 package
  assert.equal(validateAgentContextPackage(pkg).ok, true);
});

test('NF-0295: deterministic semantic content, envelope timestamp excluded', () => {
  const first = materialize({ agent_id: 'agent-alpha' });
  const second = materialize({ agent_id: 'agent-alpha' });

  assert.equal(first.package.package_id, second.package.package_id);
  const strip = (pkg) => {
    const { provenance, ...rest } = pkg;
    const { generated_at, ...stable } = provenance;
    return { ...rest, provenance: stable };
  };
  assert.deepEqual(strip(first.package), strip(second.package));

  const otherConsumer = materialize({ agent_id: 'agent-beta' });
  assert.notEqual(first.package.package_id, otherConsumer.package.package_id);
});

test('NF-0295: agent confirmation does not create DID — hypothesis return boundary', () => {
  const pkg = materialize({ agent_id: 'agent-alpha' }).package;
  const pkgSnapshot = structuredClone(pkg);

  const returned = createAgentHypothesis({
    agentContextPackage: pkg,
    statement: 'deployment succeeded'
  });

  assert.equal(returned.ok, true);
  const hypothesis = returned.hypothesis;
  assert.equal(hypothesis.artifact, 'avgl-agent-hypothesis-v1');
  assert.equal(hypothesis.marked, 'INFERRED_HYPOTHESIS');
  assert.equal(hypothesis.evidence_state, 'INFERRED');
  assert.equal(hypothesis.acceptance, 'pending_evidence_gate');
  assert.equal(hypothesis.authority_granted, false);
  assert.equal(hypothesis.verification_claimed, false);
  assert.doesNotMatch(JSON.stringify(hypothesis), /"DID"\s*:/);

  // the originating package is untouched: agent output never mutates context or IR
  assert.deepEqual(pkg, pkgSnapshot);
});

test('NF-0295: hypothesis boundary fails closed on invalid input', () => {
  const pkg = materialize().package;

  const noStatement = createAgentHypothesis({ agentContextPackage: pkg });
  assert.equal(noStatement.ok, false);
  assert.ok(noStatement.errors.some((error) => error.code === 'invalid_statement'));

  const noPackage = createAgentHypothesis({ statement: 'agent claim without package' });
  assert.equal(noPackage.ok, false);
  assert.ok(noPackage.errors.some((error) => error.code === 'invalid_agent_context_package'));
});

test('materializer fails closed on malformed projection packages', () => {
  const wrongArtifact = createAgentContextPackage({ projectionPackage: { artifact: 'something-else' } });
  assert.equal(wrongArtifact.ok, false);
  assert.ok(wrongArtifact.errors.some((error) => error.code === 'unsupported_projection_artifact'));

  const noAuthorization = createAgentContextPackage({
    projectionPackage: { artifact: 'avgl-context-package-v1', package_id: 'p', ir_binding: { revision: 'r' }, policy_binding: { policy_id: 'a', revision: 'b' }, objects: [], relations: [], constraints: [] }
  });
  assert.equal(noAuthorization.ok, false);
  assert.ok(noAuthorization.errors.some((error) => error.code === 'missing_projection_authorization'));
});

// --- Review hardening 2026-09-20 (PR #39 threads R-01..R-03) -----------------

test('R-01: validator rejects evidence items carrying raw source fields', () => {
  const pkg = materialize().package;

  for (const smuggledField of ['snippet', 'content', 'detector', 'excerpt']) {
    const poisoned = structuredClone(pkg);
    poisoned.objects[0].evidence[0][smuggledField] = 'raw private source';
    const outcome = validateAgentContextPackage(poisoned);
    assert.equal(outcome.ok, false, `${smuggledField} must not pass validation`);
    assert.ok(outcome.errors.some((error) => error.code === 'undeclared_evidence_field' && error.path.endsWith(`.${smuggledField}`)),
      `${smuggledField} must be named by an undeclared_evidence_field error`);
    assert.equal(outcome.package, null);
  }
});

test('R-01: validator rejects undeclared fields at every contract level', () => {
  const pkg = materialize().package;

  const topLevel = structuredClone(pkg);
  topLevel.content = { raw: 'free-form repository text' };
  let outcome = validateAgentContextPackage(topLevel);
  assert.equal(outcome.ok, false);
  assert.ok(outcome.errors.some((error) => error.code === 'undeclared_package_field' && error.path === '$.content'));

  const onObject = structuredClone(pkg);
  onObject.objects[0].permissions = ['deploy'];
  outcome = validateAgentContextPackage(onObject);
  assert.equal(outcome.ok, false);
  assert.ok(outcome.errors.some((error) => error.code === 'undeclared_object_field' && error.path === '$.objects[0].permissions'));

  const onEvidence = structuredClone(pkg);
  onEvidence.objects[0].evidence[0].semanticResolution = { mode: 'SEMANTIC' };
  outcome = validateAgentContextPackage(onEvidence);
  assert.equal(outcome.ok, false);
  assert.ok(outcome.errors.some((error) => error.code === 'undeclared_evidence_field'));

  const onSourceBinding = structuredClone(pkg);
  onSourceBinding.source_binding.raw_source_ref = 'src/private.js';
  outcome = validateAgentContextPackage(onSourceBinding);
  assert.equal(outcome.ok, false);
  assert.ok(outcome.errors.some((error) => error.code === 'undeclared_source_binding_field'));
});

test('R-01: malformed package elements are rejected, never skipped silently', () => {
  const pkg = materialize().package;

  const nullObject = structuredClone(pkg);
  nullObject.objects.push(null);
  let outcome = validateAgentContextPackage(nullObject);
  assert.equal(outcome.ok, false);
  assert.ok(outcome.errors.some((error) => error.code === 'invalid_object'));

  const idlessObject = structuredClone(pkg);
  delete idlessObject.objects[0].id;
  outcome = validateAgentContextPackage(idlessObject);
  assert.equal(outcome.ok, false);
  assert.ok(outcome.errors.some((error) => error.code === 'missing_object_id'));

  const primitiveRelation = structuredClone(pkg);
  primitiveRelation.relations.push('not-an-object');
  outcome = validateAgentContextPackage(primitiveRelation);
  assert.equal(outcome.ok, false);
  assert.ok(outcome.errors.some((error) => error.code === 'invalid_relation'));

  const objectConstraint = structuredClone(pkg);
  objectConstraint.constraints.push({ smuggled: true });
  outcome = validateAgentContextPackage(objectConstraint);
  assert.equal(outcome.ok, false);
  assert.ok(outcome.errors.some((error) => error.code === 'invalid_constraint'));
});

test('R-02: materializer returns errors instead of throwing on malformed elements', () => {
  const base = {
    artifact: 'avgl-context-package-v1',
    package_id: 'p',
    ir_binding: { revision: 'r' },
    policy_binding: { policy_id: 'a', revision: 'b' },
    provenance: { authorized_by: { type: 'governance_record', id: 'ADR-0295-001' } },
    boundaries: { hidden_count: 0, unavailable_count: 0 }
  };

  const nullObject = createAgentContextPackage({ projectionPackage: { ...base, objects: [null], relations: [], constraints: [] } });
  assert.equal(nullObject.ok, false);
  assert.ok(nullObject.errors.some((error) => error.code === 'invalid_projection_object'));
  assert.equal(nullObject.package, null);

  const emptyRelation = createAgentContextPackage({ projectionPackage: { ...base, objects: [], relations: [{}], constraints: [] } });
  assert.equal(emptyRelation.ok, false);
  assert.ok(emptyRelation.errors.some((error) => error.code === 'invalid_projection_relation'));
  assert.equal(emptyRelation.package, null);
});

test('R-02: materializer fails closed on missing projection boundaries', () => {
  const projectionPackage = projectionPackageFixture();
  delete projectionPackage.boundaries;
  const result = createAgentContextPackage({ projectionPackage, consumerContext: { agent_id: 'agent-alpha' } });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === 'invalid_projection_boundaries'));
  assert.equal(result.package, null);
});

test('R-02: materializer never emits a package its own validator rejects', () => {
  const projectionPackage = projectionPackageFixture();
  delete projectionPackage.objects[0].label;
  const result = createAgentContextPackage({ projectionPackage, consumerContext: { agent_id: 'agent-alpha' } });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === 'missing_object_label'));
  assert.equal(result.package, null);
});

test('R-03: a shape that only looks like a package cannot originate a hypothesis', () => {
  const fake = createAgentHypothesis({ agentContextPackage: { schema_version: '1', package_id: 'fake' }, statement: 'deployment succeeded' });
  assert.equal(fake.ok, false);
  const originError = fake.errors.find((error) => error.code === 'invalid_agent_context_package');
  assert.ok(originError, 'the fake package must be named by invalid_agent_context_package');
  assert.ok(Array.isArray(originError.cause) && originError.cause.length > 0, 'the underlying validation errors must be attached');
  assert.equal(fake.hypothesis, null);
});

test('R-03: hypotheses may only reference objects the origin package exposes', () => {
  const pkg = materialize({ agent_id: 'agent-alpha' }).package;

  const unbound = createAgentHypothesis({ agentContextPackage: pkg, statement: 's', relatedObjectIds: ['ghost.node'] });
  assert.equal(unbound.ok, false);
  assert.ok(unbound.errors.some((error) => error.code === 'unbound_related_object_id'));
  assert.equal(unbound.hypothesis, null);

  const bound = createAgentHypothesis({ agentContextPackage: pkg, statement: 's', relatedObjectIds: ['runtime.api', 'deploy.pipeline'] });
  assert.equal(bound.ok, true);
  assert.deepEqual(bound.hypothesis.related_object_ids, ['runtime.api', 'deploy.pipeline']);
  assert.equal(bound.hypothesis.source.ir_revision, pkg.source_binding.ir_revision);
});

test('public seam exposes the two 0295 contracts', async () => {
  const module = await import('../src/index.js');
  assert.equal(typeof module.createAgentContextPackage, 'function');
  assert.equal(typeof module.validateAgentContextPackage, 'function');
});
