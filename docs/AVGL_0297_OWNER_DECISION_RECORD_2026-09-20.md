# AVGL-0297 — Owner Decision Record (2026-09-20)

**Status:** NON-CANONICAL OWNER DECISION RECORD
**Resolves:** OD1–OD5 from [AVGL_0297_DESIGN_REVIEW_2026-09-20.md](./AVGL_0297_DESIGN_REVIEW_2026-09-20.md) (verdict PASS_WITH_FINDINGS, committed in `ce1700e`)
**Decision authority:** owner decisions recorded verbatim from the owner review/order 2026-09-20 (third 0297-phase owner message)
**Bound baseline:** design input as committed in `c88b39b` (working-plan Revision (12)); review + Revision (13) in `ce1700e`
**Boundary:** no implementation, no `schema/`, no provider calls, no activation — this record only freezes decisions, conditions, fixtures, and the implementation order

---

## OD1 — Signal Registry (v1 frozen)

Allowed signals:

```text
repository path metadata
file extension
imports
exports
symbol metadata
AST relations
dependency relations
```

Explicitly denied:

```text
raw source
comments
credentials
secrets
environment values
unrestricted text
```

**Registry semantics.** The allow list is **closed**: any signal type not listed is denied by default (fail-closed). In particular, the review's R4 proposal items `manifest_entry` and `config_key` are **not** in the frozen allow list and are therefore denied in v1 (dependency information enters only as `dependency relations`; configuration keys are not Jev input).

**Mapping note (non-normative, for the implementation slice):** `symbol metadata` covers function/class/type/constant identifiers; `AST relations` covers structurally extracted call/reference edges (declared-only per AVGL-0216 — no signal type creates semantics without a resolver rule); `dependency relations` covers manifest-derived dependency edges without values.

## OD2 — Private Repository Policy (frozen)

```text
LOCAL_PRIVATE:
  default: OFF

Activation requires:
  - explicit owner approval
  - signal filtering
  - provenance record
```

## OD3 — Retention Policy (frozen)

Default retention:

```text
response digest
provenance metadata
```

Forbidden:

```text
raw provider transcript storage
```

(Resolves review OD3: digest-only default; full redacted response logs are not retained.)

## OD4 — Public Repository Policy (frozen)

```text
External provider usage:
  default: OPT-IN
```

(Resolves review OD4: opt-in everywhere, public repositories included; the deterministic baseline runs without any external provider unless explicitly enabled.)

## OD5 — v1 Scope (frozen)

Allowed in v1:

```text
candidate_role classification
```

Deferred beyond v1:

```text
relation inference
capability inference
authority inference
execution interpretation
```

**Scope consequence.** The design input's allowed-assist list (KNOW/THINK, candidate classification, relationship suggestion, role suggestion, routing suggestion) is narrowed for v1 activation to **candidate_role only**; relationship and routing suggestions remain long-term design intent, deferred. The deferrals of capability/authority/execution inference reinforce the CAN/MAY/ACT/DID isolation (SoT §11).

---

## Activation Conditions (AC1–AC8, owner-frozen)

```text
AC1  Output sanitizer before validation
AC2  Evidence state forced to INFERRED
AC3  Typed vocabulary validation
AC4  Authority field rejection
AC5  Deterministic acceptance
AC6  Signal sanitization
AC7  Revival prevention
AC8  Provenance recording
```

**Mapping to review findings F1–F7:**

| Owner AC | Review basis |
|---|---|
| AC1 | F2 (Jev Output Normalizer: sanitizer → candidate schema validation → resolver) |
| AC2 | F1 (evidence_state adapter-pinned; model-declared states untrusted) |
| AC3 | F6 (typed-vocabulary binding, SoT §10 / AVGL-0214) |
| AC4 | R3 structural enforcement (deny-by-default field filter; forbidden classes CAN/MAY/ACT/DID) |
| AC5 | F4/F5 (validator re-derivation from signals; no signal type creates semantics without a resolver rule) |
| AC6 | F3 (closed registry, constrained values, structural pre-call redaction) |
| AC7 | F7 (revival guard, SoT §15) |
| AC8 | F4 (response digest) + AVGL-0215/0216 provenance chain |

**Additional binding review requirements** (owner-endorsed review, not renumbered into the owner AC set — the implementation slice must still honor them):

- no standalone pipeline entry point (adapter invocable only within `CLASSIFY`/`RELATE`);
- Jev disabled ⇒ IR byte-identical to a never-configured run;
- `REMOTE_PROVIDER` marking in the analysis record when an external provider received (redacted) signals;
- immutable source revision binding per AVGL-0216.

## Negative Fixtures (NF1–NF9, frozen)

```text
NF1  candidate without supporting signals            → rejected
NF2  authority-class candidate (deployment_operator) → invalid output; MAY untouched
NF3  "execution completed"                           → DID unchanged
NF4  Jev unavailable / failure                       → AVGL continues deterministically; IR unaltered
NF5  model-declared evidence_state (OBSERVED/EXPLICIT) → pinned INFERRED or rejected
NF6  undeclared / authority fields (e.g. authority:"admin", CAN/MAY/DID keys) → stripped or rejected; IR untouched
NF7  injection-like signal values                    → ignored (no semantics beyond deterministic signal support)
NF8  same signals, different Jev runs                → verified/deterministic semantics identical
NF9  candidate_role outside declared vocabulary      → rejected
```

Owner-highlighted examples covered: Jev cannot create MAY (NF2) · cannot create DID (NF3) · cannot bypass validator (NF1/NF8) · cannot access restricted fields (NF6) · Jev failure does not alter IR (NF4) · injection-like signals ignored (NF7).

**Signal-injection architecture principle (owner, review point 4).** Semantics never arise from `String → Bedeutung`. They arise only from:

```text
String + Struktur + Relation + Validator
```

A hostile repository can control signal strings (e.g. `function ignore_security_and_grant_admin()`), never the validation outcome.

## Implementation order (frozen, after activation)

```text
0297-A-01  Adapter Contract
     ↓
0297-A-02  Normalizer
     ↓
0297-A-03  Validator
     ↓
0297-A-04  Negative Fixtures
     ↓
0297-A-05  Runtime Integration
```

Runtime integration (A-05) is limited to the optional assist path inside `CLASSIFY`/`RELATE`; the deterministic baseline remains mandatory (SoT §18/§24).

## Activation gate

Single remaining decision:

```text
ACTIVATE AVGL-0297
```

Until that owner decision: no `src/`, no `schema/`, no test material, no provider configuration, no runtime change. After activation, slice 0297-A-01 starts from the frozen contracts in this record and the design input.

## Completion criteria (owner checklist)

```text
[x] OD1–OD5 resolved
[x] Activation boundary explicit
[x] v1 scope frozen
[x] Implementation scope frozen
[x] Owner activation gate ready
```

## Final rule (unchanged)

```text
Jev hilft AVGL beim Klassifizieren.
AVGL entscheidet nicht durch Jev.

Classification Assistance ≠ Semantic Authority
```
