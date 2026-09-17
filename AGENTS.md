# AGENTS.md

## Purpose

AVGL exists to make agent systems easier to understand than graph-heavy LLM wikis or repository maps.

## Non-negotiable design rules

1. **Show the story, not the graph.** Human comprehension is the default projection goal.
2. **Evidence before interpretation.** Every semantic claim must remain traceable to source evidence or runtime observation.
3. **Unknown stays unknown.** Missing evidence must not be filled by adjacent semantics or model intuition.
4. **CAN != MAY.** Tool availability or technical reach never proves permission.
5. **ACT != DID.** An attempted or dispatched effect never proves verified outcome.
6. **Framework vocabulary is input, not AVGL truth.** Adapters normalize framework-specific concepts into the stable IR.
7. **Deterministic baseline first.** LLM-assisted classification may augment the analyzer later, but it must not replace inspectable deterministic evidence.
8. **Do not read common secret surfaces.** Scanner changes must preserve default-deny behavior for obvious credential files.
9. **Progressive disclosure.** Story is primary; implementation details belong in inspect/system views.
10. **One IR, multiple views.** Story, Harness Card, architecture, and future runtime views must derive from the same AVGL IR.

## Semantic kernel

```text
WHO → KNOW → THINK → CAN → MAY → ACT → DID
```

## Compiler pipeline

```text
DISCOVER → CLASSIFY → BIND → PROJECT
```

## Change expectations

- Add or update tests for semantic detector changes.
- Any new semantic claim type must define its evidence requirement.
- Do not infer relations/call paths merely because two nodes share a file.
- Preserve explicit `unknowns` in the IR.
- Keep the generic scanner dependency-light and runnable locally.
- Framework-specific behavior belongs behind adapters rather than hard-coded into the generic semantic kernel.
