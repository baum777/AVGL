# AVGL-0297 — Design Review & Activation Gate (2026-09-20)

**Status:** NON-CANONICAL REVIEW ARTIFACT
**Reviewer:** agent-prepared formal design review; owner review/adoption pending
**Reviewed input:** [AVGL_0297_JEV_CLASSIFICATION_ADAPTER_DESIGN_INPUT.md](./AVGL_0297_JEV_CLASSIFICATION_ADAPTER_DESIGN_INPUT.md) as committed in `c88b39b` (working-plan Revision 2026-09-20 (12))
**Reviewed against:** [AVGL_SOURCE_OF_TRUTH.md](../AVGL_SOURCE_OF_TRUTH.md) §§10, 11, 15, 18, 20, 24, 25; the AVGL-0215 semantic-claims contract and AVGL-0216 typed-signals/provenance-chain contract; the AVGL-0296 projection chain (design input, schema draft, readiness check); the WHO/KNOW/THINK/CAN/MAY/ACT/DID invariants (SoT §11)
**Review context:** owner Phase-1 review 2026-09-20 (documentation/architecture/validation PASS; docs commit unblocked via owner venue `c88b39b`) including the owner architecture hint of a dedicated **Jev Output Normalizer** ahead of any internal processing

---

## R1 — Pipeline placement: HOLDS

Verified claim: the design places Jev strictly between deterministic extraction and semantic validation, as an **optional assist inside the frozen `CLASSIFY`/`RELATE` stages** (SoT §18 target pipeline; "The deterministic baseline remains mandatory"), with **no new pipeline stage name**.

Checked against:

- **No parallel truth pipeline:** the design's canonical flow ends in "Deterministic AVGL Validation → Evidence-backed Semantic Representation" — candidates re-enter the one canonical pipeline; there is no second IR, no second projection (SoT §19/§20: ONE IR → MANY VIEWS).
- **No duplicate resolver:** the adapter "returns candidate classification" and must not "modify Semantic IR directly"; acceptance happens in the deterministic validation layer, i.e. the existing resolver machinery — not a Jev-side resolver.
- **No authority layer:** the adapter holds no write path to repository state, IR, or evidence states (design "must NOT" list).

**Condition AC1 (binding at activation):** the adapter must have **no standalone pipeline entry point** — it is invocable only as augmentation from within `CLASSIFY`/`RELATE`, and candidates enter the IR exclusively as semantic claims through the AVGL-0215 resolver-provenance contract (resolver id/version, rule, mode, reason — mode marking the Jev-assist path), respecting AVGL-0216's "no signal type creates semantics without a resolver rule."

## R2 — Evidence boundary: HOLDS, with finding F1

Allowed for Jev-derived labels (verified in the design):

```text
INFERRED
candidate classification
classification hints
```

Forbidden (SoT §15 canonical states + §24):

```text
OBSERVED      — Jev did not observe reality (design: explicit)
EXPLICIT      — reserved for directly asserted source evidence; a model cannot produce it
UNKNOWN       — absence of evidence is a deterministic-pipeline decision, not a model claim
DID / verified state — receipt/verification semantics (SoT §11 DID), never model-assertable
```

The design names `INFERRED`-only and "never OBSERVED"; the owner review question adds **EXPLICIT** to the forbidden list, and §15 supports it: EXPLICIT binds to evidence in the source. Checked also: "An LLM-produced structural hypothesis must remain explicitly distinguishable from verified or deterministically inferred model facts" (SoT §24) — satisfied by the candidate/provenance marking.

**Finding F1 (activation condition AC2):** `evidence_state` must be **structurally pinned by the adapter to `INFERRED`** — the state is never read from model output. A Jev response containing `"evidence_state": "OBSERVED"` (or `EXPLICIT`/`UNKNOWN`) is overridden or rejected, never trusted. Model-declared evidence states are untrusted input.

## R3 — Authority boundary: HOLDS

Proof obligation: Jev output ≠ CAN ≠ MAY ≠ ACT ≠ DID (SoT §11: CAN = tools/adapters/technical reach; MAY = policy/scope/approval/grants; ACT = execution/effect paths; DID = evidence/receipts/verification/outcomes). The design restricts Jev to KNOW/THINK assistance (context/memory/sources; model/planning/reasoning) — disjoint from the four authority classes.

Negative examples (owner-provided, adopted as required tests):

