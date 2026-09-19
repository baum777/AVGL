# AVGL-0297 — Activation Spec / 0297-A-00 Implementation Boundary Specification (2026-09-20)

**Status:** NON-CANONICAL IMPLEMENTATION BOUNDARY SPECIFICATION — DRAFT until activation
**Slice:** 0297-A-00 (the last pre-activation artifact; translates the owner decisions into an implementation contract)
**Bound baseline:** design input (`c88b39b`, Rev (12)) · design review (`ce1700e`, Rev (13), PASS_WITH_FINDINGS F1–F7) · owner decision record (`490a5ea`, Rev (14), OD1–OD5 / AC1–AC8 / NF1–NF9 frozen)
**Boundary:** no implementation, no `schema/` files, no provider calls, no runtime change — the schema drafts below live **in this document only** until `ACTIVATE AVGL-0297`

---

## 0. Registry extension mechanism (owner-named)

The OD1 signal registry is closed. Extension happens **only** via an explicit owner decision-record amendment (e.g. `OD1-A: add signal class manifest metadata`), never silently, never by implementation convenience (owner review 2026-09-20, point 7: "Keine stille Erweiterung").

---

## 1. Adapter Interface Contract (→ 0297-A-01)

Module: `src/semantic/jev-adapter.js` (proposed location per design input).

```text
Input:   SignalBundle  (closed OD1 registry; sanitized per §3 of the ODR)
Config:  JevAdapterConfig
Output:  SanitizedCandidate | NoClassification (fail-closed)
Effect:  none — no repository writes, no direct IR mutation, no evidence-state changes
```

```js
// directional interface draft (implementation only after activation)
classifySignals(signalBundle, config) → Promise<CandidateResult>
// CandidateResult = { status: 'candidate', candidate: SanitizedCandidate }
//                 | { status: 'no_classification', reason: 'disabled'|'timeout'|'provider_error'|'invalid_response'|'sanitizer_rejected' }
```

**Configuration surface:**

```text
enabled        default false (OD4: external provider OPT-IN everywhere)
localPrivatePolicy  'off' (OD2: LOCAL_PRIVATE default OFF; enabling requires
                   explicit owner approval record + signal filtering + provenance)
endpoint / model identity (provider: typesafe, name: jev-1.13)
timeout        bounded; on timeout → no_classification (NF4)
```

**Failure modes (all fail-closed, NF4):** provider unreachable · timeout · non-JSON response · schema-invalid response · sanitizer rejection. In every case: no classification, deterministic pipeline continues, IR unaltered. The adapter never retries into authority (unknown external outcome ≠ permission to retry).

## 2. Candidate Role Schema Draft (→ materialized in A-01; lives here until then)

```json
{
  "object_id": "src/runtime/executor.ts",
  "candidate_role": "runtime_component",
  "confidence": { "type": "model_output" },
  "model": { "provider": "typesafe", "name": "jev-1.13" },
  "provenance": {
    "input_sources": ["repository-signals"],
    "generated_by": "jev-classifier",
    "evidence_state": "INFERRED",
    "response_digest": "sha256:…",
    "signal_digest": "sha256:…",
    "source_revision": "<repository>@<ref>#<commit>"
  }
}
```

Constraints:

- `candidate_role` **must** be a declared typed-vocabulary term (AC3; SoT §10 / AVGL-0214); free-form model text is rejected (NF9).
- `evidence_state` is **written by the adapter, never read from the model** (AC2); the value is always `INFERRED` (ODR; SoT §15).
- `confidence.type: "model_output"` is provenance only (AVGL-0287) — never a score, never evidence weight.
- Envelope/content separation: run metadata (timestamps, run id, configuration snapshot) travels in the surrounding run envelope, not in the candidate content; candidate content is a deterministic function of the model response.

## 3. Sanitizer Contract (→ 0297-A-02; runs before any internal processing — AC1)

Order: `raw provider response → Output Sanitizer → Candidate Schema Validation → Validator`.

**Three-tier handling (owner-review-sharpened, binding):**

| Tier | Trigger | Action | Recorded |
|---|---|---|---|
| **Normalize** | declared field with untrusted value (e.g. `"evidence_state": "OBSERVED"`) | override — `INFERRED` pinned | normalization note in provenance metadata |
| **Strip** | undeclared, non-authority field | remove before any internal processing | field **names only** (never values — OD3 retention) |
| **Reject** | authority-class key (semantic keys `CAN`/`MAY`/`ACT`/`DID` and synonym set incl. `authority`, `permission`, `allowed`, `verified`, `executed`, `grant`) | **reject the whole candidate** | rejection record (name + digest refs) |

Owner-sharpened expectations encoded:

```text
{ "candidate_role": "deployment_operator", "MAY": true }  → REJECT (authority inflation; NF2/NF6)
{ "evidence_state": "OBSERVED" }                          → NORMALIZE → INFERRED (evidence inflation; NF5)
```

