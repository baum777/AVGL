import { discoverRepository } from './discover.js';
import { classifyDiscoveries } from './classify.js';
import { bindAvglIr } from './bind.js';

export { discoverRepository } from './discover.js';
export { classifyDiscoveries } from './classify.js';
export { bindAvglIr } from './bind.js';
export { projectStory, projectHarnessCard, projectJson } from './project.js';
export { SEMANTIC_CLASSES, EVIDENCE_STATES, HUMAN_LABELS } from './constants.js';

export async function analyzeRepository(rootPath = '.', options = {}) {
  const discovery = await discoverRepository(rootPath, options);
  const classifications = classifyDiscoveries(discovery);
  return bindAvglIr(discovery, classifications);
}
