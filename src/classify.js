import { SEMANTIC_CLASSES } from './constants.js';

const STATEMENTS = Object.freeze({
  WHO: 'Repository signals suggest an agent, role, or harness definition.',
  KNOW: 'Repository signals suggest context, memory, retrieval, or resource access.',
  THINK: 'Repository signals suggest model-backed cognition or planning.',
  CAN: 'Repository signals suggest a tool, connector, adapter, or callable surface.',
  MAY: 'Implementation or configuration evidence suggests an authority control.',
  ACT: 'Implementation evidence suggests an execution or effect path.',
  DID: 'Implementation, test, or configuration evidence suggests an evidence or verification path.'
});

const REQUIRED_SOURCE_KINDS = Object.freeze({
  MAY: new Set(['implementation', 'config']),
  ACT: new Set(['implementation']),
  DID: new Set(['implementation', 'test', 'config'])
});

function sourceIsStrongEnough(observation) {
  const required = REQUIRED_SOURCE_KINDS[observation.candidateClass];
  return !required || required.has(observation.sourceKind);
}

export function classifyDiscoveries(discovery) {
  const rejectedWeakEvidence = [];
  const classifications = [];

  for (const observation of discovery.observations) {
    if (!sourceIsStrongEnough(observation)) {
      rejectedWeakEvidence.push({
        semanticClass: observation.candidateClass,
        path: observation.path,
        line: observation.line,
        sourceKind: observation.sourceKind,
        detector: observation.detectorId
      });
      continue;
    }

    classifications.push({
      claimId: `claim-${String(classifications.length + 1).padStart(4, '0')}`,
      semanticClass: observation.candidateClass,
      label: observation.label,
      statement: STATEMENTS[observation.candidateClass],
      evidenceState: observation.evidenceState,
      confidence: observation.confidence,
      evidence: [{
        path: observation.path,
        line: observation.line,
        snippet: observation.snippet,
        detector: observation.detectorId,
        sourceKind: observation.sourceKind
      }]
    });
  }

  const present = new Set(classifications.map((item) => item.semanticClass));
  const unknownSemanticClasses = SEMANTIC_CLASSES.filter((semanticClass) => !present.has(semanticClass));

  return {
    classifications,
    unknownSemanticClasses,
    rejectedWeakEvidence
  };
}
