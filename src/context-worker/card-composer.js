/**
 * AVGL Context Card Composer v0.1
 *
 * Converts evidence-bound semantic artifacts into a human-readable
 * context projection. This layer does not create semantic truth;
 * it only projects existing IR evidence.
 */

export function composeContextCard(input = {}) {
  const artifact = input.artifact || input;
  const relations = input.relations?.relations || artifact.relations || [];
  const authority = input.authority || artifact.authority || { state: 'UNKNOWN' };

  return {
    id: artifact.id,
    artifact: {
      path: artifact.artifact?.path ?? artifact.path,
      type: artifact.type ?? artifact.artifact?.type ?? 'unknown',
      role: artifact.role ?? artifact.artifact?.role ?? 'unknown'
    },
    avgl: {
      layer: artifact.avglLayer ?? artifact.avgl?.layer ?? 'UNKNOWN'
    },
    context: {
      summary: artifact.summary ?? 'No semantic summary available.',
      purpose: artifact.purpose ?? 'Purpose not resolved.',
      effect: artifact.effect ?? 'Effect not resolved.'
    },
    relations,
    authority,
    evidence: artifact.evidence ?? input.evidence ?? {
      state: 'UNKNOWN'
    }
  };
}
