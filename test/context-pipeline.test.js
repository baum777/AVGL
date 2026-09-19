import test from 'node:test';
import assert from 'node:assert/strict';
import { materializeContextCard } from '../src/context-worker/context-pipeline.js';

test('context pipeline preserves unknown authority boundaries', () => {
  const card = materializeContextCard({
    path: 'docs/ARCHITECTURE.md',
    content: 'Architecture reference documentation',
    references: ['src/runtime.js']
  });

  assert.equal(card.authority.evidenceState, 'UNKNOWN');
  assert.equal(card.relations.length, 1);
  assert.ok(card.artifact.path.includes('ARCHITECTURE'));
});
