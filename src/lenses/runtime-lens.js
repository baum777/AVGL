/**
 * AVGL Runtime Lens
 *
 * Describes execution relevance without granting execution authority.
 */

export function resolveRuntimeLens(artifact = {}) {
  const executable = Boolean(artifact.executable);

  return {
    lens: 'runtime',
    context: {
      executionRelevant: executable,
      interpretation: executable
        ? 'Artifact may participate in runtime flow.'
        : 'No runtime execution evidence detected.'
    },
    evidenceState: executable ? 'INFERRED' : 'UNKNOWN'
  };
}
