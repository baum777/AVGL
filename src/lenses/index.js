import { resolveStructureLens } from './structure-lens.js';
import { resolveAgenticLens } from './agentic-lens.js';
import { resolveGovernanceLens } from './governance-lens.js';
import { resolveRuntimeLens } from './runtime-lens.js';

export function resolveContextLenses(artifact = {}) {
  return [
    resolveStructureLens(artifact),
    resolveAgenticLens(artifact),
    resolveGovernanceLens(artifact),
    resolveRuntimeLens(artifact)
  ];
}
