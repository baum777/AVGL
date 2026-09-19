/**
 * AVGL Context Card Composer v0.1
 *
 * Converts evidence-bound semantic artifacts into a human-readable
 * context projection. This layer does not create semantic truth;
 * it only projects existing IR evidence.
 */

export function composeContextCard(artifact) {
  return {
    id: artifact.id,
    artifact: {
      path: artifact.path,
      type: artifact.type ?? "unknown",
      role: artifact.role ?? "unknown"
    },
    avgl: {
      layer: artifact.avglLayer ?? "UNKNOWN"
    },
    context: {
      summary: artifact.summary ?? "No semantic summary available.",
      purpose: artifact.purpose ?? "Purpose not resolved.",
      effect: artifact.effect ?? "Effect not resolved."
    },
    relations: artifact.relations ?? [],
    authority: artifact.authority ?? {
      state: "UNKNOWN"
    },
    evidence: artifact.evidence ?? {
      state: "UNKNOWN"
    }
  };
}
