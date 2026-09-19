# AVGL-0295 — Agent Context Package Contract (Design Input)

**Status:** DESIGN INPUT — NON-CANONICAL — DEFERRED (not a working-plan ticket)
**Reserved ID:** AVGL-0295 (reserved by working-plan Revision 2026-09-19 (4); do not reuse this number for unrelated tickets)
**Origin:** Owner decision 2026-09-19 on the fourth dispositioned input of the series ([AVGL_CONTEXT_INTELLIGENCE_LAYER_INPUT_2026-09-19.md](./AVGL_CONTEXT_INTELLIGENCE_LAYER_INPUT_2026-09-19.md)) — reframed from the input's "Agent Harness" phase and deferred
**Activation:** requires a separate explicit owner decision; until then this document creates no plan ticket, no schema, no code, and no Source of Truth change
**Authority:** [`AVGL_SOURCE_OF_TRUTH.md`](../AVGL_SOURCE_OF_TRUTH.md) remains authoritative; the active path remains [`AVGL_IMPLEMENTATION_WORKING_PLAN.md`](../AVGL_IMPLEMENTATION_WORKING_PLAN.md)

## Definition (owner-reframed)

Not:

```text
Agent → erzeugt Context
```

but:

```text
Context IR
      ↓
Agent Context Package
      ↓
Agent Task Execution
```

The agent receives an **AVGL lens**, not the repository. AVGL is an evidence-based system model that gives AI agents a safe context; it is not a KI system that understands code.

## Shape (owner-provided example, directional only)

Before:

```json
{
 "files":[
   "entire repository"
 ]
}
```

After:

```json
{
 "task":"analyze runtime boundary",

 "context":{
   "objects":[
      "executor.ts",
      "ADR-001"
   ],

   "relations":[
      "depends_on"
   ],

   "evidence":[
      "source refs"
   ],

   "constraints":[
      "MAY != ACT"
   ]
 }
}
```

All fields must be populated from evidenced IR content (objects, typed relations, evidence refs, vocabulary constraints); unevidenced fields stay absent or UNKNOWN, never guessed.

## Constraints and grounding

- Direction guardrail (owner decision): `LLM output ≠ system state`. The prevented inverse is `LLM → creates graph → creates relations → creates truth`; the canonical direction is `system state → evidence → semantic projection → LLM interpretation`.
- The package is a read-only projection derived from the IR via a lens (plan AVGL-0270 lens contract); producing it must not add semantics to the IR.
- Agent output re-enters AVGL only as explicitly marked INFERRED hypotheses through the normal evidence gates; it never becomes EXPLICIT/OBSERVED without deterministic or observed evidence (SoT §24, §15, §16).
- Vocabulary constraints travel with the package: CAN != MAY, ACT != DID (repo AGENTS.md; SoT §11).
- Private-source invariants apply (repo AGENTS.md): no GitHub-App private-repository source/context to remote model providers by default; `LOCAL_PRIVATE` transport IR carries no raw source fields.
- Scope position: aligns with the SoT Stage 2/3 direction (SoT §8); depends on the v0.2 IR, lens contract, and evidence records being available first. Prerequisite layer: [AVGL-0296 context projection contract](./AVGL_0296_CONTEXT_PROJECTION_CONTRACT_DESIGN_INPUT.md) defines which IR parts may enter a package (owner-ordered chain: 0287 → 0296 → 0295 → 0294).

## Open questions for the activation decision

1. Is the package a serialized lens output, a new artifact type, or an API response shape (plan AVGL-0290/0292)?
2. Which lens/lenses are packageable in the first activation?
3. How are task semantics defined (who states the task, and is the task itself evidence-bound)?
4. How is agent-consumed provenance recorded (audit trail of packages handed out)?
5. What is the return path contract for INFERRED hypotheses, and which gate reviews them?