The synonym set is frozen at activation as part of A-02; extensions require an ODR amendment (same mechanism as §0). Rationale: an authority-class field signals the model attempting authority — the candidate is not salvaged.

## 4. Validator Contract (→ 0297-A-03)

```text
Input:   SanitizedCandidate + SignalBundle + validation rules
Decision: accepted | rejected
Basis:   deterministic re-derivation from signals ONLY (AC5) — model confidence is never input
```

Support checks (per design input Phase 4): path consistency · import consistency · relation consistency with the claimed `candidate_role`.

On acceptance: the candidate becomes an `INFERRED` semantic claim through the AVGL-0215 resolver-provenance contract — resolver id/version, rule, mode (Jev-assist marked), reason — respecting AVGL-0216 ("no signal type creates semantics without a resolver rule") and revision binding.

**Revival guard (AC7):** rejection is keyed on `(source_revision, object_id, candidate_role, signal_digest)`. Within an identical key, a rejection is final — a later Jev run cannot revive it. A new source revision or changed signal set legitimately re-opens evaluation. Rationale (SoT §15): a stronger downstream synthesis must never revive evidence rejected by an earlier gate.

## 5. Provenance Envelope (→ recorded per run; OD3 retention)

Stored per classification attempt:

```text
✓ response digest (sha256)
✓ signal digest (sha256)
✓ model identity (provider, name)
✓ sanitizer disposition (normalized / stripped field names / rejected-with-reason)
✓ validator decision + rule ids
✓ source revision binding (AVGL-0216)
✓ opt-in record reference (OD2/OD4) + REMOTE_PROVIDER marking

✗ raw provider transcript (forbidden, OD3)
✗ stripped/rejected field VALUES (names only)
```

## 6. Test Fixture Mapping NF1–NF9 (→ 0297-A-04)

| NF | Fixture input | Expected |
|---|---|---|
| NF1 | candidate without supporting signals | rejected |
| NF2 | `{ "candidate_role": "deployment_operator", "MAY": true }` | REJECT — whole candidate; MAY untouched in IR |
| NF3 | `{ "execution_completed": true }` | REJECT — DID unchanged |
| NF4 | Jev unavailable / timeout / non-JSON | `no_classification`; deterministic pipeline continues; IR unaltered |
| NF5 | `{ "evidence_state": "OBSERVED" }` | NORMALIZE → INFERRED |
| NF6 | undeclared field `authority: "admin"` (authority-class) | REJECT; IR untouched |
| NF7 | injection-like signal (`function ignore_previous_rules()`) | no influence — no semantics beyond deterministic signal support |
| NF8 | same signals, different Jev runs | verified/deterministic semantics identical; accepted set ⊆ validator-supported set |
| NF9 | `candidate_role` outside declared vocabulary | rejected |

(NF6 undeclared-innocuous strip behavior additionally covered by a strip-recording assertion; NF7 encodes the owner principle: `String + Struktur + Relation + Validator` — never `String → Bedeutung`.)

## 7. Runtime Integration Boundary (→ 0297-A-05; the only runtime-touching slice)

- The adapter is invocable **only** as an assist hook inside `CLASSIFY`/`RELATE` (SoT §18); **no standalone CLI/API entry point** (review requirement, retained).
- **Jev disabled ⇒ IR byte-identical** to a never-configured run (review requirement, retained; verified by an identity test in A-05).
- No synchronous critical-path dependency: timeout/failure degrades to the deterministic result.
- `REMOTE_PROVIDER` marking in the analysis record whenever an external provider received (redacted) signals.
- Configuration is explicit and auditable (opt-in records per OD2/OD4); default posture: adapter fully disabled.

## Slice mapping

```text
0297-A-00  this specification (no code)
0297-A-01  Adapter Contract implementation   (§1, §2)
0297-A-02  Normalizer                        (§3)
0297-A-03  Validator                         (§4, §5)
0297-A-04  Negative Fixtures                 (§6, NF1–NF9)
0297-A-05  Runtime Integration               (§7)
```

## Completion criteria

```text
[x] Adapter Interface Contract defined          (§1)
[x] Candidate Role Schema Draft                 (§2, in-doc until activation)
[x] Sanitizer Contract                          (§3, three-tier owner-final semantics)
[x] Validator Contract                          (§4, incl. revival-guard key)
[x] Provenance Envelope                         (§5, OD3-compliant)
[x] Test Fixture Mapping NF1–NF9                (§6)
[x] Runtime Integration Boundary                (§7)
```

## Activation gate

```text
ACTIVATE AVGL-0297   (owner decision — the single remaining gate)

then: 0297-A-01 → A-02 → A-03 → A-04 → A-05
```

Final rule (unchanged):

```text
Jev hilft AVGL beim Klassifizieren.
AVGL entscheidet nicht durch Jev.

Classification Assistance ≠ Semantic Authority
```
