# AVGL-0296 — Context Projection Contract (Design Input)

**Status:** DESIGN INPUT — NON-CANONICAL — DEFERRED (not a working-plan ticket)
**Reserved ID:** AVGL-0296 (reserved by working-plan Revision 2026-09-19 (5); do not reuse this number for unrelated tickets)
**Origin:** Owner decision 2026-09-19, third owner message on the Input 4 disposition ([AVGL_CONTEXT_INTELLIGENCE_LAYER_INPUT_2026-09-19.md](./AVGL_CONTEXT_INTELLIGENCE_LAYER_INPUT_2026-09-19.md)) — ordered as the next design slice, explicitly without activating AVGL-0294/0295
**Activation:** requires a separate explicit owner decision; until then this document creates no plan ticket, no schema, no code, and no Source of Truth change
**Authority:** [`AVGL_SOURCE_OF_TRUTH.md`](../AVGL_SOURCE_OF_TRUTH.md) remains authoritative; the active path remains [`AVGL_IMPLEMENTATION_WORKING_PLAN.md`](../AVGL_IMPLEMENTATION_WORKING_PLAN.md)

## Position (owner-ordered chain)

```text
0287 Evidence Projection
       ↓
0296 Context Projection Contract
       ↓
0295 Agent Context Package
       ↓
0294 Runtime Synchronization
```

AVGL-0296 is the missing layer between the evidence projection on cards (AVGL-0287) and the agent context package (AVGL-0295). The governance question it answers:

> Welche Teile des Semantic IR dürfen in welches Agent Context Package projiziert werden?

## Contract shape (owner-provided, directional)

```text
Semantic IR
      |
      v
Projection Policy
      |
      +-- visible objects
      +-- visible relations
      +-- evidence boundary
      +-- inherited constraints
      |
      v
Agent Context Package
```

## Owner refinements (2026-09-19, fourth owner message)

**Trust Boundary.** The projection layer is not only a filter — it is a **Trust Boundary**. Without AVGL-0296, "Agent bekommt Kontext" would be an implicit authority grant. With AVGL-0296, the agent receives **explicitly allowed** context; agents operate inside a defined Wahrnehmungsraum. This is why the ordering 0287 → 0296 → 0295 → 0294 prevents runtime or agent layer from emerging before the governance contract.

Gap closed by 0296:

```text
vorher:  Semantic IR → ? → Agent

nachher: Semantic IR
           → Context Projection Policy
               → Visible Context   |   Hidden Context
           → Agent Context Package
```

**Core contract.** Input is a Semantic IR Object with `identity`, `relations`, `effects`, `evidence`, `constraints`. The projection decision splits:

- Visible: `visible_objects`, `visible_relations`, `allowed_evidence`, `inherited_constraints`.
- Not visible: private sources, irrelevant relations, unverified assumptions, unknown states.

(See review finding F3: the *existence* of the hidden/unknown boundary should remain marked in packages even when its content is hidden.)

**Owner-stated answers/leanings on the activation questions** (final decision reserved for activation):

1. Policy type: long-term lean **Option B** (policy = AVGL lens extension) because the lens is the natural view definition — subject to review finding F1 (lens contract needs first-class deny semantics and an authorization gate).
2. Authorization: **not** the agent, **not** an LLM — Owner/Governance layer, analogous to `MAY`.
3. Evidence creation by projection: **No.** Projection may `select`, `transform`, `package`; it may never `claim`, `verify`, `authorize`.

**Activation path (owner-ordered):** invariant review of Semantic Kernel × Context Intelligence × Projection Governance against WHO…DID first, then the owner ACTIVATE decision for AVGL-0296 as the first implementable slice. Review executed 2026-09-19: [AVGL_0296_INVARIANT_REVIEW_2026-09-19.md](./AVGL_0296_INVARIANT_REVIEW_2026-09-19.md) (verdict PASS_WITH_FINDINGS; activation remains an owner decision). Owner gate draft (fifth message, 2026-09-19): [AVGL_0296_ACTIVATION_GATE_DRAFT_2026-09-19.md](./AVGL_0296_ACTIVATION_GATE_DRAFT_2026-09-19.md) — five formalization gates (policy contract, projection≠evidence, unknown marker, seven-classes negative tests, policy provenance) that must be explicit before ACTIVATE. Schema draft (sixth message, 2026-09-19): [AVGL_0296_SCHEMA_DRAFT_2026-09-19.md](./AVGL_0296_SCHEMA_DRAFT_2026-09-19.md) — formal contracts for projection policy, evidence/visibility axis separation, context package, provenance, and the negative test matrix. Activation readiness check (seventh message, 2026-09-19): [AVGL_0296_ACTIVATION_READINESS_CHECK_2026-09-19.md](./AVGL_0296_ACTIVATION_READINESS_CHECK_2026-09-19.md) — A1–A5 frozen (A5 restricted-marker aggregate-only default owner-final), 0296-A order confirmed, AVGL-0297 reserved for a potential future Jev classification adapter. **The pre-ACTIVATE artifact chain is complete; the only remaining decision is the owner's ACTIVATE.**

## Semantics

- A projection policy is a declarative, inspectable filter over evidenced IR content. It defines what **may leave the IR** into a package — it does not define what the IR means and adds no semantics (SoT §20 projection rules).
- Evidence boundary: every projected object/relation travels with its evidence refs or stays UNKNOWN; a package never contains unevidenced assertions (SoT §15/§16).
- Inherited constraints travel with the projection: vocabulary invariants (CAN != MAY, ACT != DID) and private-source redaction (`LOCAL_PRIVATE` transport carries no raw source fields; no private-repository source to remote model providers by default).
- Derivation visibility: projected claims keep evidence state separate from derivation mechanism (resolver/method/sources) per the AVGL-0215 provenance contract and the owner-final State/Derivation separation.
- Outbound only: the contract governs what reaches an agent. Agent output re-enters AVGL exclusively as explicitly marked INFERRED hypotheses through the normal evidence gates (SoT §24) — never as a new system fact.

## Constraints and grounding

- Lens-contract-shaped (plan AVGL-0270): a policy selects and bounds, it does not interpret.
- Depends on the v0.2 IR, evidence records (AVGL-0212/0215), typed relations (AVGL-0213/0240), and the scope model (AVGL-0250) being available first.
- Scope/redaction interplay: projection policies are the natural enforcement point for scope visibility and private-source boundaries.

## Open questions for the activation decision

Owner-leaned/answered (fourth owner message, 2026-09-19; finalize at activation):

1. Policy type: long-term lean Option B (lens extension) — requires lens-contract extension with first-class deny semantics and an authorization gate (review F1).
2. Authorization: Owner/Governance layer, analogous to `MAY`; never agent or LLM.
3. Evidence creation by projection: No — select/transform/package only, never claim/verify/authorize.

Still open:

4. Granularity: per-task, per-agent, per-scope — and how do policies compose?
5. How are policy applications themselves evidenced and audited (provenance of the projection act; review F5)?
6. Does the policy define AVGL-0295 package fields, or only filter what enters them?
