export const CONTEXT_OBJECT_VERSION = '1.0';

export const EvidenceConfidence = Object.freeze({
  EXPLICIT: 'EXPLICIT',
  INFERRED: 'INFERRED',
  OBSERVED: 'OBSERVED',
  UNKNOWN: 'UNKNOWN'
});

export function createContextObject({
  id,
  identity = {},
  position = [],
  relations = [],
  effect = null,
  evidence = []
}) {
  return {
    id,
    identity,
    position,
    relations,
    effect,
    evidence,
    version: CONTEXT_OBJECT_VERSION
  };
}

export function bindEvidence(contextObject, evidenceBinding) {
  return {
    ...contextObject,
    evidence: [...contextObject.evidence, evidenceBinding]
  };
}

export function addRelation(contextObject, relation) {
  return {
    ...contextObject,
    relations: [...contextObject.relations, relation]
  };
}
