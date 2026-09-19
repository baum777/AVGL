export function resolveRelationships(input = {}) {
  const relations = [];

  const references = input.references || [];

  for (const reference of references) {
    relations.push({
      type: 'references',
      target: reference,
      evidenceState: 'OBSERVED'
    });
  }

  return {
    relations,
    relationCount: relations.length
  };
}
