import { resolveArtifactContext } from './artifact-resolver.js';
import { resolveRelationships } from './relationship-resolver.js';
import { resolveAuthority } from './authority-resolver.js';
import { composeContextCard } from './card-composer.js';

/**
 * Evidence-preserving context materialization pipeline.
 *
 * This module intentionally composes existing resolvers only.
 * It does not create semantic truth or replace AVGL IR.
 */
export function materializeContextCard(input = {}) {
  const artifact = resolveArtifactContext(input);
  const relations = resolveRelationships(input);
  const authority = resolveAuthority(input);

  return composeContextCard({
    artifact,
    relations,
    authority,
    evidence: input.evidence || []
  });
}
