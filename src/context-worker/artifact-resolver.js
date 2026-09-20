export function resolveArtifactContext(input = {}) {
  const path = input.path || input.artifact?.path || 'unknown';
  const content = input.content || '';

  const identities = [];

  if (/README|ARCHITECTURE|DESIGN|SPEC|DOC/i.test(path)) {
    identities.push({
      type: 'documentation-source',
      evidenceState: 'INFERRED'
    });
  }

  if (/test|fixture|spec/i.test(path)) {
    identities.push({
      type: 'validation-source',
      evidenceState: 'INFERRED'
    });
  }

  return {
    artifact: {
      path,
      size: content.length
    },
    identities,
    summary: identities.length
      ? `Artifact classified as ${identities.map((x) => x.type).join(', ')}`
      : 'Artifact identity unresolved',
    unknowns: identities.length ? [] : ['semantic identity']
  };
}
