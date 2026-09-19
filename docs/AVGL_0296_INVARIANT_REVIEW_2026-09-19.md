# AVGL-0296 Invariant Review — Semantic Kernel × Context Intelligence × Projection Governance

**Status:** REVIEW — NON-CANONICAL — AGENT-PREPARED (binds nothing; input to the future owner ACTIVATE decision)
**Date:** 2026-09-19
**Ordered by:** owner, fourth message on the Input 4 disposition ("kleiner Architektur-Review" before any ACTIVATE decision)
**Reviewed state:** `AVGL_SOURCE_OF_TRUTH.md` and repo `AGENTS.md` at main `d0bd668`; working plan including uncommitted Revisions 2026-09-19 (4)/(5); `docs/AVGL_CONTEXT_INTELLIGENCE_LAYER_INPUT_2026-09-19.md`; design inputs AVGL-0294/0295/0296 (with owner refinements, fourth message)
**Review question:** Is the chain AVGL-0287 → AVGL-0296 → AVGL-0295 → AVGL-0294 consistent with the AVGL semantic kernel and the seven-class invariants — specifically `MAY != Projection Permission`, `CAN != Context Visibility`, `DID != Agent Confirmation`?
**Method:** document review against SoT §5.2, §10, §11, §15, §16, §17, §24, §25; plan AVGL-0210–0293 and Revisions (1)–(5); repo AGENTS.md non-negotiable rules. No code changed; no tests run (design-level review).

## Invariant checks

### I1 — `MAY != Projection Permission` — HOLDS

- SoT §11: **MAY** = policy, scope, approval, grants, revocation — authority semantics *of the modeled system*.
- Projection permission is AVGL's own disclosure decision about which IR parts reach which consumer. It is a different authority axis:
  - a modeled MAY grant does not imply package visibility;
  - visibility of a MAY claim does not confer the modeled permission;
  - authorizing a projection policy is itself an authority act outside the target repo's seven-class model — per owner decision it belongs to the Owner/Governance layer, analogous to MAY (0296 open-question answer 2).
- Consequence: policy application needs recorded provenance (who, when, which policy, which IR revision) so the boundary is auditable.

### I2 — `CAN != Context Visibility` — HOLDS

- SoT §11: **CAN** = tools, adapters, APIs, technical reach. Visibility is perception, not reach.
- An agent receiving a package containing CAN-class facts gains no capability; conversely, an actor's CAN in the IR says nothing about whether it may be shown.
- This extends repo AGENTS.md rule 4 (`CAN != MAY`) with a third orthogonal axis: visibility ⊥ capability ⊥ permission.

### I3 — `DID != Agent Confirmation` — HOLDS (guarded)

- SoT §11: **DID** = evidence, receipts, verification, outcomes; SoT §15: OBSERVED is a canonical evidence state; SoT §24: LLMs must not silently invent observed outcomes.
- An agent's confirmation is INFERRED interpretation at best; DID requires evidence (observed or deterministic). Already encoded in AVGL-0295 (return path: explicitly marked INFERRED hypotheses only) and AVGL-0287 (INFERRED visually distinguishable).
- Required at activation: a negative test that no code path upgrades an agent-produced claim to EXPLICIT/OBSERVED without independent evidence.

### I4 — Evidence-layer separation — HOLDS

- `Claim + Evidence State + Provenance + Derivation` as separate fields is consistent with SoT §15 and the implemented AVGL-0215 provenance contract (resolver id/version, rule, mode, reason). DERIVED remains a derivation attribute, never a state (owner-final, third message; no SoT §28 revision).

### I5 — Lens-rule compatibility of the chain — HOLDS (with finding F1)

- SoT §5.2: `SYSTEM MODEL + LENS = PROJECTION`; a lens must not silently upgrade evidence strength or create unsupported relations.
- The chain keeps all semantics in the IR: 0287 renders, 0296 selects/bounds, 0295 packages, 0294 synchronizes. None adds semantic truth. Consistent.

## Findings (activation requirements, not blockers)

- **F1 — Option B needs a lens-contract extension.** The owner leans toward policy-as-lens-extension (Option B). The AVGL-0270 lens contract covers select/emphasize/retain/expose — it has no **deny** semantics and no **authorization gate**. A trust boundary needs both: *invisible* must be first-class (hidden ≠ merely not-selected), and policy-bearing lenses must require Owner/Governance authorization distinct from ordinary display lenses. Without this, the boundary is unenforceable.
- **F2 — "Projection creates no evidence" must be a tested invariant.** Projection may select/transform/package; never claim/verify/authorize (SoT §15: semantic meaning is not evidence). Negative test: projection output cannot introduce new evidence records or upgrade evidence states.
- **F3 — Unknown-boundary marker for packages.** Hiding unverified assumptions and unknown states from agent packages is correct, but per SoT §25 (coverage limitations must remain visible) packages should carry an explicit coverage/unknown *marker*: the boundary's existence stays visible while its content stays hidden. This prevents agents from treating package contents as exhaustive, and reconciles the AVGL-0295 wording ("absent or UNKNOWN") with the 0296 hidden list.
- **F4 — The three inequalities as negative tests.** I1–I3 should ship as negative/boundary tests with the AVGL-0296 activation (authority-sensitive change → negative tests required per repo AGENTS.md evidence rules).
- **F5 — Authorization provenance.** Q2 (Owner/Governance authorizes policies) needs a recorded authorization trail. Policy artifacts are governance artifacts outside the IR until adopted; they must not be stored as semantic truth inside the IR.

## Verdict

**PASS_WITH_FINDINGS.** The chain AVGL-0287 → AVGL-0296 → AVGL-0295 → AVGL-0294 violates no WHO…DID invariant; the three owner-named inequalities hold as stated and are encodable as tests. F1–F5 are requirements for the activation slice, not objections to it. Activation of AVGL-0296 (or any of 0294–0296) remains a separate owner decision; this review binds nothing and changes no Source of Truth decision.