```text
Jev:  { "candidate": "deployment_operator" }   →  MUST NOT become  { "MAY": true }
Jev:  { "execution_completed": true }           →  MUST NOT become  { "DID": true }
Jev:  { "candidate_role": "runtime_component", "authority": "admin" }
                                                →  "authority" stripped by the normalizer;
                                                   MAY untouched
```

Structural enforcement (design + owner hint): a deny-by-default output field filter accepts only declared candidate fields, so forbidden keys cannot pass through even when emitted. Cross-check with AVGL-0215: its negative-tested forbidden shortcuts — **permission inflation** and **receipt inflation** — are exactly the failure modes this boundary must reproduce as tests; "name matching" (accepting because the model said so) is additionally forbidden by NF1 below.

## R4 — Private source boundary: DEFINED, with findings F3/AC3–AC4

The design fixes the boundary:

```text
Private Repository → Signal Filtering → External Classification Provider
Raw source ❌ → Jev      Metadata signals ✅ → Jev
LOCAL_PRIVATE → Jev default OFF (remote provider; owner opt-in required)
```

Activation must materialize:

- **Closed signal-type registry (F3):** an initial enum — proposal: `import`, `export`, `function`, `class`, `type`, `constant`, `path`, `file_extension`, `manifest_entry`, `config_key` (aligned with the AVGL-0216 typed-signal examples). Values are constrained to identifiers/paths with length caps; **no free-text signal values** (both a privacy and a prompt-injection defense — see Risks).
- **Redaction requirements:** signal values carry no raw source, `snippet`, `content`, or `excerpt` (`LOCAL_PRIVATE` transport invariant applied to the Jev call path); redaction enforced structurally **before** the adapter call.
- **Opt-in conditions (AC4):** `LOCAL_PRIVATE` analyses have Jev assist **off by default**; enabling requires an explicit owner decision recorded as configuration, with redacted signal-only payloads. SoT §25 additionally binds the extraction side: credential/secret surfaces are never read, so no signal may ever be derived from them.
- **REMOTE_PROVIDER marking:** the analysis record must mark that an external provider received (redacted) signals, so downstream consumers can see the boundary crossing.

## R5 — Determinism requirement: DEFINED, with finding F4

The owner's requirement — "same signals + configuration must produce the same normalized candidate output; model variance must remain outside semantic truth" — is formalized as three separable determinism boundaries:

| Boundary | Deterministic in | Statement |
|---|---|---|
| Normalizer | model response | same response → same normalized candidate object, always |
| Acceptance | signals + candidate + rules | acceptance is decided solely by the deterministic validator re-deriving support from recorded signals — never by model weight |
| Pipeline | configuration | Jev disabled ⇒ IR byte-identical to a never-configured run; enabling Jev may only add `INFERRED` candidate claims |

**Finding F4 (activation condition AC8):** the model response is **recorded and digest-bound in provenance** so a run is replayable and auditable; model variance may change *which* candidates are proposed, never whether a candidate is supported. Support is a pure function of the signals.

Cross-check with AVGL-0296-A4 (package reproducibility: same IR + same policy = same package content): Jev variance upstream cannot perturb the reproducible projection chain because verified/deterministic semantics are identical by construction.

---

## Findings

