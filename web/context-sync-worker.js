// AVGL-0294 — Service Worker context synchronization adapter (web root).
//
// This file is a thin, self-contained adapter: the web deployment serves
// this directory statically without a bundler, so it cannot import the
// canonical contract modules under src/. The wire contract (message types,
// payload shapes, fail-closed handling, same-origin trust) mirrors
// src/context-sync-messages.js; that module plus its tests are the
// authoritative contract definition. This adapter:
//   - caches validated agent context package JSON per binding digest in the
//     Cache API (storage beside semantics, sync state in metadata headers);
//   - handles CONTEXT_GET / CONTEXT_REFRESH / CONTEXT_INVALIDATE commands and
//     posts CONTEXT_STATE / CONTEXT_UPDATED notifications;
//   - performs no scanning, parsing, classification, or semantic decision.
// It is not registered by any page yet (runtime integration is upstream/UI
// scope); deployment behavior is unchanged by adding this file.

const CACHE_NAME = 'avgl-context-sync-v1';
const MESSAGE_TYPES = ['CONTEXT_GET', 'CONTEXT_REFRESH', 'CONTEXT_INVALIDATE'];
const SYNC_STATES = ['EMPTY', 'FRESH', 'STALE', 'REFRESHING', 'OFFLINE_AVAILABLE', 'UNAVAILABLE', 'INVALID'];

self.addEventListener('install', (event) => {
  event.waitUntil(Promise.resolve());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function boundedString(value, max) {
  return typeof value === 'string' && value.length > 0 && value.length <= max;
}

// Mirror of the canonical binding validation (src/context-sync-messages.js).
function validBinding(value) {
  if (!isObject(value)) return false;
  const keys = Object.keys(value);
  const allowed = ['package_id', 'ir_revision', 'policy_id', 'policy_revision', 'governance_reference', 'consumer'];
  if (keys.some((key) => !allowed.includes(key))) return false;
  return boundedString(value.package_id, 160) && boundedString(value.ir_revision, 240)
    && boundedString(value.policy_id, 160) && boundedString(value.policy_revision, 160)
    && (value.governance_reference === undefined || boundedString(value.governance_reference, 280))
    && (value.consumer === undefined || boundedString(value.consumer, 160));
}

function validMessage(message) {
  if (!isObject(message)) return false;
  if (!MESSAGE_TYPES.includes(message.type)) return false;
  if (!validBinding(message.binding)) return false;
  const allowed = message.type === 'CONTEXT_INVALIDATE' ? ['type', 'binding', 'reason_class'] : ['type', 'binding'];
  if (Object.keys(message).some((key) => !allowed.includes(key))) return false;
  if (message.type === 'CONTEXT_INVALIDATE' && message.reason_class !== undefined && !boundedString(message.reason_class, 120)) return false;
  return true;
}

async function bindingCacheKey(binding) {
  const canonical = JSON.stringify(binding, Object.keys(binding).sort());
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical));
  const hex = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('').slice(0, 40);
  return new Request(`/context-sync/ctxsync-${hex}`);
}

async function readSyncMetadata(cache, cacheKey) {
  const response = await cache.match(cacheKey);
  if (!response) return { state: 'EMPTY' };
  const state = response.headers.get('x-avgl-sync-state');
  return { state: SYNC_STATES.includes(state) ? state : 'INVALID' };
}

async function writeSyncMetadata(cache, cacheKey, body, state) {
  await cache.put(cacheKey, new Response(body, {
    headers: {
      'content-type': 'application/json',
      'x-avgl-sync-state': state
    }
  }));
}

self.addEventListener('message', (event) => {
  const source = event.source;
  if (!source) return;
  // Same-origin trust boundary: cross-origin clients are rejected fail-closed.
  if (event.origin !== self.location.origin) {
    source.postMessage({ type: 'CONTEXT_STATE', binding_key: null, state: 'UNAVAILABLE', error: 'untrusted_origin' });
    return;
  }
  const message = event.data;
  if (!validMessage(message)) {
    // Fail closed on unknown types and malformed payloads (no echo of payload).
    source.postMessage({ type: 'CONTEXT_STATE', binding_key: null, state: 'UNAVAILABLE', error: 'invalid_message' });
    return;
  }
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cacheKey = await bindingCacheKey(message.binding);

    if (message.type === 'CONTEXT_GET') {
      const response = await cache.match(cacheKey);
      const metadata = await readSyncMetadata(cache, cacheKey);
      if (!response) {
        source.postMessage({ type: 'CONTEXT_STATE', binding_key: cacheKey.url, state: 'EMPTY' });
        return;
      }
      // Copy-safe delivery: the cached body is re-materialized as a new
      // response payload; consumers never receive mutable cache handles.
      const body = await response.text();
      source.postMessage({ type: 'CONTEXT_UPDATED', binding_key: cacheKey.url, package_id: message.binding.package_id, state: metadata.state, package: JSON.parse(body) });
      return;
    }

    if (message.type === 'CONTEXT_INVALIDATE') {
      const response = await cache.match(cacheKey);
      if (!response) {
        source.postMessage({ type: 'CONTEXT_STATE', binding_key: cacheKey.url, state: 'EMPTY' });
        return;
      }
      // Cache invalidation only marks staleness; entries are never deleted
      // here and no authority is revoked by this adapter.
      const body = await response.text();
      const metadata = await readSyncMetadata(cache, cacheKey);
      if (metadata.state === 'FRESH' || metadata.state === 'OFFLINE_AVAILABLE') {
        await writeSyncMetadata(cache, cacheKey, body, 'STALE');
        source.postMessage({ type: 'CONTEXT_STATE', binding_key: cacheKey.url, state: 'STALE' });
      } else {
        source.postMessage({ type: 'CONTEXT_STATE', binding_key: cacheKey.url, state: metadata.state });
      }
      return;
    }

    // CONTEXT_REFRESH: the worker never scans or analyzes. Refresh means
    // re-fetching the governed package from its upstream URL if one is
    // configured; without upstream wiring this reports UNAVAILABLE rather
    // than inventing content.
    source.postMessage({ type: 'CONTEXT_STATE', binding_key: cacheKey.url, state: 'UNAVAILABLE', error: 'no_upstream_refresh_wired' });
  })());
});
