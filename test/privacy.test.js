import test from 'node:test';
import assert from 'node:assert/strict';
import { assertTransportSafeIr, sanitizeIrForTransport } from '../src/privacy.js';

test('LOCAL_PRIVATE transport IR strips source-bearing fields', () => {
  const input = {
    source:{ kind:'repository', label:'private' },
    nodes:[{ evidence:[{ path:'src/a.js', line:1, snippet:'secret source' }] }],
    relations:[{ evidence:[{ path:'src/a.js', line:1, snippet:'secret relation' }] }],
    effects:[{ evidence:{ path:'src/a.js', line:2, snippet:'secret effect' } }],
    effectChains:[{ evidence:[[{ path:'src/a.js', line:2, snippet:'secret chain' }]] }]
  };
  const safe = sanitizeIrForTransport(input);
  assert.equal(safe.privacy.mode, 'LOCAL_PRIVATE');
  assert.equal(safe.privacy.rawSourceTransported, false);
  assert.equal(safe.nodes[0].evidence[0].snippet, undefined);
  assert.equal(safe.relations[0].evidence[0].snippet, undefined);
  assert.doesNotThrow(() => assertTransportSafeIr(safe));
  assert.doesNotMatch(JSON.stringify(safe), /secret source|secret relation|secret effect|secret chain/);
});

test('LOCAL_PRIVATE can also omit file paths', () => {
  const safe = sanitizeIrForTransport({
    nodes:[{ evidence:[{ path:'src/a.js', line:1, snippet:'x' }] }],
    relations:[], effects:[], effectChains:[]
  }, { allowPaths:false });
  assert.equal(safe.nodes[0].evidence[0].path, undefined);
  assert.equal(safe.privacy.filePathsTransported, false);
});
