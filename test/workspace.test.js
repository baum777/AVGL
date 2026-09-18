import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkspaceIr, workspaceSummary } from '../src/workspace.js';

function ir(label, relations=[], effects=[]) {
  return {
    avglVersion:'0.1',
    source:{ kind:'repository', label },
    analysis:{ scanComplete:true },
    relations,
    effects
  };
}

test('workspace preserves immutable revisions and derives module dependency', () => {
  const provider = {
    id:'registry',
    revision:'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    provides:['@unitera/registry'],
    ir:ir('unitera/registry', [], [{
      id:'effect-1', external:true, effectKind:'NETWORK_REQUEST', callee:'fetch', confidence:0.9
    }])
  };
  const consumer = {
    id:'control',
    revision:'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    ir:ir('unitera/control', [{
      id:'rel-import',
      type:'IMPORTS_MODULE',
      to:{ kind:'module', id:'@unitera/registry/client' },
      evidence:[{ path:'src/control.ts', line:4 }]
    }])
  };

  const workspace = createWorkspaceIr([provider, consumer], { label:'unitera' });
  assert.equal(workspace.repositories.find((r)=>r.id==='registry').revision, provider.revision);
  assert.ok(workspace.relations.some((r)=>r.type==='CROSS_REPO_DEPENDS_ON' && r.from.id==='control' && r.to.id==='registry' && r.basis==='DERIVED'));
  assert.ok(workspace.relations.some((r)=>r.type==='CONSUMES' && r.from.id==='control'));
  assert.ok(workspace.effectChains.some((chain)=>chain.source.id==='control' && chain.via.id==='registry' && chain.basis==='DERIVED'));
});

test('explicit workspace relations stay explicit and dependency is not execution', () => {
  const workspace = createWorkspaceIr([
    { id:'a', revision:'a'.repeat(40), dependsOn:['b'], ir:ir('a') },
    { id:'b', revision:'b'.repeat(40), ir:ir('b') }
  ], {
    relations:[{ type:'GOVERNS', from:'a', to:'b', evidence:{ source:'manifest' } }]
  });
  assert.ok(workspace.relations.some((r)=>r.type==='GOVERNS' && r.basis==='EXPLICIT'));
  assert.ok(workspace.invariants.includes('CROSS_REPO_REACHABILITY != EXECUTION'));
  assert.deepEqual(workspaceSummary(workspace), {
    repositories:2,
    explicitRelations:2,
    derivedRelations:0,
    derivedEffectChains:0
  });
});
