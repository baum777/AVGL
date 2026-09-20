import { createHash } from 'node:crypto';
import { validateAgentContextPackage } from './agent-context-package.js';

// AVGL-0294 — context synchronization runtime (A-01 contract, A-02 store,
// A-03 refresh/invalidation coordinator, A-04 offline + delivery core).
// SYNC != SEMANTICS: this module moves governed 0295 agent context packages
// through time and runtime. It never creates semantics, evidence, visibility,
// or authority, and never mutates package content — runtime metadata lives
// beside the package (sync axis), never inside semantic fields.

export const CONTEXT_SYNC_ENGINE_ID = 'avgl-context-sync-runtime';
export const CONTEXT_SYNC_ENGINE_VERSION = '0294-A-01';

export const SYNC_STATES = Object.freeze([
  'EMPTY',
  'FRESH',
  'STALE',
  'REFRESHING',
  'OFFLINE_AVAILABLE',
  'UNAVAILABLE',
  'INVALID'
]);

// Explicit transition table (fail-closed: anything not listed is illegal).
export const SYNC_TRANSITIONS = Object.freeze({
  EMPTY: ['FRESH', 'REFRESHING', 'UNAVAILABLE'],
  FRESH: ['STALE', 'REFRESHING', 'INVALID'],
  STALE: ['REFRESHING', 'OFFLINE_AVAILABLE', 'INVALID'],
  REFRESHING: ['FRESH', 'STALE', 'OFFLINE_AVAILABLE', 'UNAVAILABLE', 'INVALID', 'REFRESHING'],
  OFFLINE_AVAILABLE: ['REFRESHING', 'STALE', 'INVALID'],
  UNAVAILABLE: ['REFRESHING', 'INVALID'],
  INVALID: ['REFRESHING']
});

const SYNC_RECORD_KEYS = new Set(['binding_key', 'binding', 'package', 'sync', 'seq']);
const SYNC_META_KEYS = new Set(['state', 'stored_at', 'last_checked_at', 'last_refresh_attempt', 'attempts', 'last_error_class', 'invalidation_reason']);
const BINDING_KEYS = new Set(['package_id', 'ir_revision', 'policy_id', 'policy_revision', 'governance_reference', 'consumer']);

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function validString(value, maxLength = 280) {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength;
}

function clone(value) {
  return structuredClone(value);
}

// --- package identity (§8) ---------------------------------------------------

export function contextBindingOf(agentPackage) {
  if (!isRecord(agentPackage) || !isRecord(agentPackage.source_binding)) return null;
  const binding = {
    package_id: agentPackage.package_id,
    ir_revision: agentPackage.source_binding.ir_revision,
    policy_id: agentPackage.source_binding.projection_policy_id,
    policy_revision: agentPackage.source_binding.projection_policy_revision,
    governance_reference: agentPackage.source_binding.governance_reference
  };
  if (isRecord(agentPackage.consumer) && agentPackage.consumer.agent_id !== undefined) {
    binding.consumer = agentPackage.consumer.agent_id;
  }
  for (const value of Object.values(binding)) {
    if (value !== undefined && !validString(value)) return null;
  }
  return binding;
}

export function contextBindingKey(binding) {
  const canonical = JSON.stringify(binding, Object.keys(binding).sort());
  return `ctxsync-${createHash('sha256').update(canonical).digest('hex').slice(0, 40)}`;
}

// Lineage: the governed context stream a binding belongs to. Revisions
// (package_id, ir_revision, policy_revision) change the binding key but not
// the lineage — a refresh may therefore deliver a NEWER revision as a new
// cache entry while older entries are marked superseded. Revisions are
// opaque strings, so ordering is modeled by the runtime's acceptance
// counter, never by comparing revision strings.
function contextLineageKey(binding) {
  const lineage = {
    policy_id: binding.policy_id,
    governance_reference: binding.governance_reference ?? '',
    consumer: binding.consumer ?? ''
  };
  return `lineage-${createHash('sha256').update(JSON.stringify(lineage, Object.keys(lineage).sort())).digest('hex').slice(0, 40)}`;
}

function resolveKey(bindingOrKey) {
  if (typeof bindingOrKey === 'string' && bindingOrKey.length > 0) return bindingOrKey;
  if (isRecord(bindingOrKey)) return contextBindingKey(bindingOrKey);
  return null;
}

// --- A-02: storage adapter (in-memory default; replaceable) ------------------

export function createMemoryContextStore() {
  const records = new Map();
  return {
    async get(key) {
      return records.get(key) ?? null;
    },
    async put(key, record) {
      records.set(key, record);
    },
    async delete(key) {
      records.delete(key);
    },
    async list() {
      return [...records.keys()];
    }
  };
}

// --- A-01: record contract ---------------------------------------------------

