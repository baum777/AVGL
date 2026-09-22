import test from 'node:test';
import assert from 'node:assert/strict';
import { projectFileSemanticContext } from '../web/file-semantic-projection.js';

test('file semantic projection derives classes only from canonical IR evidence', () => {
  const ir = {
    nodes: [
      {
        id: 'may-policy',
        semanticClass: 'MAY',
        evidenceState: 'INFERRED',
        confidence: 0.82,
        evidence: [
          { path: 'src/authority/approval-gate.js', line: 12, sourceKind: 'implementation', detector: 'may.authority-control' }
        ]
      },
      {
        id: 'did-verification',
        semanticClass: 'DID',
        evidenceState: 'INFERRED',
        confidence: 0.82,
        evidence: [
          { path: 'src/verification/refund-verifier.js', line: 8, sourceKind: 'implementation', detector: 'did.evidence-verification' }
        ]
      }
    ],
    relations: [],
    effects: []
  };

  const projected = projectFileSemanticContext(ir, 'src/authority/approval-gate.js');
  assert.deepEqual(projected.semanticClasses, ['MAY']);
  assert.equal(projected.status, 'EVIDENCED');
  assert.equal(projected.semanticSource, 'canonical-ir');
});

test('file semantic projection does not infer classes from a filename or source text outside the IR', () => {
  const ir = { nodes: [], relations: [], effects: [] };
  const projected = projectFileSemanticContext(ir, 'src/verification/refund-verifier.js');

  assert.deepEqual(projected.semanticClasses, []);
  assert.equal(projected.status, 'UNKNOWN');
});

test('file semantic projection preserves provenance from node and effect evidence', () => {
  const ir = {
    nodes: [
      {
        id: 'can-tool',
        semanticClass: 'CAN',
        evidenceState: 'INFERRED',
        confidence: 0.76,
        evidence: [
          { path: 'src/runtime/refund-executor.js', line: 4, sourceKind: 'implementation', detector: 'can.tool-surface' }
        ]
      }
    ],
    relations: [],
    effects: [
      {
        id: 'effect-1',
        path: 'src/runtime/refund-executor.js',
        semanticClass: 'ACT',
        effectKind: 'NETWORK_REQUEST',
        external: true,
        evidence: { path: 'src/runtime/refund-executor.js', line: 9, sourceKind: 'implementation' }
      }
    ]
  };

  const projected = projectFileSemanticContext(ir, 'src/runtime/refund-executor.js');
  assert.deepEqual(projected.semanticClasses, ['CAN', 'ACT']);
  assert.ok(projected.evidence.some((item) => item.semanticClass === 'CAN' && item.source === 'node' && item.line === 4));
  assert.ok(projected.evidence.some((item) => item.semanticClass === 'ACT' && item.source === 'effect' && item.line === 9));
});
