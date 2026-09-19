/**
 * AVGL Governance Lens
 *
 * Keeps authority boundaries explicit.
 */

export function resolveGovernanceLens(artifact = {}) {
  const authority = artifact.authority || {};

  return {
    lens: 'governance',
    context: {
      authority: authority.state || 'UNKNOWN',
      boundary: 'CAN != MAY',
      interpretation: authority.state
        ? 'Authority context was resolved from evidence.'
        : 'Authority requires additional evidence.'
    },
    evidenceState: 'INFERRED'
  };
}
