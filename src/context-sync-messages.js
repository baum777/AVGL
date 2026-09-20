// AVGL-0294 — typed context sync message contract.
// Messages are commands/notifications between consumers and the context
// synchronization runtime (Service Worker adapter or in-process runtime).
// They carry bindings and sync states only — never semantic authority.

export const CONTEXT_MESSAGE_TYPES = Object.freeze([
  'CONTEXT_GET',
  'CONTEXT_REFRESH',
  'CONTEXT_INVALIDATE',
  'CONTEXT_STATE',
  'CONTEXT_UPDATED'
]);

const MESSAGE_KEYS = Object.freeze({
  CONTEXT_GET: new Set(['type', 'binding']),
  CONTEXT_REFRESH: new Set(['type', 'binding']),
  CONTEXT_INVALIDATE: new Set(['type', 'binding', 'reason_class']),
  CONTEXT_STATE: new Set(['type', 'binding_key', 'state']),
  CONTEXT_UPDATED: new Set(['type', 'binding_key', 'package_id', 'state'])
});

const SYNC_STATES = new Set(['EMPTY', 'FRESH', 'STALE', 'REFRESHING', 'OFFLINE_AVAILABLE', 'UNAVAILABLE', 'INVALID']);
const BINDING_KEYS = new Set(['package_id', 'ir_revision', 'policy_id', 'policy_revision', 'governance_reference', 'consumer']);

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function validString(value, maxLength = 280) {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength;
}

function validBinding(value) {
  if (!isRecord(value)) return false;
  for (const key of Object.keys(value)) {
    if (!BINDING_KEYS.has(key)) return false;
  }
  return validString(value.package_id, 160) && validString(value.ir_revision, 240)
    && validString(value.policy_id, 160) && validString(value.policy_revision, 160)
    && (value.governance_reference === undefined || validString(value.governance_reference))
    && (value.consumer === undefined || validString(value.consumer, 160));
}

export function createContextSyncMessage(type, payload = {}) {
  const message = { type, ...payload };
  const decision = validateContextSyncMessage(message);
  return decision;
}

export function validateContextSyncMessage(message) {
  const errors = [];
  if (!isRecord(message)) {
    return { ok: false, errors: [{ code: 'invalid_message', path: '$', message: 'Context sync message must be an object.' }], message: null };
  }
  if (!CONTEXT_MESSAGE_TYPES.includes(message.type)) {
    // Fail closed: unknown message types never pass.
    return { ok: false, errors: [{ code: 'unknown_message_type', path: '$.type', message: `Unknown context sync message type ${JSON.stringify(message.type)}.` }], message: null };
  }
  const allowed = MESSAGE_KEYS[message.type];
  for (const key of Object.keys(message)) {
    if (!allowed.has(key)) {
      errors.push({ code: 'undeclared_field', path: `$.${key}`, message: `Undeclared field ${key} is not allowed on ${message.type}.` });
    }
  }
  if (message.type === 'CONTEXT_GET' || message.type === 'CONTEXT_REFRESH' || message.type === 'CONTEXT_INVALIDATE') {
    if (!validBinding(message.binding)) {
      errors.push({ code: 'invalid_binding', path: '$.binding', message: `${message.type} requires a complete package binding (package_id, ir_revision, policy_id, policy_revision).` });
    }
    if (message.type === 'CONTEXT_INVALIDATE' && message.reason_class !== undefined && !validString(message.reason_class, 120)) {
      errors.push({ code: 'invalid_reason_class', path: '$.reason_class', message: 'reason_class must be a bounded string.' });
    }
  } else {
    if (!validString(message.binding_key, 120)) {
      errors.push({ code: 'invalid_binding_key', path: '$.binding_key', message: `${message.type} requires a binding_key.` });
    }
    if (!SYNC_STATES.has(message.state)) {
      errors.push({ code: 'invalid_sync_state', path: '$.state', message: `${message.type} carries an invalid sync state.` });
    }
    if (message.type === 'CONTEXT_UPDATED' && !validString(message.package_id, 160)) {
      errors.push({ code: 'invalid_package_id', path: '$.package_id', message: 'CONTEXT_UPDATED requires package_id.' });
    }
  }
  return { ok: errors.length === 0, errors, message: errors.length === 0 ? message : null };
}

// Origin/client boundary (§23): in a Service Worker, only same-origin (or
// explicitly allow-listed) clients may command or observe context sync.
export function assertTrustedContextMessageSource(event, options = {}) {
  const allowedOrigins = Array.isArray(options.allowedOrigins) ? options.allowedOrigins : null;
  const origin = typeof event?.origin === 'string' ? event.origin : null;
  if (origin === null) return { ok: false, code: 'missing_origin' };
  if (allowedOrigins === null) {
    // Default posture: same-origin only. The worker location origin is
    // provided by the caller (self.location.origin in a worker context).
    const selfOrigin = typeof options.selfOrigin === 'string' ? options.selfOrigin : null;
    if (selfOrigin === null || origin !== selfOrigin) return { ok: false, code: 'untrusted_origin' };
    return { ok: true };
  }
  if (!allowedOrigins.includes(origin)) return { ok: false, code: 'untrusted_origin' };
  return { ok: true };
}