export function validateContextSyncRecord(record) {
  const errors = [];
  if (!isRecord(record)) {
    return { ok: false, errors: [{ code: 'invalid_record', path: '$', message: 'Context sync record must be an object.' }], record: null };
  }
  for (const key of Object.keys(record)) {
    if (!SYNC_RECORD_KEYS.has(key)) {
      errors.push({ code: 'undeclared_field', path: `$.${key}`, message: `Undeclared sync record field ${key} is not allowed.` });
    }
  }
  if (!validString(record.binding_key, 120)) {
    errors.push({ code: 'invalid_binding_key', path: '$.binding_key', message: 'binding_key is required.' });
  }
  if (!isRecord(record.binding) || !validString(record.binding.package_id, 160) || !validString(record.binding.ir_revision, 240)) {
    errors.push({ code: 'invalid_binding', path: '$.binding', message: 'binding must carry package_id and ir_revision.' });
  }
  if (!isRecord(record.package)) {
    errors.push({ code: 'invalid_package', path: '$.package', message: 'semantic package is required beside runtime metadata.' });
  }
  const sync = record.sync;
  if (!isRecord(sync)) {
    errors.push({ code: 'invalid_sync_metadata', path: '$.sync', message: 'sync metadata is required.' });
  } else {
    for (const key of Object.keys(sync)) {
      if (!SYNC_META_KEYS.has(key)) {
        errors.push({ code: 'undeclared_field', path: `$.sync.${key}`, message: `Undeclared sync metadata field ${key} is not allowed.` });
      }
    }
    if (!SYNC_STATES.includes(sync.state)) {
      errors.push({ code: 'invalid_sync_state', path: '$.sync.state', message: `sync.state must be one of ${SYNC_STATES.join(', ')}.` });
    }
  }
  if (!Number.isInteger(record.seq) || record.seq < 0) {
    errors.push({ code: 'invalid_sequence', path: '$.seq', message: 'seq must be a non-negative integer monotonic guard counter.' });
  }
  return { ok: errors.length === 0, errors, record: errors.length === 0 ? record : null };
}

// --- runtime -----------------------------------------------------------------

