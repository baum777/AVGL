function redactEvidence(evidence) {
  if (!evidence || typeof evidence !== 'object') return evidence;
  const { snippet, content, excerpt, ...safe } = evidence;
  return safe;
}

function redactRelation(relation) {
  return {
    ...relation,
    evidence: Array.isArray(relation.evidence) ? relation.evidence.map(redactEvidence) : []
  };
}

function redactEffect(effect) {
  return {
    ...effect,
    evidence: redactEvidence(effect.evidence)
  };
}

function redactEffectChain(chain) {
  return {
    ...chain,
    evidence: Array.isArray(chain.evidence)
      ? chain.evidence.map((item) => Array.isArray(item) ? item.map(redactEvidence) : redactEvidence(item))
      : []
  };
}

export function sanitizeIrForTransport(ir, options = {}) {
  const allowPaths = options.allowPaths !== false;
  const clone = structuredClone(ir);

  clone.nodes = (clone.nodes ?? []).map((node) => ({
    ...node,
    evidence: (node.evidence ?? []).map((item) => {
      const safe = redactEvidence(item);
      if (!allowPaths) delete safe.path;
      return safe;
    })
  }));
  clone.relations = (clone.relations ?? []).map(redactRelation);
  clone.effects = (clone.effects ?? []).map(redactEffect);
  clone.effectChains = (clone.effectChains ?? []).map(redactEffectChain);

  clone.privacy = {
    mode: 'LOCAL_PRIVATE',
    rawSourceTransported: false,
    sourceSnippetsTransported: false,
    filePathsTransported: allowPaths,
    generatedAt: new Date().toISOString()
  };
  clone.sourceAccess = {
    mode: 'local',
    rawSourceLeavesEnvironment: false
  };
  return clone;
}

export function assertTransportSafeIr(ir) {
  const serialized = JSON.stringify(ir);
  for (const forbidden of ['"snippet":', '"content":', '"excerpt":']) {
    if (serialized.includes(forbidden)) {
      throw new Error('Transport IR contains forbidden source-bearing field ' + forbidden);
    }
  }
  if (ir?.privacy?.mode !== 'LOCAL_PRIVATE' || ir?.privacy?.rawSourceTransported !== false) {
    throw new Error('Transport IR is missing LOCAL_PRIVATE privacy attestation.');
  }
  return true;
}
