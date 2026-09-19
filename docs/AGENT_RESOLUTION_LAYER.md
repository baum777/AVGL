# Agent Resolution Layer

## Purpose

The agent layer enriches AVGL Context Objects. Agents do not invent architecture. They resolve evidence-bound projections.

```text
File Agent
   |
Context Agent
   |
Graph Agent
   |
Semantic Card
```

## Boundaries

- File Agent: identity and evidence extraction.
- Context Agent: contextual placement and enrichment.
- Graph Agent: relation projection.

## Invariants

- Evidence remains attached.
- UNKNOWN remains UNKNOWN.
- Agent output is a projection, not authority.
