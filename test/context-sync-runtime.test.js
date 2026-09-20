import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateProjection } from '../src/context-projection.js';
import { generateContextPackage } from '../src/context-package.js';
import { createAgentContextPackage } from '../src/agent-context-package.js';
import {
  createContextSyncRuntime,
  validateContextSyncRecord,
  contextBindingOf,
  contextBindingKey
} from '../src/context-sync-runtime.js';
import {
  createContextSyncMessage,
  validateContextSyncMessage,
  assertTrustedContextMessageSource
} from '../src/context-sync-messages.js';

const REGISTRY = { relationTypes: ['calls'], governanceReferences: ['ADR-0294-001'] };

function agentPackageFixture(revision = 'rev-1', policyRevision = 'p-1') {
  const ir = {
    avglVersion: '0.1',
    nodes: [
      { id: 'runtime.api', semanticClass: 'CAN', label: 'api', statement: 's', evidenceState: 'EXPLICIT', confidence: 1, evidence: [{ path: 'src/api.js', line: 2, snippet: 'raw', detector: 'd', sourceKind: 'implementation' }], evidenceCount: 1 },
      { id: 'db.secrets', semanticClass: 'MAY', label: 'secrets', statement: 's', evidenceState: 'EXPLICIT', confidence: 1, evidence: [{ path: 'src/db.js', line: 3, snippet: 'raw', detector: 'd', sourceKind: 'implementation' }], evidenceCount: 1 }
    ],
    relations: [],
    invariants: ['CAN != MAY', 'ACT != DID', 'Projection != Truth Creation'],
    unknowns: []
  };
  const policy = {
    version: '1',
    identity: { id: 'policy-0294', revision: policyRevision },
    owner: { reference: { type: 'governance_record', id: 'ADR-0294-001' } },
    scope: {
      include: { objects: ['runtime.*', 'db.*'], relations: [] },
      deny: { objects: ['db.secrets'], relations: [] }
    },
    evidenceBoundary: { allowedStates: ['EXPLICIT', 'OBSERVED'], inferredHandling: { mode: 'deny' } }
  };
  const projection = evaluateProjection({ ir, policy, revision, ...REGISTRY });
  assert.equal(projection.status, 'projected');
  const projectionPackage = generateContextPackage(projection, { now: () => '2026-09-20T00:00:00.000Z' });
  const agent = createAgentContextPackage({ projectionPackage, consumerContext: { agent_id: 'agent-sync' } });
  assert.equal(agent.ok, true);
  return agent.package;
}

function bindingOf(pkg) {
  return contextBindingOf(pkg);
}

function runtime(options = {}) {
  return createContextSyncRuntime({ maxAttempts: 2, backoffMs: 0, ...options });
}

test('positive: full 0296 → 0295 → 0294 chain stores, serves, and refreshes', async () => {
  const initial = agentPackageFixture('rev-1');
  const refreshed = agentPackageFixture('rev-2');
  let serveCount = 0;
  const sync = runtime({
    refresher: async () => {
      serveCount += 1;
      return refreshed;
    }
  });

  const stored = await sync.putContextPackage(initial);
  assert.equal(stored.ok, true);
  assert.equal(stored.state, 'FRESH');

  const current = await sync.getCurrentContext(bindingOf(initial));
  assert.equal(current.sync_state, 'FRESH');
  assert.equal(current.package.source_binding.ir_revision, 'rev-1');

  await sync.invalidateContextPackage(bindingOf(initial), { reason_class: 'ir_revision_changed' });
  let state = await sync.getCurrentContext(bindingOf(initial));
  assert.equal(state.sync_state, 'STALE');
  assert.ok(state.package, 'last-valid package remains servable, state-labeled');

  const refresh = await sync.refreshContext(bindingOf(initial));
  assert.equal(refresh.ok, true);
  assert.equal(refresh.state, 'FRESH');
  assert.equal(serveCount, 1);

  state = await sync.getCurrentContext(bindingOf(refreshed));
  assert.equal(state.sync_state, 'FRESH');
  assert.equal(state.package.source_binding.ir_revision, 'rev-2');
  assert.deepEqual(state.package.constraints, ['ACT != DID', 'CAN != MAY', 'Projection != Truth Creation']);
  assert.equal(state.package.objects[0].evidence[0].path, 'src/api.js');
});

