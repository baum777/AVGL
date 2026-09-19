/**
 * AVGL Structure Lens
 *
 * Resolves repository structure context without changing semantic truth.
 */

export function resolveStructureLens(artifact = {}) {
  const path = artifact.path || '';

  return {
    lens: 'structure',
    context: {
      location: path,
      layer: artifact.type || 'unknown',
      interpretation: path.includes('/')
        ? 'Artifact has a repository location context.'
        : 'Artifact location unresolved.'
    },
    evidenceState: 'INFERRED'
  };
}
