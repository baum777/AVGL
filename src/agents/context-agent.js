export const CONTEXT_AGENT_VERSION = 'context-agent.v1';

export function createContextAgent({ resolver }) {
  return {
    id: 'context-agent',
    version: CONTEXT_AGENT_VERSION,
    resolve(input) {
      return resolver.resolve(input);
    }
  };
}
