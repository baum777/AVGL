# Context Resolution Pipeline

## Purpose

Transform repository evidence into contextual semantic objects without replacing AVGL classification.

Flow:

```
DISCOVER
   |
CLASSIFY
   |
BIND
   |
RESOLVE CONTEXT
   |
SYNTHESIZE
   |
PROJECT
```

## Rules

- Evidence remains attached.
- UNKNOWN remains UNKNOWN.
- Relations require observable signals.
- Effects require evidence-bound interpretation.
- No authority inference.

## Resolver Layers

```
File
 |
Role Resolver
 |
Relation Resolver
 |
Effect Resolver
 |
Context Object
 |
Card Projection
```
