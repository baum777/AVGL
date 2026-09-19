export const FILE_AGENT_VERSION = 'file-agent.v1';

export function analyzeFile({ path, evidence = [] }) {
  return {
    agent: 'file-agent',
    version: FILE_AGENT_VERSION,
    identity: {
      path
    },
    evidence
  };
}