| ID | Finding | Becomes |
|---|---|---|
| F1 | `evidence_state` must be adapter-pinned to `INFERRED`; model-declared states (incl. `EXPLICIT`/`OBSERVED`/`UNKNOWN`) untrusted | AC2 |
| F2 | Dedicated **Jev Output Normalizer** stage (owner hint): Output Sanitizer → Candidate Schema Validation → Semantic Resolver; undeclared fields stripped **before any internal processing** (the design's deny-by-default note must become a separate, testable stage) | AC1 |
| F3 | Closed signal-type registry + value constraints (identifiers/paths, length caps, no free text); secret-surface-derived signals excluded per SoT §25 | AC3 |
| F4 | Three determinism boundaries + digest-bound response provenance for replay | AC8 |
| F5 | No standalone adapter entry point; candidates enter the IR only as claims via the AVGL-0215 resolver-provenance contract (Jev-assist mode marked); AVGL-0216 "no signal type creates semantics without a resolver rule" | AC1/AC6 |
| F6 | `candidate_role` values must bind to declared typed-vocabulary terms (SoT §10, AVGL-0214); free-form model text rejected | AC5 |
| F7 | Revival guard: a candidate rejected by the validator on given signals stays rejected — "a stronger downstream synthesis must never revive evidence rejected by an earlier gate" (SoT §15); re-runs with different Jev output cannot revive it | AC7 |

## Risks

1. **Prompt injection via repository-controlled signal values.** Identifier/function/import names are attacker-controlled strings; a hostile repository could encode instruction-like signal values. Mitigations: F3 value constraints, F2 field filter, R3 structural authority isolation, and the acceptance rule (validator re-derivation) — jointly tested by NF7.
2. **Availability coupling.** Jev must remain an optional accelerator, never a system dependency — fail-closed handling and NF4 guard this; the activation slice must not add Jev to any synchronous critical path.
3. **Confidence over-trust drift.** `confidence.type: "model_output"` is provenance (AVGL-0287), never a score; card rendering must never upgrade or display it as evidence weight.
4. **Provenance retention surface.** Logging Jev responses (even redacted) creates retention data — scope decided at OD3.

## Required activation conditions

```text
AC1  Output Normalizer stage (sanitizer + schema validation) before the resolver; no standalone entry point
AC2  evidence_state structurally pinned to INFERRED; never read from model output
AC3  closed signal-type registry; constrained values; no secret-surface-derived signals (§25)
AC4  LOCAL_PRIVATE default-off; owner opt-in record; structural pre-call redaction; REMOTE_PROVIDER marking
AC5  candidate vocabulary binding to typed vocabularies (§10 / AVGL-0214)
AC6  acceptance only via deterministic validator re-derivation (no model-name-matching; AVGL-0215 forbidden shortcuts)
AC7  revival guard: validator-rejected candidates stay rejected (§15)
AC8  resolver provenance per AVGL-0215/0216 incl. revision binding; Jev response digest recorded; Jev-off byte-identity
```

## Negative tests (extending the owner's fixtures 1–4)

```text
NF1  candidate without supporting signals            → rejected                    (owner Test 1)
NF2  "deployment authority"/"deployment_operator"    → invalid output; MAY untouched (owner Test 2 + R3)
NF3  "execution completed"                           → DID unchanged               (owner Test 3)
NF4  Jev unavailable                                 → AVGL continues deterministically (owner Test 4)
NF5  model returns evidence_state OBSERVED/EXPLICIT  → pinned INFERRED or rejected (F1)
NF6  model returns undeclared field (e.g. authority:"admin", CAN/MAY/DID keys) → stripped/rejected; IR untouched (F2/R3)
NF7  hostile instruction-like signal value           → no semantics beyond deterministic signal support (Risk 1)
NF8  same signals, different Jev runs                → verified/deterministic semantics identical; accepted set ⊆ validator-supported set (F4)
NF9  candidate_role outside declared vocabulary      → rejected                    (F6)
```

## Open owner decisions

```text
OD1  Initial signal-type registry contents (R4 proposal as starting point)
OD2  LOCAL_PRIVATE opt-in mechanism (per-run flag / lens config / owner-signed record)
OD3  Retention of Jev responses (digest-only vs full redacted response log)
OD4  Public-repository posture: default-on assist or opt-in everywhere (proposal: opt-in everywhere initially)
OD5  Scope of v1 activation: candidate_role only, or also candidate relations and routing suggestions (proposal: minimal v1 = candidate_role)
```

## Verdict

**PASS_WITH_FINDINGS.** The design input introduces no authority leakage, no evidence inflation, and no pipeline duplication; the private-source boundary is defined; the output contract is consistent with SoT §24 and the AVGL-0215/0216 contracts. Activation is **not** granted by this review — it requires the owner's explicit design-approval + ACTIVATE decision with F1–F7 materialized as AC1–AC8 in the activation slice (adapter → validation layer → negative fixtures NF1–NF9 → `npm run check` + `npm test`).

Owner completion criteria:

```text
[x] no authority leakage            (R3; structural enforcement AC1/AC2)
[x] no evidence inflation           (R2; F1/AC2)
[x] no pipeline duplication         (R1; AC1)
[x] private source boundary defined (R4; F3/AC3/AC4)
[x] output contract validated       (R2/R3 against §24 + AVGL-0215/0216)
[x] activation requirements documented (AC1–AC8, OD1–OD5)
```

Final invariant (unchanged):

```text
Classification Assistance ≠ Semantic Authority
```
