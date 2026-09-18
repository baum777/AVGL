import { SEMANTIC_CLASSES } from './constants.js';

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function stateRank(state) {
  return { UNKNOWN: 0, INFERRED: 1, EXPLICIT: 2, OBSERVED: 3 }[state] ?? 0;
}

export function bindAvglIr(discovery, classificationResult) {
  const grouped = new Map();
  const evidenceLimit = discovery.scanStrategy === 'full' ? 256 : 48;

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
        evidenceCount: claim.evidence.length,
        evidence: claim.evidence.slice(0, evidenceLimit)
      });
      continue;
    }

    existing.confidence = Math.max(existing.confidence, claim.confidence);
    existing.evidenceCount += claim.evidence.length;
    if (stateRank(claim.evidenceState) > stateRank(existing.evidenceState)) {
      existing.evidenceState = claim.evidenceState;
    }
    for (const evidence of claim.evidence) {
      if (existing.evidence.length < evidenceLimit) existing.evidence.push(evidence);
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
      mode: discovery.analysisMode ?? 'deterministic-static-baseline',
      scanStrategy: discovery.scanStrategy ?? 'bounded',
      filesSeen: discovery.filesSeen,
      filesEligible: discovery.filesEligible,
      filesSelected: discovery.filesSelected ?? discovery.filesScanned,
      filesScanned: discovery.filesScanned,
      bytesScanned: discovery.bytesScanned ?? 0,
      scanComplete: discovery.scanComplete,
      treeComplete: discovery.treeComplete ?? true,
      treeFallbackUsed: discovery.treeFallbackUsed ?? false,
      unsupportedFileCount: discovery.unsupportedFileCount ?? 0,
      contentFetchFailures: discovery.contentFetchFailures ?? [],
      sourceCoverage: discovery.sourceCoverage,
      skippedSensitive: discovery.skippedSensitive,
      skippedOversize: discovery.skippedOversize,
      rejectedWeakEvidence: classificationResult.rejectedWeakEvidence.length,
      relationCount: discovery.relations?.length ?? 0,
      effectCount: discovery.effects?.length ?? 0,
      effectChainCount: discovery.effectChains?.length ?? 0
    },
    nodes,
    relations: discovery.relations ?? [],
    effects: discovery.effects ?? [],
    effectChains: discovery.effectChains ?? [],
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