test('NF-0294-01: malformed package is rejected, cache unchanged', async () => {
  const valid = agentPackageFixture();
  const sync = runtime();
  await sync.putContextPackage(valid);

  const malformed = structuredClone(valid);
  delete malformed.source_binding.ir_revision;
  const outcome = await sync.putContextPackage(malformed);
  assert.equal(outcome.ok, false);
  assert.equal(outcome.code, 'package_rejected');

  const current = await sync.getCurrentContext(bindingOf(valid));
  assert.equal(current.sync_state, 'FRESH');
  assert.equal(current.package.source_binding.ir_revision, valid.source_binding.ir_revision);
});

test('NF-0294-02: stale does not become UNKNOWN — evidence and sync axes stay separate', async () => {
  const pkg = agentPackageFixture();
  const sync = runtime();
  await sync.putContextPackage(pkg);
  await sync.invalidateContextPackage(bindingOf(pkg));

  const record = await sync.getContextPackage(bindingOf(pkg));
  assert.equal(record.sync.state, 'STALE');
  for (const object of record.package.objects) {
    assert.equal(typeof object.evidenceState, 'string');
    assert.ok(['EXPLICIT', 'INFERRED', 'OBSERVED', 'UNKNOWN'].includes(object.evidenceState));
    assert.notEqual(object.evidenceState, 'STALE', 'sync states never leak into evidence states');
  }
  assert.ok(!JSON.stringify(record.sync).includes('evidenceState'));
});

test('NF-0294-03: offline package is OFFLINE_AVAILABLE, never FRESH', async () => {
  const pkg = agentPackageFixture();
  const sync = runtime({
    refresher: async () => { throw Object.assign(new Error('network down'), { error_class: 'network' }); }
  });
  await sync.putContextPackage(pkg);
  await sync.invalidateContextPackage(bindingOf(pkg));

  const refresh = await sync.refreshContext(bindingOf(pkg));
  assert.equal(refresh.ok, false);
  assert.equal(refresh.state, 'OFFLINE_AVAILABLE');

  const current = await sync.getCurrentContext(bindingOf(pkg));
  assert.equal(current.sync_state, 'OFFLINE_AVAILABLE');
  assert.notEqual(current.sync_state, 'FRESH');
});

test('NF-0294-04 + NF-0294-05: sync success and cache hit create no DID/verification', async () => {
  const pkg = agentPackageFixture();
  const sync = runtime({ refresher: async () => structuredClone(pkg) });
  await sync.putContextPackage(pkg);
  await sync.refreshContext(bindingOf(pkg));
  const current = await sync.getCurrentContext(bindingOf(pkg));

  const serialized = JSON.stringify(current);
  assert.doesNotMatch(serialized, /"(DID|did|verified|verification|receipt)"\s*:/);
  const didNode = current.package.objects.find((node) => node.semanticClass === 'DID');
  assert.equal(didNode, undefined, 'no DID object materializes from synchronization');
  assert.equal(current.package.provenance.created_by.engine, 'avgl-agent-context-package-engine');
  assert.equal(current.package.provenance.authorized_by.type, 'governance_record');
});

test('NF-0294-06: invalid newer package cannot poison a valid cache entry', async () => {
  const valid = agentPackageFixture('rev-1');
  const sync = runtime();
  await sync.putContextPackage(valid);

  const poisoned = agentPackageFixture('rev-1');
  poisoned.relations.push({ id: 'rel-poison', type: 'calls', from: { kind: 'node', id: 'runtime.api' }, to: { kind: 'node', id: 'ghost.node' }, basis: 'EXPLICIT', confidence: 1 });
  const outcome = await sync.putContextPackage(poisoned);
  assert.equal(outcome.ok, false);
  assert.ok(outcome.errors.some((error) => error.code === 'dangling_relation_endpoint'));

  const current = await sync.getCurrentContext(bindingOf(valid));
  assert.equal(current.package.objects.length, valid.objects.length);
});

test('NF-0294-07: out-of-order refresh response cannot overwrite a newer package', async () => {
  const rev1 = agentPackageFixture('rev-1');
  const rev2 = agentPackageFixture('rev-2');
  let releaseOld;
  const gate = new Promise((resolve) => { releaseOld = resolve; });
  const sync = runtime({
    refresher: async (binding) => {
      if (binding.ir_revision === 'rev-1') {
        await gate;
        return rev1;
      }
      return rev2;
    }
  });

  await sync.putContextPackage(rev1);
  const staleBinding = bindingOf(rev1);
  await sync.invalidateContextPackage(staleBinding);

  // R1 starts against the rev-1 binding but hangs.
  const slow = sync.refreshContext(staleBinding);
  // R2 completes in the meantime via direct validated delivery of rev-2.
  await sync.putContextPackage(rev2);
  releaseOld();
  const slowOutcome = await slow;

  assert.equal(slowOutcome.ok, false);
  assert.equal(slowOutcome.code, 'superseded');
  const current = await sync.getCurrentContext(bindingOf(rev2));
  assert.equal(current.package.source_binding.ir_revision, 'rev-2');
});

