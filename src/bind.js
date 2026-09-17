import { SEMANTIC_CLASSES } from './constants.js';

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function stateRank(state) {
  return { UNKNOWN: 0, INFERRED: 1, EXPLICIT: 2, OBSERVED: 3 }[state] ?? 0;
}

export function bindAvglIr(discovery, classificationResult) {
  const grouped = new Map();

  for (const claim of classificationResult.classifications) {
    const key = `${claim.semanticClass}:${claim.label}`;
    const existing = grouped.get(key);
    if (!existing) {
      grouped.set(key, {
        id: `${claim.semanticClass.toLowerCase()}-${slug(claim.label)}`,
        semanticClass: claim.semanticClass,
        label: claim.label,
        statement: claim.statement,
        evidenceState: claim.evidenceState,
        confidence: claim.confidence,
        evidence: [...claim.evidence]
      });
      continue;
    }

    existing.confidence = Math.max(existing.confidence, claim.confidence);
    if (stateRank(claim.evidenceState) > stateRank(existing.evidenceState)) {
      existing.evidenceState = claim.evidenceState;
    }
    for (const evidence of claim.evidence) {
      if (existing.evidence.length < 12) existing.evidence.push(evidence);
    }
  }

  const nodes = [...grouped.values()].sort((a, b) => {
    const classOrder = SEMANTIC_CLASSES.indexOf(a.semanticClass) - SEMANTIC_CLASSES.indexOf(b.semanticClass);
    return classOrder || a.label.localeCompare(b.label);
  });

  return {
    avglVersion: '0.1',
    generatedAt: discovery.generatedAt,
    source: discovery.source,
    analysis: {
      pipeline: ['DISCOVER', 'CLASSIFY', 'BIND', 'PROJECT'],
      mode: 'deterministic-static-baseline',
      filesSeen: discovery.filesSeen,
      filesScanned: discovery.filesScanned,
      skippedSensitive: discovery.skippedSensitive,
      skippedOversize: discovery.skippedOversize
    },
    nodes,
    relations: [],
    unknowns: classificationResult.unknownSemanticClasses,
    invariants: [
      'HARNESS != AUTHORITY',
      'CONTEXT != PERMISSION',
      'CAN != MAY',
      'PROPOSAL != EXECUTION',
      'ACT != DID',
      'RECEIPT != VERIFICATION'
    ]
  };
}
