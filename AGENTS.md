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
DISCOVER → EXTRACT → CLASSIFY → BIND → RESOLVE_RELATIONS → TRACE_EFFECTS → SYNTHESIZE → PROJECT
```

## Change expectations

- Add or update tests for semantic detector changes.
- Any new semantic claim type must define its evidence requirement.
- Do not infer relations/call paths merely because two nodes share a file.
- Preserve explicit `unknowns` in the IR.
- Keep the generic scanner dependency-light and runnable locally.
- Framework-specific behavior belongs behind adapters rather than hard-coded into the generic semantic kernel.


## Private source invariants

- GitHub App installation tokens are server-side only and short-lived.
- Private-repository analysis must fail closed when installation authority is absent or expired.
- Do not send GitHub App private-repository source/context to a remote model provider by default.
- `LOCAL_PRIVATE` transport IR must contain no raw source, `snippet`, `content`, or `excerpt` fields.
- Claims of "zero knowledge" are prohibited unless the cloud never receives plaintext source; GitHub App cloud analysis is least-privilege/zero-retention-oriented, not cryptographic zero knowledge.

## Workspace invariants

- Cross-repository analysis must bind each repository to an immutable revision.
- `EXPLICIT`, `INFERRED`, and `DERIVED` cross-repo relations remain distinct.
- A repository dependency does not prove invocation.
- Cross-repo reachability does not prove execution.
- Derived effect chains must state their derivation and uncertainty.
