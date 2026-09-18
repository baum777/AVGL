import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRelationModel, extractRelationFacts, resolveRelations, traceEffectChains } from '../src/relations.js';

test('plain array push is classified as local mutation and never as external ACT', () => {
  const file = {
    path:'examples/snake/snake.logic.mjs',
    sourceKind:'implementation',
    content:'openCells.push({ x, y });\nissues.push("problem");\nresult.push(name);\n'
  };
  const bundle = extractRelationFacts(file);
  const local = bundle.effects.filter((effect) => effect.effectKind === 'LOCAL_MUTATION');
  assert.equal(local.length, 3);
  assert.equal(local.every((effect) => effect.external === false), true);
  assert.equal(bundle.effects.some((effect) => effect.semanticClass === 'ACT'), false);
});

test('explicit external calls produce ACT candidates', () => {
  const file = {
    path:'runtime/executor.mjs',
    sourceKind:'implementation',
    content:'await gitClient.push();\nawait fetch("https://example.test", { method: "POST" });\n'
  };
  const bundle = extractRelationFacts(file);
  assert.ok(bundle.effects.some((effect) => effect.effectKind === 'GIT_MUTATION' && effect.external));
  assert.ok(bundle.effects.some((effect) => effect.effectKind === 'NETWORK_REQUEST' && effect.external));
  const resolved = resolveRelations([bundle], [file.path]);
  const chains = traceEffectChains(resolved);
  assert.equal(chains.length, 2);
  assert.equal(chains.every((chain) => chain.steps.at(-1).type === 'ACT_CANDIDATE'), true);
  assert.equal(chains.every((chain) => chain.steps.at(-1).basis === 'DERIVED'), true);
});

test('relative imports resolve into explicit file relations and reverse lineage is derived', () => {
  const files = [
    {
      path:'src/a.mjs',
      sourceKind:'implementation',
      content:'import { run } from "./b.mjs";\nexport function start(){ return run(); }\n'
    },
    {
      path:'src/b.mjs',
      sourceKind:'implementation',
      content:'export function run(){ return 1; }\n'
    }
  ];
  const model = buildRelationModel(files);
  const forward = model.relations.find((relation) => relation.type === 'IMPORTS');
  const reverse = model.relations.find((relation) => relation.type === 'IMPORTED_BY');
  assert.equal(forward?.from.id, 'src/a.mjs');
  assert.equal(forward?.to.id, 'src/b.mjs');
  assert.equal(forward?.basis, 'EXPLICIT');
  assert.equal(reverse?.from.id, 'src/b.mjs');
  assert.equal(reverse?.to.id, 'src/a.mjs');
  assert.equal(reverse?.basis, 'DERIVED');
});

test('class inheritance is explicit and typed as code inheritance', () => {
  const bundle = extractRelationFacts({
    path:'src/child.mjs',
    sourceKind:'implementation',
    content:'export class Child extends Parent {}\n'
  });
  const resolved = resolveRelations([bundle], ['src/child.mjs']);
  const edge = resolved.relations.find((relation) => relation.type === 'EXTENDS');
  assert.equal(edge?.basis, 'EXPLICIT');
  assert.equal(edge?.inheritanceKind, 'CODE_INHERITANCE');
  assert.equal(edge?.to.id, 'Parent');
});