export function createContextSyncRuntime(options = {}) {
  const storage = options.storage ?? createMemoryContextStore();
  const validator = options.validator ?? validateAgentContextPackage;
  const refresher = typeof options.refresher === 'function' ? options.refresher : null;
  const now = typeof options.clock === 'function' ? options.clock : () => new Date().toISOString();
  const maxAttempts = Number.isInteger(options.maxAttempts) && options.maxAttempts > 0 ? options.maxAttempts : 3;
  const backoffMs = Number.isInteger(options.backoffMs) && options.backoffMs >= 0 ? options.backoffMs : 0;
  const ttlMs = Number.isInteger(options.ttlMs) && options.ttlMs > 0 ? options.ttlMs : null;

  const inFlight = new Map();
  const subscribers = new Map();
  // Acceptance epoch: a single monotonic counter captured synchronously at
  // refreshContext entry. Every validated delivery (put or refresh accept)
  // bumps the epoch and records it per lineage, so an in-flight refresh can
  // detect — without ordering opaque revision strings and without racing
  // microtask chains — that a newer acceptance already landed (§17 guard).
  let acceptanceEpoch = 0;
  const lineageLastAccepted = new Map();

  function acceptLineage(lineageKey) {
    acceptanceEpoch += 1;
    lineageLastAccepted.set(lineageKey, acceptanceEpoch);
    return acceptanceEpoch;
  }

  function notify(key, state) {
    for (const callback of subscribers.get(key) ?? []) {
      try {
        callback({ binding_key: key, state });
      } catch {
        // subscriber errors never affect sync state
      }
    }
  }

  async function transition(record, state, extra = {}) {
    const allowed = SYNC_TRANSITIONS[record.sync.state] ?? [];
    if (!allowed.includes(state)) {
      throw new Error(`Illegal sync transition ${record.sync.state} -> ${state}.`);
    }
    record.sync = {
      ...record.sync,
      state,
      ...extra
    };
    notify(record.binding_key, state);
    return record;
  }

  async function readRecord(key) {
    const record = await storage.get(key);
    if (record === null || record === undefined) return null;
    const check = validateContextSyncRecord(record);
    if (!check.ok) return null;
    // Defensive corruption detection: a stored package that no longer passes
    // the 0295 validator quarantines the record as INVALID (never repaired).
    const semantic = validator(record.package);
    if (!semantic.ok) {
      await transition(record, 'INVALID', { last_error_class: 'validation' });
      await storage.put(key, record);
      return record;
    }
    return record;
  }

  async function applyTtl(record) {
    if (ttlMs === null || record.sync.state !== 'FRESH' || !record.sync.stored_at) return record;
    const ageMs = Date.now() - Date.parse(record.sync.stored_at);
    if (Number.isFinite(ageMs) && ageMs > ttlMs) {
      await transition(record, 'STALE', { last_checked_at: now() });
      await storage.put(record.binding_key, record);
    }
    return record;
  }

  // --- A-02: validated storage -------------------------------------------------

  async function putContextPackage(agentPackage) {
    const decision = validator(agentPackage);
    if (!decision.ok) {
      return { ok: false, code: 'package_rejected', errors: decision.errors, stored: false };
    }
    const binding = contextBindingOf(agentPackage);
    if (binding === null) {
      return { ok: false, code: 'package_rejected', errors: [{ code: 'invalid_binding', path: '$', message: 'Package does not expose a complete sync binding.' }], stored: false };
    }
    const key = contextBindingKey(binding);
    const existing = await storage.get(key);
    // Direct validated delivery is an acceptance event for the lineage: it
    // supersedes any in-flight refresh that started earlier (§17 guard).
    const seq = acceptLineage(contextLineageKey(binding));
    const record = {
      binding_key: key,
      binding,
      package: clone(agentPackage),
      seq,
      sync: {
        state: 'FRESH',
        stored_at: now(),
        last_checked_at: now(),
        attempts: 0,
        last_error_class: null
      }
    };
    await storage.put(key, record);
    notify(key, 'FRESH');
    return { ok: true, code: 'stored', errors: [], stored: true, binding_key: key, state: 'FRESH' };
  }

  async function getContextPackage(bindingOrKey) {
    const key = resolveKey(bindingOrKey);
    if (key === null) return null;
    const record = await readRecord(key);
    if (record === null) return null;
    // Copy-safe egress: consumers never receive mutable internal records.
    return { package: clone(record.package), sync: clone(record.sync) };
  }

  async function invalidateContextPackage(bindingOrKey, options = {}) {
    const key = resolveKey(bindingOrKey);
    if (key === null) return { ok: false, code: 'invalid_binding' };
    const record = await readRecord(key);
    if (record === null) return { ok: false, code: 'not_found' };
    // Cache invalidation != authority revocation: the entry is marked stale
    // with a reason class; semantic history is never deleted by 0294 itself.
    if (record.sync.state === 'FRESH' || record.sync.state === 'OFFLINE_AVAILABLE') {
      const reasonClass = validString(options.reason_class, 120) ? options.reason_class : 'explicit_invalidation';
      await transition(record, 'STALE', { invalidation_reason: reasonClass, last_checked_at: now() });
      await storage.put(key, record);
    }
    return { ok: true, code: 'invalidated', state: record.sync.state };
  }

  async function listContextPackageStates() {
    const keys = await storage.list();
    const states = [];
    for (const key of keys) {
      const record = await storage.get(key);
      if (!record || !validateContextSyncRecord(record).ok) continue;
      states.push({
        binding_key: record.binding_key,
        state: record.sync.state,
        package_id: record.binding.package_id,
        ir_revision: record.binding.ir_revision,
        policy_revision: record.binding.policy_revision
      });
    }
    return states;
  }

  // --- A-03: coalesced, bounded, order-guarded refresh ---------------------------

  function classifyError(error) {
    const candidate = isRecord(error) && typeof error.error_class === 'string' ? error.error_class : null;
    if (candidate === 'network' || candidate === 'validation' || candidate === 'refresher_error') return candidate;
    if (isRecord(error) && error.network === true) return 'network';
    return 'refresher_error';
  }

  async function refreshContext(bindingOrKey) {
    const key = resolveKey(bindingOrKey);
    if (key === null) return { ok: false, code: 'invalid_binding' };
    // Captured synchronously at call time — before any await can interleave
    // a competing acceptance (direct put or faster refresh).
    const epochAtEntry = acceptanceEpoch;
    if (inFlight.has(key)) return inFlight.get(key);
    const operation = (async () => {
      if (refresher === null) {
        return { ok: false, code: 'no_refresher', state: null };
      }
      const record = await readRecord(key);
      const fromState = record ? record.sync.state : 'EMPTY';
      const requestedBinding = record && isRecord(record.binding)
        ? record.binding
        : (isRecord(bindingOrKey) ? bindingOrKey : { package_id: 'unknown', ir_revision: 'unknown', policy_id: 'unknown', policy_revision: 'unknown' });
      const lineageKey = contextLineageKey(requestedBinding);

      let marked = record;
      if (marked === null) {
        marked = {
          binding_key: key,
          binding: requestedBinding,
          package: null,
          seq: -1,
          sync: { state: 'EMPTY', stored_at: null, last_checked_at: now(), attempts: 0, last_error_class: null }
        };
      } else {
        await transition(marked, 'REFRESHING', { last_refresh_attempt: now() });
        await storage.put(key, marked);
      }

      let outcome = null;
      let attemptsUsed = 0;
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        attemptsUsed = attempt;
        try {
          const incoming = await refresher(marked.binding);
          const decision = validator(incoming);
          if (!decision.ok) {
            outcome = { error_class: 'validation', errors: decision.errors };
          } else {
            const incomingBinding = contextBindingOf(incoming);
            if (incomingBinding === null || contextLineageKey(incomingBinding) !== lineageKey) {
              // Requested lineage vs received lineage mismatch: reject.
              outcome = { error_class: 'binding_mismatch', errors: [{ code: 'binding_mismatch' }] };
            } else {
              outcome = { package: incoming, binding: incomingBinding };
              break;
            }
          }
        } catch (error) {
          outcome = { error_class: classifyError(error), errors: [] };
        }
        marked.sync.attempts = attempt;
        marked.sync.last_error_class = outcome.error_class;
        if (attempt < maxAttempts && backoffMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, backoffMs * attempt));
        }
      }
      marked.sync.attempts = attemptsUsed;

      // Out-of-order guard (§17): a response whose refresh started before the
      // last accepted delivery for this lineage may never land — a newer
      // acceptance (direct delivery or faster refresh) wins. Never "last
      // response wins".
      if ((lineageLastAccepted.get(lineageKey) ?? 0) > epochAtEntry && outcome && outcome.package) {
        return { ok: false, code: 'superseded', state: fromState };
      }

      if (outcome && outcome.package) {
        const incomingKey = contextBindingKey(outcome.binding);
        const acceptedSeq = acceptLineage(lineageKey);
        // A newer revision is a NEW cache identity; the requested entry is
        // marked superseded rather than overwritten in place.
        if (incomingKey !== key && record) {
          const superseded = await readRecord(key);
          if (superseded && superseded.sync.state !== 'STALE') {
            await transition(superseded, 'STALE', { invalidation_reason: 'superseded_by_newer_revision', last_checked_at: now() });
            await storage.put(key, superseded);
          }
        }
        const target = incomingKey === key ? marked : {
          binding_key: incomingKey,
          binding: outcome.binding,
          package: null,
          seq: acceptedSeq,
          sync: { state: 'EMPTY', stored_at: null, last_checked_at: now(), attempts: 0, last_error_class: null }
        };
        target.package = clone(outcome.package);
        target.seq = acceptedSeq;
        target.sync = {
          state: 'FRESH',
          stored_at: now(),
          last_checked_at: now(),
          last_refresh_attempt: now(),
          attempts: marked.sync.attempts,
          last_error_class: null
        };
        await storage.put(incomingKey, target);
        notify(incomingKey, 'FRESH');
        return { ok: true, code: 'refreshed', state: 'FRESH', binding_key: incomingKey };
      }

      const errorClass = outcome ? outcome.error_class : 'refresher_error';
      if (marked.package) {
        // Network/validation failure with a previously validated package:
        // offline availability, never FRESH (§19).
        await transition(marked, 'OFFLINE_AVAILABLE', { last_error_class: errorClass, last_checked_at: now() });
        await storage.put(key, marked);
        return { ok: false, code: 'refresh_failed', error_class: errorClass, state: marked.sync.state };
      }
      await transition(marked, 'UNAVAILABLE', { last_error_class: errorClass, last_checked_at: now() });
      await storage.put(key, marked);
      return { ok: false, code: 'refresh_failed', error_class: errorClass, state: 'UNAVAILABLE' };
    })().finally(() => {
      inFlight.delete(key);
    });
    inFlight.set(key, operation);
    return operation;
  }

  // --- A-04: delivery -----------------------------------------------------------

  async function getCurrentContext(bindingOrKey) {
    const key = resolveKey(bindingOrKey);
    if (key === null) return { sync_state: 'UNAVAILABLE', package: null };
    let record = await readRecord(key);
    if (record === null) return { sync_state: 'EMPTY', package: null };
    record = await applyTtl(record);
    const state = record.sync.state;
    if (state === 'FRESH' || state === 'STALE' || state === 'OFFLINE_AVAILABLE') {
      // Last-valid delivery where policy permits — but always state-labeled,
      // never silently presented as FRESH.
      return { sync_state: state, package: clone(record.package) };
    }
    return { sync_state: state, package: null };
  }

  function subscribeContextState(bindingOrKey, callback) {
    const key = resolveKey(bindingOrKey);
    if (key === null || typeof callback !== 'function') return () => {};
    if (!subscribers.has(key)) subscribers.set(key, new Set());
    subscribers.get(key).add(callback);
    return () => {
      subscribers.get(key)?.delete(callback);
    };
  }

  return {
    putContextPackage,
    getContextPackage,
    invalidateContextPackage,
    listContextPackageStates,
    refreshContext,
    getCurrentContext,
    subscribeContextState
  };
}
