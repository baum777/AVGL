# AVGL Context Intelligence Layer

## Purpose

The context layer transforms isolated repository artifacts into evidence-bound semantic objects.

```text
File
 ↓
Semantic Object
 ↓
Relations
 ↓
Effect
 ↓
Card Projection
```

## Boundary

The context layer does not invent architecture. It only enriches existing AVGL evidence with bounded relationships.

Rules:

- evidence remains attached
- UNKNOWN remains UNKNOWN
- semantic claims require provenance
- context does not upgrade authority

## Runtime roadmap

```text
DISCOVER
 ↓
CLASSIFY
 ↓
BIND
 ↓
RESOLVE CONTEXT
 ↓
SYNTHESIZE
 ↓
PROJECT
```

Future slices add resolver agents, service worker synchronization and Card v2 projection.
