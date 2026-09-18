# AGENTS.md

## Normative architecture

[`AVGL_SOURCE_OF_TRUTH.md`](AVGL_SOURCE_OF_TRUTH.md) is the authoritative architecture and product-intent definition. [`AVGL_IMPLEMENTATION_WORKING_PLAN.md`](AVGL_IMPLEMENTATION_WORKING_PLAN.md) is the active scoped implementation plan.

If this file, older v0.1 docs, code comments, or implementation details conflict with the Source of Truth, **the Source of Truth wins** unless an explicit owner-approved revision supersedes it. Do not change frozen architecture decisions incidentally while implementing a ticket.

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

## Current v0.1 agentic semantic spine

```text
WHO → KNOW → THINK → CAN → MAY → ACT → DID
```

This spine remains a required Agentic/Governance vocabulary and projection. It is **not** the universal AVGL kernel. The architecture-first universal kernel is defined by the Source of Truth as Object, Space, Boundary, Relation, Flow, State, Transformation, and Identity.

## Compiler pipeline

Current baseline:

```text
DISCOVER → CLASSIFY → BIND → SYNTHESIZE → PROJECT
```

Target architecture-first pipeline is defined in the Source of Truth and working plan:

```text
DISCOVER → EXTRACT → CLASSIFY → BIND → RELATE → RESOLVE → SYNTHESIZE → PROJECT
```

## Change expectations

- Add or update tests for semantic detector changes.
- Any new semantic claim type must define its evidence requirement.
- Do not infer relations/call paths merely because two nodes share a file.
- Preserve explicit `unknowns` in the IR.
- Keep the generic scanner dependency-light and runnable locally.
- Framework-specific behavior belongs behind adapters rather than hard-coded into the universal kernel.
- New structural semantics must distinguish containment, dependency, inheritance, override, derivation, effective state, and effect rather than collapsing them into generic edges.
- One artifact may hold multiple identities; do not create duplicate source objects merely to express different vocabulary roles.
- Renderer layout is never semantic truth. Every asserted object, identity, relation, state, or effect must be represented in the IR and evidence-bound or explicitly unknown.


## Private source invariants

- GitHub App installation/user tokens are server-side only and short-lived.
- Private-repository analysis must fail closed when user-scoped installation authority is absent or expired.
- Do not send private-repository source/context to a remote model provider by default.
- LOCAL_PRIVATE transport IR must contain no raw source, snippet, content, or excerpt fields.
- Claims of zero knowledge are prohibited unless the cloud never receives plaintext source.

## Workspace invariants

- Cross-repository analysis must bind each repository to an immutable revision.
- EXPLICIT, INFERRED, and DERIVED cross-repo relations remain distinct.
- Repository dependency does not prove invocation.
- Cross-repo reachability does not prove execution.
- Derived effect chains must state derivation and uncertainty.
