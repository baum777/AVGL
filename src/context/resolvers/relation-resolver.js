// Relation resolver foundation.
// Produces explicit relations without inventing hidden architecture.

export const RELATION_RESOLVER_VERSION = '0.1';

export function resolveRelations(input = {}) {
  const relations = [];

  if (input.imports?.length) {
    relations.push(...input.imports.map(value => ({
      type: 'depends_on',
      target: value,
      confidence: 'OBSERVED'
    })));
  }

  if (input.references?.length) {
    relations.push(...input.references.map(value => ({
      type: 'references',
      target: value,
      confidence: 'OBSERVED'
    })));
  }

  return relations;
}