test('NF-0294-08 + NF-0294-09: policy and IR revisions change cache identity', async () => {
  const base = agentPackageFixture('rev-1', 'p-1');
  const otherPolicy = agentPackageFixture('rev-1', 'p-2');
  const otherRevision = agentPackageFixture('rev-2', 'p-1');

  const keyBase = contextBindingKey(bindingOf(base));
  const keyPolicy = contextBindingKey(bindingOf(otherPolicy));
  const keyRevision = contextBindingKey(bindingOf(otherRevision));

  assert.notEqual(keyBase, keyPolicy);
  assert.notEqual(keyBase, keyRevision);

  const sync = runtime();
  await sync.putContextPackage(base);
  await sync.putContextPackage(otherPolicy);
  const states = await sync.listContextPackageStates();
  assert.equal(states.length, 2);
  assert.ok(states.every((entry) => ['FRESH', 'STALE'].includes(entry.state)));
});

test('NF-0294-10: duplicate refreshes coalesce into one upstream request', async () => {
  const pkg = agentPackageFixture('rev-1');
  const target = agentPackageFixture('rev-2');
  let calls = 0;
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const sync = runtime({
    refresher: async () => {
      calls += 1;
      await gate;
      return target;
    }
  });
  await sync.putContextPackage(pkg);

  const first = sync.refreshContext(bindingOf(pkg));
  const second = sync.refreshContext(bindingOf(pkg));
  const third = sync.refreshContext(bindingOf(pkg));
  release();
  const outcomes = await Promise.all([first, second, third]);

  assert.equal(calls, 1);
  for (const outcome of outcomes) {
    assert.equal(outcome.ok, true);
  }
});

test('NF-0294-11: retry is bounded — no infinite loops', async () => {
  const pkg = agentPackageFixture();
  let attempts = 0;
  const sync = runtime({
    maxAttempts: 3,
    backoffMs: 0,
    refresher: async () => {
      attempts += 1;
      throw Object.assign(new Error('down'), { error_class: 'network' });
    }
  });
  await sync.putContextPackage(pkg);
  const outcome = await sync.refreshContext(bindingOf(pkg));

  assert.equal(outcome.ok, false);
  assert.equal(attempts, 3);
  const record = await sync.getContextPackage(bindingOf(pkg));
  assert.equal(record.sync.attempts, 3);
  assert.equal(record.sync.last_error_class, 'network');
  assert.equal(record.sync.state, 'OFFLINE_AVAILABLE');
});

test('NF-0294-12: hidden/private fields cannot reappear in stored or served packages', async () => {
  const pkg = agentPackageFixture();
  const sync = runtime();
  await sync.putContextPackage(pkg);

  const stored = await sync.getContextPackage(bindingOf(pkg));
  const served = await sync.getCurrentContext(bindingOf(pkg));
  for (const payload of [stored.package, served.package]) {
    const serialized = JSON.stringify(payload);
    assert.doesNotMatch(serialized, /db\.secrets/);
    assert.doesNotMatch(serialized, /"snippet"/);
    assert.ok(!serialized.includes('raw'));
  }
});

test('NF-0294-13: runtime metadata never mutates the semantic package', async () => {
  const pkg = agentPackageFixture();
  const snapshot = structuredClone(pkg);
  const sync = runtime({ refresher: async () => structuredClone(pkg) });
  await sync.putContextPackage(pkg);
  await sync.invalidateContextPackage(bindingOf(pkg));
  await sync.refreshContext(bindingOf(pkg));
  await sync.getCurrentContext(bindingOf(pkg));

  const record = await sync.getContextPackage(bindingOf(pkg));
  assert.deepEqual(record.package, snapshot, 'semantic package deep-equal after full lifecycle');
});

test('NF-0294-14: unknown message types are rejected fail-closed', () => {
  const rogue = validateContextSyncMessage({ type: 'CONTEXT_PURGE_ALL', binding: { package_id: 'x', ir_revision: 'r', policy_id: 'p', policy_revision: '1' } });
  assert.equal(rogue.ok, false);
  assert.equal(rogue.errors[0].code, 'unknown_message_type');

  const undeclared = validateContextSyncMessage({ type: 'CONTEXT_GET', binding: { package_id: 'x', ir_revision: 'r', policy_id: 'p', policy_revision: '1' }, grant_authority: true });
  assert.equal(undeclared.ok, false);
  assert.ok(undeclared.errors.some((error) => error.code === 'undeclared_field'));

  const valid = createContextSyncMessage('CONTEXT_REFRESH', { binding: { package_id: 'x', ir_revision: 'r', policy_id: 'p', policy_revision: '1' } });
  assert.equal(valid.ok, true);
});

