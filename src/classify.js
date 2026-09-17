import { SEMANTIC_CLASSES } from './constants.js';

const STATEMENTS = Object.freeze({
  WHO: 'Repository evidence suggests an agent or harness definition.',
  KNOW: 'Repository evidence suggests context, memory, retrieval, or resource access.',
  THINK: 'Repository evidence suggests model-backed cognition or planning.',
  CAN: 'Repository evidence suggests a tool, connector, adapter, or callable surface.',
  MAY: 'Repository evidence suggests policy or authorization controls.',
  ACT: 'Repository evidence suggests an execution or effect path.',
  DID: 'Repository evidence suggests evidence, audit, verification, or reconciliation.'
});

export function classifyDiscoveries(discovery) {
  const classifications = discovery.observations.map((observation, index) => ({
    claimId: `claim-${String(index + 1).padStart(4, '0')}`,
    semanticClass: observation.candidateClass,
    label: observation.label,
    statement: STATEMENTS[observation.candidateClass],
    evidenceState: observation.evidenceState,
    confidence: observation.confidence,
    evidence: [{
      path: observation.path,
      line: observation.line,
      snippet: observation.snippet,
      detector: observation.detectorId
    }]
  }));

  const present = new Set(classifications.map((item) => item.semanticClass));
  const unknownSemanticClasses = SEMANTIC_CLASSES.filter((semanticClass) => !present.has(semanticClass));

  return {
    classifications,
    unknownSemanticClasses
  };
}
