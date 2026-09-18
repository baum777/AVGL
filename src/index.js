import { discoverRepository } from './discover.js';
import { classifyDiscoveries } from './classify.js';
import { bindAvglIr } from './bind.js';
import { synthesizeAvglIr } from './synthesize.js';
import { buildRelationModel } from './relations.js';
import {
  analyzeGitHubRepository as analyzeGitHubRepositoryRaw,
  discoverGitHubRepository,
  parseGitHubRepository,
  selectGitHubCandidates
} from './github-source.js';

export { discoverRepository, discoverFiles, sourceKindForPath } from './discover.js';
export { classifyDiscoveries } from './classify.js';
export { bindAvglIr } from './bind.js';
export { synthesizeAvglIr } from './synthesize.js';
export { sanitizeIrForTransport, assertTransportSafeIr } from './privacy.js';
export { createWorkspaceIr, workspaceSummary } from './workspace.js';
export { resolveGitHubRevision } from './github-tree.js';
export {
  createGitHubAppJwt,
  mintInstallationToken,
  listUserInstallationRepositories,
  verifyUserInstallationAccess
} from './github-app-auth.js';
export { extractRelationFacts, resolveRelations, traceEffectChains, buildRelationModel } from './relations.js';
export {
  SEMANTIC_RESOLVER_VERSION,
  resolveSemanticCandidate,
  createSemanticResolutionSummary,
  mergeSemanticResolutionSummaries
} from './semantic-resolution.js';
export { discoverGitHubRepository, parseGitHubRepository, selectGitHubCandidates };
export { projectStory, projectHarnessCard, projectJson } from './project.js';
export { SEMANTIC_CLASSES, EVIDENCE_STATES, HUMAN_LABELS } from './constants.js';

export async function analyzeRepository(rootPath = '.', options = {}) {
  const discovery = await discoverRepository(rootPath, options);
  const relationModel = buildRelationModel(
    discovery.transientFiles ?? [],
    (discovery.transientFiles ?? []).map((file) => file.path)
  );
  discovery.relations = relationModel.relations;
  discovery.effects = relationModel.effects;
  discovery.effectChains = relationModel.effectChains;
  delete discovery.transientFiles;
  const classifications = classifyDiscoveries(discovery);
  return synthesizeAvglIr(bindAvglIr(discovery, classifications));
}

export async function analyzeGitHubRepository(input, options = {}) {
  return synthesizeAvglIr(await analyzeGitHubRepositoryRaw(input, options));
}