test('NF-0294-15: offline context grants no authority', async () => {
  const pkg = agentPackageFixture();
  const sync = runtime({ refresher: async () => { throw Object.assign(new Error('down'), { error_class: 'network' }); } });
  await sync.putContextPackage(pkg);
  await sync.invalidateContextPackage(bindingOf(pkg));
  await sync.refreshContext(bindingOf(pkg));

  const current = await sync.getCurrentContext(bindingOf(pkg));
  assert.equal(current.sync_state, 'OFFLINE_AVAILABLE');
  const serialized = JSON.stringify(current);
  assert.doesNotMatch(serialized, /"(MAY|CAN|ACT|DID|permission|authority|grant)"\s*:\s*(true|"[^"]*active)/);
});

test('origin boundary: cross-origin message sources are untrusted', () => {
  const trusted = assertTrustedContextMessageSource({ origin: 'https://avgl.example' }, { selfOrigin: 'https://avgl.example' });
  assert.equal(trusted.ok, true);
  const untrusted = assertTrustedContextMessageSource({ origin: 'https://evil.example' }, { selfOrigin: 'https://avgl.example' });
  assert.equal(untrusted.ok, false);
  assert.equal(untrusted.code, 'untrusted_origin');
  const missing = assertTrustedContextMessageSource({}, { selfOrigin: 'https://avgl.example' });
  assert.equal(missing.ok, false);
  assert.equal(missing.code, 'missing_origin');
});

test('record contract: closed shape, states, sequence guard', () => {
  const binding = { package_id: 'p', ir_revision: 'r', policy_id: 'po', policy_revision: 'pr' };
  const record = {
    binding_key: contextBindingKey(binding),
    binding,
    package: agentPackageFixture(),
    seq: 0,
    sync: { state: 'FRESH', stored_at: '2026-09-20T00:00:00.000Z', attempts: 0 }
  };
  assert.equal(validateContextSyncRecord(record).ok, true);

  const mutated = structuredClone(record);
  mutated.sync.state = 'SUPER_FRESH';
  assert.equal(validateContextSyncRecord(mutated).ok, false);

  const smuggled = structuredClone(record);
  smuggled.authority = true;
  const outcome = validateContextSyncRecord(smuggled);
  assert.equal(outcome.ok, false);
  assert.ok(outcome.errors.some((error) => error.code === 'undeclared_field'));
});

test('subscription: state changes notify subscribers', async () => {
  const pkg = agentPackageFixture();
  const sync = runtime({ refresher: async () => structuredClone(pkg) });
  const seen = [];
  const unsubscribe = sync.subscribeContextState(bindingOf(pkg), (event) => seen.push(event.state));

  await sync.putContextPackage(pkg);
  await sync.invalidateContextPackage(bindingOf(pkg));
  await sync.refreshContext(bindingOf(pkg));
  unsubscribe();
  await sync.invalidateContextPackage(bindingOf(pkg));

  assert.ok(seen.includes('REFRESHING'));
  assert.ok(seen.indexOf('FRESH') < seen.indexOf('STALE'));
  assert.ok(seen.lastIndexOf('FRESH') > seen.indexOf('REFRESHING'));
  assert.equal(seen.length, 4, 'no events after unsubscribe');
});

test('empty and unavailable delivery states are explicit', async () => {
  const sync = runtime();
  const empty = await sync.getCurrentContext({ package_id: 'x', ir_revision: 'r', policy_id: 'p', policy_revision: '1' });
  assert.equal(empty.sync_state, 'EMPTY');
  assert.equal(empty.package, null);

  const noRefresher = await sync.refreshContext(bindingOf(agentPackageFixture()));
  assert.equal(noRefresher.ok, false);
  assert.equal(noRefresher.code, 'no_refresher');
});

test('public seam exposes the 0294 contracts', async () => {
  const module = await import('../src/index.js');
  assert.equal(typeof module.createContextSyncRuntime, 'function');
  assert.equal(typeof module.validateContextSyncRecord, 'function');
  assert.equal(typeof module.validateContextSyncMessage, 'function');
  assert.equal(typeof module.assertTrustedContextMessageSource, 'function');
});
