export const GRAPH_AGENT_VERSION = 'graph-agent.v1';

export function projectRelations(contextObjects = []) {
  return {
    agent: 'graph-agent',
    version: GRAPH_AGENT_VERSION,
    nodes: contextObjects.map((item) => item.id ?? item.identity?.id ?? null),
    edges: []
  };
}
