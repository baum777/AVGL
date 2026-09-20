# AVGL IMPLEMENTATION WORKING PLAN

**Status:** Active implementation plan  
**Target:** Architecture-first AVGL IR v0.2  
**Normative source:** [AVGL_SOURCE_OF_TRUTH.md](./AVGL_SOURCE_OF_TRUTH.md)  
**Baseline:** AVGL v0.1 evidence-bound repository analyzer  
**Out of scope:** first-class temporal model, full runtime-history ingestion, AVGL-authoritative code generation

**Revision 2026-09-19:** Owner-adopted context-lens framing from dispositioned external input; adds AVGL-0277 and AVGL-0287 (see [docs/AVGL_CONTEXTUAL_UNDERSTANDING_INPUT_2026-09-19.md](./docs/AVGL_CONTEXTUAL_UNDERSTANDING_INPUT_2026-09-19.md)). No Source of Truth decision changed.

**Revision 2026-09-19 (2):** Owner-adopted semantic-claims contract stabilization from a second dispositioned input of the same series; adds AVGL-0215 as a prerequisite for AVGL-0277/AVGL-0287 (see [docs/AVGL_SEMANTIC_IR_STABILIZATION_INPUT_2026-09-19.md](./docs/AVGL_SEMANTIC_IR_STABILIZATION_INPUT_2026-09-19.md)). No Source of Truth decision changed.

**Revision 2026-09-19 (3):** Owner-adopted layered-structure refinements from a third dispositioned input of the series; adds AVGL-0216 and amends AVGL-0240, AVGL-0250, AVGL-0277, and the test strategy (see [docs/AVGL_STRUCTURE_OPTIMIZATION_INPUT_2026-09-19.md](./docs/AVGL_STRUCTURE_OPTIMIZATION_INPUT_2026-09-19.md)). No Source of Truth decision changed.

**Revision 2026-09-19 (4):** Fourth dispositioned input of the series (context intelligence layer / service worker / agent layer) owner-adopted as **ADOPT PARTIAL** (see [docs/AVGL_CONTEXT_INTELLIGENCE_LAYER_INPUT_2026-09-19.md](./docs/AVGL_CONTEXT_INTELLIGENCE_LAYER_INPUT_2026-09-19.md)): semantic card confidence rendering adopted as an AVGL-0287 amendment (canonical SoT §15 evidence states only — no new evidence state, no DERIVED enum); AVGL-0294 (service worker context synchronization runtime) and AVGL-0295 (agent context package contract) reserved as **deferred non-canonical design inputs** pending a separate owner activation decision (design input docs in `docs/`, not plan tickets); agent-as-resolver and new pipeline names rejected; remainder covered by existing scope. No Source of Truth decision changed.

**Revision 2026-09-19 (5):** Owner confirmed the ADOPT PARTIAL final state and the separation of evidence state (EXPLICIT/OBSERVED/INFERRED/UNKNOWN, SoT §15) from derivation mechanism — DERIVED is not a state, no SoT §28 revision. Reserves **AVGL-0296 (context projection contract)** as a third deferred non-canonical design input: the governance layer between AVGL-0287 and AVGL-0295 defining which Semantic IR parts may project into an agent context package (owner-ordered chain: 0287 → 0296 → 0295 → 0294). No activation, no implementation, no Source of Truth decision changed (see [docs/AVGL_0296_CONTEXT_PROJECTION_CONTRACT_DESIGN_INPUT.md](./docs/AVGL_0296_CONTEXT_PROJECTION_CONTRACT_DESIGN_INPUT.md)).

**Revision 2026-09-19 (6):** Owner refined AVGL-0296 as a **Trust Boundary** (projection decides visible objects/relations, allowed evidence, and inherited constraints versus hidden private/irrelevant/unverified/unknown content; authorization by Owner/Governance analogous to MAY; projection never creates evidence — select/transform/package only; long-term lean: policy as lens extension). Agent-prepared invariant review of the chain against WHO…DID semantics recorded ([docs/AVGL_0296_INVARIANT_REVIEW_2026-09-19.md](./docs/AVGL_0296_INVARIANT_REVIEW_2026-09-19.md), verdict PASS_WITH_FINDINGS, findings F1–F5 are activation requirements). No activation of AVGL-0294–0296; the ACTIVATE decision for AVGL-0296 remains a separate owner decision. No Source of Truth decision changed.

**Revision 2026-09-19 (7):** Owner delivered the **AVGL-0296 activation gate draft** — five gates that must be formalized before ACTIVATE (G1 projection policy contract with declared deny; G2 projection-never-creates-evidence negative test; G3 explicit unknown/boundary marker instead of null; G4 seven-classes negative tests incl. the added `Context Package ≠ Execution Path`; G5 policy provenance WHO/MAY/DID), a five-step implementation order (lens contract extension → policy schema → projection resolver → context package generator → service worker sync; steps 4/5 = 0295/0294), and an LLM-assist boundary (classification/routing only, never authorization/evidence/truth/visibility — SoT §24). Recorded as non-canonical gate draft ([docs/AVGL_0296_ACTIVATION_GATE_DRAFT_2026-09-19.md](./docs/AVGL_0296_ACTIVATION_GATE_DRAFT_2026-09-19.md)); no new adoption decision, no activation, no Source of Truth decision changed.

**Revision 2026-09-19 (8):** Owner ordered and the **AVGL-0296 schema draft** was recorded as the sole artifact slice before any ACTIVATE decision ([docs/AVGL_0296_SCHEMA_DRAFT_2026-09-19.md](./docs/AVGL_0296_SCHEMA_DRAFT_2026-09-19.md), non-canonical, in `docs/` not `schema/`): formal contracts for the projection policy (governance-record authorization reference, deny precedence, default-deny, fail-closed completeness over SoT §15 states), the **evidence-state/visibility-state axis separation** (VISIBLE / NOT_PROJECTED / RESTRICTED / UNAVAILABLE — supersedes the G3 single reason-enum note), the context package (IR-snapshot binding, relation-endpoint visibility rule, boundaries travel with content), projection provenance (executor ≠ authorizer; determinism boundary), and the four-test negative matrix (incl. policy self-authorization FAIL). Implementation Slice 0296-A (schema → validator → projection evaluator → negative fixtures → tests) starts only after an owner ACTIVATE decision. No implementation, no activation, no Source of Truth decision changed.

**Revision 2026-09-19 (9):** Owner froze the **AVGL-0296 activation readiness check** A1–A5 ([docs/AVGL_0296_ACTIVATION_READINESS_CHECK_2026-09-19.md](./docs/AVGL_0296_ACTIVATION_READINESS_CHECK_2026-09-19.md)): A1 draft/canonical boundary READY (no premature `schema/` material); A2 policy semantics READY_WITH_IMPLEMENTATION_REQUIREMENT (deny > allow; no matching policy → no projection); A3 evidence/visibility state separation READY; A4 package reproducibility READY (same IR + same policy = same package content); **A5 DECIDED — RESTRICTED markers stay aggregate-only** (a per-object restricted marker leaks existence metadata; finer visibility belongs to a higher trust zone). Confirms the 0296-A order (A-01 policy schema → A-02 validator → A-03 projection evaluator → A-04 context package generator → A-05 negative fixtures + tests; not UI-first), reserves **AVGL-0297** for a potential future Jev classification adapter (Signals → Jev → Candidate Label → AVGL Validator → Semantic IR; not part of 0296; no design-input doc until ordered), and records the five immutable guards incl. the new `Engine Execution ≠ Authority`. The pre-ACTIVATE artifact chain is complete; the only remaining decision is the owner's `ACTIVATE AVGL-0296`. No code before activation; no Source of Truth decision changed.

**Revision 2026-09-19 (10):** Owner closed the **pre-activation phase** (eighth message; closure block in the readiness check): design phase PASS, activation readiness READY, gates G1–G5 all PASS; added the explicit no-conversion rule `NOT_PROJECTED ≠ UNKNOWN` (visibility states never convert into evidence states and vice versa); AVGL-0297 boundary confirmed (optional classification adapter, never semantic authority). No open design questions within current scope; no activation, no code, no Source of Truth decision changed. Single remaining gate: owner `ACTIVATE AVGL-0296` → 0296-A-01…A-05 → AVGL-0295 → AVGL-0294.

**Revision 2026-09-19 (11):** Executed **AVGL-BUGFIX-CONTEXT-LOADER-YAML** (owner-ordered pre-0296 stabilization slice). Reported symptom: "File-Context konnte nicht geladen werden / expectJson is not defined" on `architecture/capability.schema.yaml`. **Failure classification (explicit): NOT a YAML bug · NOT a cache bug · a repository loader contract bug** — `src/repository-inspect.js` called a non-existent `expectJson` helper (defined privately in `src/github-app-auth.js`, never imported), so every `/api/file` request raised a ReferenceError for all file types, not YAML-specific; no persisted error cache exists (only `avgl.locale` in localStorage; the API sets `Cache-Control: no-store`), so cache invalidation/re-scan items were no-ops. **Fix:** route `fetchRepositoryFile` through the already-exported `expectGitHubJson(fetchImpl, url, token)` from `src/github-tree.js` (the single fetch helper github-tree itself uses; no duplicated implementation) — this also fixes the latent private-repo failure (the old call would have passed the token as an options object, never setting the Authorization header). YAML files flow through the normal text-signal summary path (`jsonMeta` only parses `.json`). Regression tests added in `test/repository-inspect.test.js`: yaml load incl. Bearer header, no-token header absence, and 401/404/422 kept distinguishable (401 status-message, 404 not-found, 422 non-file payload). Validation: `npm run check` exit 0; `npm test` **84 tests / 83 pass / 1 fail** — the single failure (`mobile-first layout contracts` / "moves brand poster and asset library behind the primary flow") is **pre-existing** (79/78/1 before the slice; zero failures introduced, five tests added). Loader-error→evidence-record wiring remains 0296-A scope (SoT §25 coverage limitations). No Source of Truth decision changed.

**Revision 2026-09-20 (12):** Owner ordered **AVGL-0297 (Jev Classification Adapter)** as a controlled, non-authoritative classification assistance layer and ordered its design materialization (the reservation's "no design-input doc until ordered" clause from Revision (9) is thereby satisfied). Design input recorded ([docs/AVGL_0297_JEV_CLASSIFICATION_ADAPTER_DESIGN_INPUT.md](./docs/AVGL_0297_JEV_CLASSIFICATION_ADAPTER_DESIGN_INPUT.md), non-canonical, deferred): purpose, architectural position (optional assist adapter inside the frozen CLASSIFY/RELATE stages — no new pipeline stage name, SoT §18), input contract (extracted signals only — never credentials/secrets/permissions/user identity/execution state; signal values carry no raw source), output contract (candidate classification, never semantic truth), provenance (`evidence_state: INFERRED` within the canonical SoT §15 states; never OBSERVED), semantic class restrictions (assist KNOW/THINK/candidates only; never resolve CAN/MAY/ACT/DID — enforced by a deny-by-default output field filter), fail-closed handling (Jev optional; AVGL continues deterministically), deterministic validation layer, negative fixtures 1–4, and activation criteria. Implementation (adapter → validation layer → negative fixtures) is **gated on a separate owner design-approval + activation decision**; no schema, no code, no test created. Commit boundary: docs commit now; `src/`/`test/` commit only after activation. No Source of Truth decision changed.

**Revision 2026-09-20 (13):** Owner reviewed Phase 1 (documentation/architecture boundary/validation PASS; docs commit landed via owner venue as `c88b39b` after the agent-side Mimosa-L3 block was correctly handled without bypass) and ordered the **AVGL-0297 design review & activation gate** slice. Agent-prepared review recorded ([docs/AVGL_0297_DESIGN_REVIEW_2026-09-20.md](./docs/AVGL_0297_DESIGN_REVIEW_2026-09-20.md), NON-CANONICAL REVIEW ARTIFACT) against SoT §§10/11/15/18/20/24/25, the AVGL-0215/0216 contracts, the AVGL-0296 chain, and the WHO…DID invariants. **Verdict PASS_WITH_FINDINGS:** R1 pipeline placement holds (assist inside frozen CLASSIFY/RELATE; no parallel truth pipeline, no duplicate resolver, no authority layer); R2 evidence boundary holds with F1 (`evidence_state` adapter-pinned to INFERRED — model-declared states incl. EXPLICIT/OBSERVED untrusted); R3 authority boundary holds (negative examples adopted; structural deny-by-default field filter); R4 private-source boundary defined (closed signal-type registry, structural pre-call redaction, LOCAL_PRIVATE default-off + owner opt-in, REMOTE_PROVIDER marking); R5 determinism formalized as three boundaries (normalizer deterministic in response; acceptance deterministic in signals; Jev-off ⇒ IR byte-identical) with digest-bound response provenance. Findings F1–F7 become activation conditions AC1–AC8 (incl. the owner-hinted **Jev Output Normalizer** stage: sanitizer → candidate schema validation → resolver), negative fixtures extended NF1–NF9 (incl. prompt-injection-via-signal-values and revival guard per SoT §15), open owner decisions OD1–OD5 (signal registry, opt-in mechanism, response retention, public-repo posture, v1 scope). Activation remains a separate owner decision; no code, no schema, no provider call, no activation. No Source of Truth decision changed.

**Revision 2026-09-20 (14):** Owner resolved **OD1–OD5** and ordered the formal **AVGL-0297 owner decision record** ([docs/AVGL_0297_OWNER_DECISION_RECORD_2026-09-20.md](./docs/AVGL_0297_OWNER_DECISION_RECORD_2026-09-20.md), NON-CANONICAL OWNER DECISION RECORD; review committed earlier as `ce1700e`). **OD1 signal registry frozen** (closed allow list: path metadata, file extension, imports, exports, symbol metadata, AST relations, dependency relations; denied: raw source, comments, credentials, secrets, environment values, unrestricted text — registry items `manifest_entry`/`config_key` from the review proposal are NOT in the allow list and therefore denied in v1). **OD2** LOCAL_PRIVATE default OFF (activation: explicit owner approval + signal filtering + provenance record). **OD3** retention = response digest + provenance metadata; raw provider transcript storage forbidden. **OD4** external provider usage default OPT-IN (public repositories included). **OD5 v1 scope frozen: candidate_role classification only**; relation/capability/authority/execution inference deferred (design-input relationship/routing suggestions thereby deferred beyond v1). Activation conditions **AC1–AC8 owner-frozen** (output sanitizer before validation · evidence state forced INFERRED · typed vocabulary validation · authority field rejection · deterministic acceptance · signal sanitization · revival prevention · provenance recording), mapped to review findings F1–F7 with the four non-renumbered review requirements retained (no standalone pipeline entry point; Jev-off IR byte-identity; REMOTE_PROVIDER marking; revision binding). Negative fixtures **NF1–NF9 frozen**; signal-injection principle recorded (semantics from String + Struktur + Relation + Validator, never String → Bedeutung). Implementation order frozen as **0297-A-01 Adapter Contract → A-02 Normalizer → A-03 Validator → A-04 Negative Fixtures → A-05 Runtime Integration**. Single remaining gate: owner `ACTIVATE AVGL-0297`; no code, no schema, no provider call, no activation. No Source of Truth decision changed.

**Revision 2026-09-20 (15):** Owner reviewed the decision record (PASS) and ordered the **AVGL-0297 activation spec (slice 0297-A-00, Implementation Boundary Specification)** — the last pre-activation artifact, translating the frozen owner decisions into an implementation contract; recorded as [docs/AVGL_0297_ACTIVATION_SPEC_2026-09-20.md](./docs/AVGL_0297_ACTIVATION_SPEC_2026-09-20.md) (NON-CANONICAL, DRAFT until activation; ODR committed as `490a5ea`). Contents: adapter interface contract (`src/semantic/jev-adapter.js` proposed; fail-closed `no_classification` on timeout/provider error/invalid response; opt-in config, OD2/OD4 defaults off) · candidate-role schema draft (in-doc only until activation; `candidate_role` vocabulary-bound, `evidence_state` adapter-written always INFERRED, `confidence.type: model_output` provenance-only, envelope/content determinism separation) · **sanitizer contract with owner-sharpened three-tier semantics** (Normalize: untrusted declared values → INFERRED pinned · Strip: undeclared non-authority fields, names-only recording · **Reject: authority-class keys reject the whole candidate** — encoding the review's NF expectations `{MAY:true} → REJECT` and `{evidence_state:"OBSERVED"} → NORMALIZE→INFERRED`; synonym set frozen at A-02, extension via ODR amendment) · validator contract (deterministic re-derivation only, AC5; revival guard keyed on source_revision+object_id+candidate_role+signal_digest, new revision legitimately re-opens) · provenance envelope (OD3: digests + dispositions + revision binding; no raw transcripts, no stripped values) · NF1–NF9 fixture mapping table · runtime integration boundary (assist-hook-only inside CLASSIFY/RELATE, no standalone entry, Jev-off IR byte-identity, no synchronous critical path, REMOTE_PROVIDER marking). OD1 registry extension mechanism recorded: explicit ODR amendment only (e.g. OD1-A manifest metadata), never silent. Slice mapping A-00→A-05 defined. No implementation, no `schema/` file, no provider call; activation remains the owner gate. No Source of Truth decision changed.

**Revision 2026-09-20 (16):** **AVGL-0296 activated by the owner and implementation continued on branch `feat/avgl-0296-context-projection` (draft PR #34).** Observed branch baseline: `a390285` (A-01 projection policy schema, `schema/context-projection-policy-v1.json`) + `4d90352` (A-02 policy validator, `src/projection-policy.js`), merge-base = main `bb8b1e6`. **A-03 DONE** — deterministic projection evaluator `src/context-projection.js`: policy validation + external governance-reference verification reused from A-02 (fail-closed: no policy / invalid policy / unverified reference / no selector match → no projection); strict IR adapter over existing IR v0.1 fields (nodes/relations/invariants/unknowns) — **IR-CONTRACT = MATERIALIZED-ADAPTER** (Case B): canonical `schema/avgl-ir-v0.2.json` remains absent, the adapter is a compatibility boundary that does NOT claim v0.2 and does not manufacture spaces/identities/scope/effective state; the immutable source revision is a required caller-bound parameter (IR v0.1 has no native revision field — native binding stays AVGL-0216/v0.2 scope); deny > include (selector semantics: exact + trailing-`*` prefix only); evidence boundary per SoT §15 (objects: allowedStates for EXPLICIT/OBSERVED, inferredHandling preserve/deny for INFERRED, UNKNOWN never projected as content; relations: basis EXPLICIT/INFERRED mapped directly, **DERIVED conservatively under inferredHandling** as derivation mechanism); relation endpoint closure (visible relation requires allowed type + both endpoints visible + evidence permitted; no endpoint guessing, no identifier leakage); visibility classification VISIBLE/NOT_PROJECTED/RESTRICTED/UNAVAILABLE with RESTRICTED aggregate-only downstream (owner-final A5); executor ≠ authorizer provenance (engine id/version, policy id+revision, governance reference, IR revision). **A-04 DONE** — `src/context-package.js`: deterministic package artifact `avgl-context-package-v1` with stable digest-bound package_id, ir_binding/policy_binding, sorted objects/relations/constraints (IR-declared only), aggregate-only boundaries (hidden_count = restricted objects + hidden relations; unavailable_count), provenance envelope with varying `generated_at` separated from semantic content (`comparePackageContent`). **A-05 DONE** — `test/context-projection.test.js`: NF-0296-01…15 all implemented and passing (incl. no-evidence-creation, CAN/MAY/ACT/DID isolation, policy self-authorization rejection, deny-beats-include, fail-closed no-match, axis non-conversion, hidden-endpoint omission, package determinism, binding mutation, unknown relation type, INFERRED preserve/deny) + positive fixture + DERIVED-basis conservatism + selector semantics + missing-revision fail-closed + aggregate-only boundaries + public-seam exposure (`validateProjectionPolicy`, `evaluateProjection`, `generateContextPackage` via `src/index.js`). **Validation:** `npm run check` exit 0; `npm test` **102 tests / 101 pass / 1 fail** — 18 tests added, zero failures introduced; the single failure is the pre-existing `mobile-first layout contracts` defect (baseline-identical, reclassified from current evidence, not 0296 scope). **Commits: BLOCKED_BY_MIMOSA_L3** — the commit gate hard-blocks on the pre-existing `test/github-app-auth.test.js:31` fake-fixture finding (outside the 0296 delta; commit e6064b5 passed the same gate earlier the same day); no bypass attempted; commit sequence prepared for owner venue (evaluator → package generator → tests → docs). **CI: CI_PENDING** — no run exists yet; authoritative classification follows the CI-execution-authority rules now drafted in AGENTS.md (uncommitted owner work, left untouched). Not implemented (out of scope per activation): UI, agent runtime, service worker, AVGL-0294, AVGL-0297. No Source of Truth decision changed.

**Revision 2026-09-20 (17):** Owner manually landed the four prepared 0296 commits (`0d2652a` evaluator → `0e9ee23` package generator → `7fb7a65` tests → `73982b4` docs; branch `feat/avgl-0296-context-projection` = 6 ahead / 0 behind main, local = origin). **Closure review executed per owner order (Close 0296 → 0295):** (1) **Public-seam drift confirmed and fixed locally** — the pushed branch exported only `validateProjectionPolicy`/`evaluateProjection` because the commit-split preparation had removed the `generateContextPackage` export for commit-1 buildability and the owner venue sequence inherited that state; reproduced on the pushed tree (seam test 17/18 red), fixed by adding exactly the missing export line (`src/index.js`); fix commit `fix: expose AVGL-0296 context package generator` **BLOCKED_BY_MIMOSA_L3** (same pre-existing `test/github-app-auth.test.js:31` fixture finding; no bypass; staging cleared by the gate) → owner venue. (2) **Re-validation from the corrected branch state:** `npm run check` exit 0; `npm test` **102/101/1** — single failure `mobile-first layout contracts / moves brand poster…` independently reproduced from the main baseline `bb8b1e6` via isolated worktree (5/4/1, same assertion) → pre-existing classification is evidence-backed, not assumed. (3) **Contract review against code (not only tests):** all frozen invariants verified in implementation — projection passes nodes through unchanged and creates no evidence records; visibility states (VISIBLE/NOT_PROJECTED/RESTRICTED/UNAVAILABLE) never convert evidence states (UNKNOWN-evidence → UNAVAILABLE bucket, never surfaced as content); deny-after-include ordering for objects and type-deny for relations; relation visibility requires both endpoints in the visible set; RESTRICTED exists only as aggregate counts in packages (identifiers only in evaluator-internal dispositions); executor/authorizer separation with external governance-registry verification; deterministic content via codepoint sorting + digest-bound package_id + envelope-separated `generated_at`. (4) **IR contract status preserved: MATERIALIZED_ADAPTER** — no `schema/avgl-ir-v0.2.json` created or claimed; adapter consumes IR v0.1 nodes/relations/invariants/unknowns with caller-bound revision; no spaces/identities/scope/effective-state manufactured. (5) **CI classification:** branch run `35490716925` job `test` completed/failure with `steps: []`, `runnerName: null` → **CI_INFRASTRUCTURE_FAILURE** (identical shape on every push incl. the main docs commit `35489129472`); `.github/workflows/ci.yml` declares only `runs-on: ubuntu-latest` while the governance intent (AGENTS.md CI-execution-authority section, owner work) names the `t-wim` self-hosted path as authoritative → **CI_POLICY_WORKFLOW_DRIFT**; no runner label invented, no workflow rewrite without authorization → no authoritative CI_PASS record is possible. **0296 closure gate: implementation complete (A-01…A-05 committed; seam fix pending one owner-venue commit) but closure = BLOCKED_ON_CI_AUTHORITY** — per the ordered transition rule, AVGL-0295 was NOT started. No Source of Truth decision changed.

**Revision 2026-09-20 (18):** **AVGL-0295 owner-activated by explicit instruction "start 0295"** (an explicit owner decision to proceed despite the recorded 0296 BLOCKED_ON_CI_AUTHORITY classification — the transition rule was consciously overridden by the owner, not silently). Context landed by the owner in the interim: `e6059bc` defused the synthetic access-token fixture (removing the long-standing Mimosa L3 commit blocker), `745c34e` committed the AGENTS.md CI execution authority section, `4bf1ba3` landed the 0296 seam fix (branch 9 ahead of main); CI runs on `4bf1ba3` remain `steps: []` / `runnerName: null` → CI_INFRASTRUCTURE_FAILURE persists (infrastructure-level, push-wide). Closure review recorded as Revision (17) (`7051791`). **0295 implementation on stacked branch `feat/avgl-0295-agent-context-package`:** **A-01 DONE** — `schema/agent-context-package-v1.json`: closed-shape agent-consumption contract (schema_version, digest package_id, source_binding with ir_revision + projection policy id/revision + governance reference, optional consumer.agent_id only where configured, IR-shaped objects/relations, constraints, aggregate-only boundaries, provenance with created_by/authorized_by/projection_package_id/generated_at); evidence items declare **reference-only fields (path/line/sourceKind) — snippet/content are structurally rejected**, enforcing the no-rehydration boundary at the contract level. **A-02+A-03 DONE** — `src/agent-context-package.js`: `createAgentContextPackage({projectionPackage, consumerContext})` accepts **only** a validated 0296 `avgl-context-package-v1` artifact (binding + governance authorization required; consumer context is identifier-only and cannot inject objects/relations — no raw repo fallback); carries objects/relations/constraints/boundaries without strengthening (evidenceState/basis preserved verbatim, references only); authorization is **transported, never created** (authorized_by = the 0296 governance record; created_by = the 0295 engine, executor ≠ authorizer preserved); deterministic digest package_id over (artifact, engine version, projection package, IR revision, policy id+revision, governance id, agent id) with generated_at as envelope. `validateAgentContextPackage` enforces closed shape, enum discipline, **dangling-relation-endpoint rejection**, and binding presence. **A-04 DONE** — `src/agent-hypothesis.js`: `createAgentHypothesis` wraps agent statements as `avgl-agent-hypothesis-v1` envelopes (marked INFERRED_HYPOTHESIS, evidence_state pinned INFERRED, acceptance pending_evidence_gate, authority_granted/verification_claimed explicit false) — a pure constructor with no IR write path; agent output re-enters only through the normal evidence gates. **A-05 DONE** — `test/agent-context-package.test.js`: positive materialization test (identities/evidence references/constraints/boundaries/bindings/provenance preserved; zero semantic additions) plus the negative matrix — raw-source non-rehydration (references only), hidden-content non-reappearance, arbitrary-object injection rejection, no CAN/MAY/ACT capability or authority fields, evidence non-upgrade, binding non-droppability, dangling-endpoint rejection, determinism with envelope exclusion, agent-confirmation-≠-DID hypothesis boundary (originating package deep-unchanged), fail-closed hypothesis inputs, malformed-projection-package rejection, public seam (`createAgentContextPackage`, `validateAgentContextPackage` via `src/index.js`). **Validation:** schema JSON parses; `npm run check` exit 0; `npm test` **115 tests / 114 pass / 1 fail** — 13 added, zero introduced; single failure remains the mobile-first defect independently reproduced from main `bb8b1e6`. Open design-input questions 1–5 resolved within activation scope: artifact = new schema type (Q1), lens = the 0296 projection result (Q2), task semantics deferred outside package content (Q3), provenance = audit envelope + projection_package_id link (Q4), return path = marked-hypothesis envelope to normal evidence gates (Q5). Not implemented: AVGL-0294, agent runtime, service worker, LLM paths, 0297. No Source of Truth decision changed.

**Revision 2026-09-20 (19):** **AVGL-0295 release-closure sequence executed per owner review order** (push → stacked PR → remote verification → CI classification → closure revision). (1) **Owner precision recorded:** the hypothesis envelope's `evidence_state: INFERRED` is the **epistemic classification of the hypothesis, not a new AVGL evidence record** — `Agent Hypothesis marked INFERRED ≠ new AVGL Evidence Record`; only a downstream AVGL evidence gate may accept it as a source-bound semantic assertion (code-level clarification committed as `b81079c`, comment-only). (2) **Pushed:** `feat/avgl-0295-agent-context-package` at `b81079c` (be45896 contract → 38fb662 hypothesis boundary → 53287df tests → f4b1846 Rev (18) → b81079c precision). (3) **Stacked draft PR #36** opened against base `feat/avgl-0296-context-projection` (not main) — 0295 consumes 0296 output; review surface stays separated. (4) **Remote verification PASS:** local HEAD = origin HEAD (`b81079c`), PR file set exactly the six expected files (schema, module, hypothesis, seam, tests, plan; +779 lines over the 0296 base). (5) **CI classification:** runs `35492113126` (push) and `35492124442` (pull_request) on `b81079c` both completed/failure with `steps: []` and `runnerName: null` → **CI_INFRASTRUCTURE_FAILURE** (no validation steps executed; identical shape push-wide including main); workflow drift persists (`ci.yml` `ubuntu-latest` vs t-wim/self-hosted governance intent in AGENTS.md) → **CI_POLICY_WORKFLOW_DRIFT** unchanged. **Owner status labels (frozen):** `AVGL-0295_IMPLEMENTATION = COMPLETE`; `AVGL-0295_RELEASE_CLOSURE = BLOCKED_ON_CI_AUTHORITY` (was PENDING_PUSH_AND_CI; push/PR/verification done, authoritative CI absent); `AVGL-0296_IMPLEMENTATION = COMPLETE`; `AVGL-0296_RELEASE_CLOSURE = BLOCKED_ON_CI_AUTHORITY`. Next architecture slice after CI-authority resolution: **AVGL-0294 runtime synchronization, behind its own owner activation gate** (0297 remains separately gated). No Source of Truth decision changed.

**Revision 2026-09-20 (20):** **CI-authority drift resolved on main; branch sync sequence executed per owner order.** PR #35 (`docs/ci-execution-authority`) merged to main as `0ed04bf`: frontdoor CI doctrine + fixture defuse + `524fd1d` wiring the authoritative `test-self-hosted` job (`runs-on: [self-hosted, Linux, X64, unitera-ci]`) alongside the supplementary hosted `test` job → **MAIN_CI_POLICY = WIRED**; repository-level CI_POLICY_WORKFLOW_DRIFT is resolved (classification retired for main and, after sync, for both feature branches). Feature-branch stale state resolved: `feat/avgl-0296-context-projection` merged main cleanly (`52919fe`, only ci.yml +20; AGENTS.md/fixture files byte-identical both sides) and pushed (PR #34 updated); `feat/avgl-0295-agent-context-package` merged the updated 0296 head cleanly (`d73ea59`, only ci.yml +20) and pushed (PR #36 updated). **Authoritative CI classification: CI_PENDING on both current feature heads** — `test-self-hosted` is queued on run `35492481324` (0296 head `52919fe`) and run `35492677326` (0295 head `d73ea59`) with declared runner labels, but no runner has picked up (>6 min observation; external dependency: the `[self-hosted, Linux, X64, unitera-ci]` runner must be brought online — owner infrastructure action, not a repository change). The supplementary hosted `test` jobs continue to complete/failure with `steps: []`/`runnerName: null` (CI_INFRASTRUCTURE_FAILURE shape, supplementary only, not authoritative). Status labels updated: `0296_BRANCH_CI = SYNCED_PENDING_AUTHORITATIVE_RUN`; `0295_BRANCH_CI = SYNCED_PENDING_AUTHORITATIVE_RUN`; `AUTHORITATIVE_CI = PENDING_QUEUED`. Only an executed `test-self-hosted` run of `npm run check` + `npm test` can produce `CI_PASS`/`CI_FAIL`; note the expected result depends on the pre-existing mobile-first defect (`npm test` exit ≠ 0 with the independently main-reproduced failure — documented non-slice baseline per the 0296 acceptance rule). No Source of Truth decision changed.

**Revision 2026-09-20 (21):** **Authoritative CI executed; mobile-first closure ticket executed (owner Option A); CI_PASS on both feature heads.** (1) Classification precision accepted: a queued `test-self-hosted` job proves only `NO_ELIGIBLE_RUNNER_PICKED_JOB → CI_PENDING` (possible causes: offline / not registered / runner-group access / label mismatch — not inferable from queue state alone). Resolution by inspection: runner `unitera-ci-avgl-01` **is registered, online, label-complete** (`self-hosted, Linux, X64, unitera-ci`). (2) First authoritative executions on `52919fe`/`d73ea59` = **CI_FAIL (executed)**: `Syntax check` success, `Test` failure — failing test identified from the run log as `mobile-first layout contracts / moves brand poster and asset library behind the primary flow`, i.e. the documented pre-existing defect; per the owner decision **no automatic baseline-waiver** (a red executed authoritative run stays CI_FAIL), owner chose **Option A: fix the defect as a separate closure ticket instead of softening the gates**. (3) **Closure ticket executed:** root cause = PR #19 removed the brand-showcase HTML while the mobile-first test contract and `renderAssetLibrary` in `web/app-entry.js` (binding `#asset-library-grid`/`#asset-categories`/`#asset-search`, previously orphaned) still expected it; CSS support already present. Fix `74c0672` on the 0296 stack base: brand-showcase section restored **behind the primary flow** (between `#result` and `data-spider-section`), markup from the `refactor/mobile-first-wireframe` direction with asset paths adapted to the current layout — **no test changes; the contract was honored, not weakened**. Local validation after fix: `npm run check` exit 0; `npm test` **115/115/0** (first fully green suite). Synced into 0295 via merge (`05fe61a`). (4) **Re-executed authoritative gates = CI_PASS on both heads:** 0296 head `74c0672` run `35493177712` (push event) and 0295 head `05fe61a` run `35493186735` — `test-self-hosted` success with all steps executed and green (`Set up job`, `checkout`, `setup-node`, **`Syntax check`**, **`Test`**, post steps, `Complete job`). The cancelled `pull_request`-event twin run on `74c0672` executed no steps and is not evidence. Supplementary hosted `test` jobs continue to fail with `steps: []` (CI_INFRASTRUCTURE_FAILURE shape, non-authoritative by design). (5) **Status labels frozen:** `0296_IMPLEMENTATION = COMPLETE`, `0296_RELEASE_CLOSURE = CI_PASS_AUTHORITATIVE (merge-ready; merge = owner gate)`; `0295_IMPLEMENTATION = COMPLETE`, `0295_RELEASE_CLOSURE = CI_PASS_AUTHORITATIVE (merge-ready after #34; merge = owner gate)`; `AUTHORITATIVE_CI = CI_PASS_BOTH_HEADS`. Next per owner sequence: **#34 merge → #36 merge → `ACTIVATE AVGL-0294`** (own owner gate; 0297 separately gated). No Source of Truth decision changed.

**Revision 2026-09-20 (22):** **AVGL-0294 owner-activated ("ACTIVATE Runtime Synchronization") and implemented.** Observed merge state at activation: #34, #35, #36, #37 all MERGED, but #36 landed into its base branch — `main` (9e6a068) contains the full 0296 layer while the 0295 layer (modules, schema, tests) is present only on `feat/avgl-0296-context-projection` @5d96326; per the ordered unless-clause ("do not stack on an unmerged feature branch unless main still lacks 0295"), the 0294 branch `feat/avgl-0294-context-sync-runtime` was based on 5d96326 (complete 0295+0296 baseline; suite 115/115/0 verified before implementation; pending owner action: merge the 0296 branch to main to close that gap). **A-01 DONE** — `src/context-sync-runtime.js`: explicit state machine (EMPTY/FRESH/STALE/REFRESHING/OFFLINE_AVAILABLE/UNAVAILABLE/INVALID with a fail-closed transition table incl. crashed-REFRESHING recovery), `sync_state` as a fourth axis strictly separate from semantic/evidence/visibility states, closed-shape `validateContextSyncRecord` with a sequence-guard field. **A-02 DONE** — binding-keyed package store: identity binds package_id + ir_revision + policy id/revision + governance_reference + consumer (never repo name/URL/timestamp alone); injectable storage adapter with in-memory default; every entering package passes the 0295 validator — invalid packages are rejected, never repaired; no raw source/snippet/secret storage (evidence already reference-only by 0295 contract). **A-03 DONE** — refresh/invalidation coordinator: explicit triggers only (invalidation, consumer refresh, TTL window) — no filesystem watching (SW sandbox fact recorded); invalidation marks STALE and never deletes or revokes authority; per-key coalescing (one in-flight refresh, N waiters); bounded retry (maxAttempts + backoff + error class only, no secret-bearing payloads); **out-of-order guard via lineage + acceptance epoch**: revisions are opaque strings, so ordering is modeled by a monotonic acceptance counter captured synchronously at refresh entry — a slower response that started before a newer acceptance (direct delivery or faster refresh) is discarded as `superseded`, and lineage mismatch (wrong policy/governance/consumer) is rejected as `binding_mismatch`; a newer revision lands as a NEW cache identity while the old entry is marked `superseded_by_newer_revision`. **A-04 DONE** — offline + delivery: network-failure-with-package → OFFLINE_AVAILABLE (never FRESH); getCurrentContext serves last-valid state-labeled; `src/context-sync-messages.js` typed message contract (CONTEXT_GET/REFRESH/INVALIDATE/STATE/UPDATED, closed payloads, fail-closed unknown types, same-origin trust helper) + `web/context-sync-worker.js` thin self-contained web-root Service Worker adapter (Cache API storage beside semantics, sync state in metadata headers, no scanning/parsing/classification, same-origin enforcement, not registered by any page — UI wiring remains upstream scope). **A-05 DONE** — `test/context-sync-runtime.test.js`: NF-0294-01…15 all passing + canonical positive chain (0296 projection → 0295 agent package → 0294 store → consumer read → invalidation → refresh → new revision FRESH) + subscription + empty/unavailable delivery + public seam (`createContextSyncRuntime`, `validateContextSyncRecord`, `validateContextSyncMessage`, `assertTrustedContextMessageSource`). **Validation:** `npm run check` exit 0; `npm test` **134 tests / 134 pass / 0 fail** (19 added, zero failures). No semantic resolver, no evidence mutation, no visibility/authority decision, no UI registration, no provider calls. No Source of Truth decision changed.

**Revision 2026-09-20 (23):** **0295 Main-promotion slice (PR #39) + review-hardening repair (PR #39 threads R-01…R-03).** *Numbering note: (22) is the stacked 0294-branch plan entry (AVGL-0294 implementation record); this merge lands both entries in order (22) then (23).* (1) **Promotion PR #39 opened** (`feat/avgl-0296-context-projection` → `main`) carrying exactly the missing 0295 layer after main absorbed PR #31/#33 (legacy context layer) and PR #37 (mobile-first): remote diff verified **6 files, +783/−0, additions only** (`AVGL_IMPLEMENTATION_WORKING_PLAN.md` +8, `schema/agent-context-package-v1.json`, `src/agent-context-package.js`, `src/agent-hypothesis.js`, `src/index.js` +1 export, `test/agent-context-package.test.js`); `git merge-tree` conflict-free; the 19 legacy context-layer files survive the promotion byte-identically. Behavioral merge simulation (scratch worktrees, no refs moved): `origin/main` **104/104/0** → +0295 **117/117/0** → +0294 **136/136/0**, `npm run check` exit 0 at every stage. (2) **Authoritative CI on the promotion head `5d96326`: CI_PASS_AUTHORITATIVE** — run `35495166709` job `test-self-hosted` fully executed and green (`Syntax check`, `Test`, all steps); the hosted `test` job failed with `steps: []` (CI_INFRASTRUCTURE_FAILURE shape, supplementary, non-authoritative). (3) **Merge blocked by repository ruleset `con` (id 23675451)** — `required_review_thread_resolution` + `require_code_owner_review`; 3 open Codex review threads on the 0295 files. No admin/bypass attempted (`SELF_HOSTED_RUNNER != BRANCH_PROTECTION_BYPASS`); **merge of #39 and of #38 remain owner gates**. (4) **The 3 threads are substantive fail-closed gaps, not nitpicks — repaired on this branch:** **R-01 (P1)** `validateAgentContextPackage` now enforces the schema's declared closed shape (`additionalProperties:false` at every level): undeclared fields rejected at package/source_binding/consumer/object/relation/endpoint/boundary/provenance/created_by/authorized_by level; **evidence items restricted to the reference triple `path`/`line`/`sourceKind` — `snippet`/`detector`/`excerpt`/`content` are now structurally rejected** (a tampered package could previously smuggle raw private source past validation-before-storage into the 0294 store); malformed elements (`null` objects, primitive relations) rejected instead of silently skipped; required object fields (`label`, `statement`, `confidence` 0…1, `evidenceCount`, `evidence` array) and relation fields (`id`, `type`, `basis`, endpoints `kind`+`id`) enforced; constraint entries must be non-empty strings. **R-02 (P2)** `validateProjectionPackageInput` validates element shapes and `boundaries`, so `createAgentContextPackage` returns `{ok:false}` with typed errors instead of throwing (`objects:[null]`, `relations:[{}]`, missing boundaries); plus a **self-consistency guard — the materializer never emits a package its own validator rejects** (a 0296 view that cannot yield a contract-conformant package fails closed rather than handing an unvalidated artifact downstream). **R-03 (P2)** `createAgentHypothesis` requires a genuinely validated origin package (runs `validateAgentContextPackage`, underlying errors attached as `cause`) and **binds `relatedObjectIds` to package-exposed object ids** (`unbound_related_object_id`) — a `{schema_version:'1', package_id:'fake'}` shape can no longer originate a package-linked hypothesis with undefined `ir_revision`. (5) **Tests:** 8 added (`R-01` ×3, `R-02` ×3, `R-03` ×2) covering snippet/content smuggling, undeclared fields at every level, silent-skip removal, throw-free materializer paths, self-consistency, fake-origin rejection, unbound-id rejection, and the positive bound-id path. Branch validation: `npm run check` exit 0; `npm test` **123/123/0**. Merge sequence unchanged: #39 (owner) → retarget #38 → main → authoritative CI → #38 (owner). 0297 remains separately gated. No Source of Truth decision changed.

---

## 1. Objective

Move AVGL from the current semantic analyzer:

~~~text
repository
→ DISCOVER
→ CLASSIFY
→ BIND
→ WHO/KNOW/THINK/CAN/MAY/ACT/DID
→ STORY / INSPECT / SYSTEM
~~~

to an architecture-first structural compiler:

~~~text
sources
→ DISCOVER
→ EXTRACT
→ CLASSIFY
→ BIND
→ RELATE
→ RESOLVE
→ SYNTHESIZE
→ PROJECT
~~~

with one evidence-bound IR capable of representing:

~~~text
spaces
objects
identities
boundaries
typed relations
flows
states
transformations
derivations
effective state
vocabularies
evidence
lenses / projections
~~~

The implementation must preserve the current deterministic baseline and evidence invariants.

---

## 2. Global Definition of Done

The run is complete only when:

- [ ] schema/avgl-ir-v0.2.json exists and validates representative fixtures.
- [ ] Repositories, folders, and files are materialized in IR rather than existing only in the Web file tree.
- [ ] One artifact can carry multiple typed identities.
- [ ] Relations are typed, evidence-bound, and schema-validated.
- [ ] Containment is distinguishable from dependency.
- [ ] Inheritance is distinguishable from containment.
- [ ] Override/shadowing is modeled explicitly.
- [ ] Effective state resolves for the initial supported scope/inheritance fixtures.
- [ ] Provenance and downstream propagation are traversable.
- [ ] WHO…DID remains available as an Agentic vocabulary/projection.
- [ ] CAN != MAY, ACT != DID, secret exclusion, and explicit UNKNOWN behavior remain tested.
- [ ] Structure, Evidence, Agentic, Inheritance, Propagation, and Effective-State projections derive from the same IR.
- [ ] Web navigation can move structure → identity → relation/effect → evidence and back.
- [ ] Selected underlying object identity survives supported lens switches.
- [ ] No renderer-specific state becomes independent semantic truth.
- [ ] Full-scan reporting remains fail-closed on unreadable eligible files.
- [ ] npm test passes.
- [ ] npm run check passes.
- [ ] Public docs match implementation.
- [ ] The shipped result cannot reasonably be described as only a prettier repository graph.

---

## 3. Non-goals for this run

Do not expand this run into:

- first-class time as an AVGL primitive;
- execution-history playback;
- Git-history temporal navigation;
- arbitrary framework support;
- perfect cross-language AST extraction;
- direct visual code mutation;
- AVGL as authoritative source of truth;
- autonomous Apply operations;
- unrestricted LLM-generated topology;
- complete call-graph reconstruction for every language.

The architecture must leave seams for these later capabilities without implementing them now.

---

# PHASE 0 — Baseline lock and guardrails

## Purpose

Freeze behavior that must survive v0.2.

## Tickets

### AVGL-0200 — Baseline fixture inventory

- [ ] Catalog current tests by invariant.
- [ ] Ensure explicit coverage for secret exclusion.
- [ ] Ensure explicit coverage for incomplete scan.
- [ ] Ensure explicit coverage for CAN != MAY.
- [ ] Ensure documentation-only sources cannot prove MAY/ACT/DID.
- [ ] Ensure synthesis behavior remains deterministic.
- [ ] Ensure GitHub full-tree truncation fallback remains covered.
- [ ] Add a nested architecture fixture with root/nested AGENTS.md, config, agent implementation, workflow, and tool surface.

### AVGL-0201 — Compatibility contract

- [ ] Document retained v0.1 public exports.
- [ ] Define the v0.1 → v0.2 compatibility adapter boundary.
- [ ] Decide how analyzeRepository() exposes v0.2 while preserving legacy projections.
- [ ] Prevent silent CLI contract breaks.

## Gate P0

Migration starts only when current invariants have direct test coverage.

## DoD P0

- [ ] Baseline tests PASS.
- [ ] Architecture fixture committed.
- [ ] Compatibility expectations documented.
- [ ] No target-v0.2 semantic behavior hidden inside baseline work.

---

# PHASE 1 — IR v0.2 contract

## Purpose

Define the machine contract before renderer or extraction changes.

## Tickets

### AVGL-0210 — Core schema

Create schema/avgl-ir-v0.2.json with:

- [ ] avglVersion
- [ ] generatedAt
- [ ] sources
- [ ] analysis
- [ ] spaces
- [ ] objects
- [ ] identities
- [ ] boundaries
- [ ] relations
- [ ] flows
- [ ] states
- [ ] transformations
- [ ] derivations
- [ ] effectiveStates
- [ ] evidence
- [ ] vocabularies
- [ ] synthesis
- [ ] unknowns
- [ ] invariants

### AVGL-0211 — Stable IDs

Define deterministic IDs for:

- [ ] repository spaces;
- [ ] folder spaces;
- [ ] file objects;
- [ ] semantic identities;
- [ ] relations;
- [ ] evidence records;
- [ ] effective-state records.

IDs must not depend on renderer order.

### AVGL-0212 — Evidence records

Normalize evidence into reusable top-level records containing:

- [ ] source location;
- [ ] source kind;
- [ ] evidence state;
- [ ] confidence;
- [ ] extractor/detector;
- [ ] optional snippet;
- [ ] coverage limitations where relevant.

### AVGL-0213 — Relation schema

Every relation must define:

- [ ] id;
- [ ] type;
- [ ] from;
- [ ] to;
- [ ] direction semantics;
- [ ] evidence refs;
- [ ] evidence state;
- [ ] confidence;
- [ ] optional scope;
- [ ] optional precedence;
- [ ] optional vocabulary;
- [ ] optional effect class.

### AVGL-0214 — Vocabulary schema

Define separate vocabularies:

- [ ] filesystem;
- [ ] repository;
- [ ] agentic;
- [ ] context;
- [ ] workflow;
- [ ] data;
- [ ] runtime;
- [ ] governance;
- [ ] evidence.

WHO…DID must live under agentic/governance semantics rather than defining universal object type.

### AVGL-0215 — Semantic claims contract stabilization

Owner-adopted 2026-09-19 from a second dispositioned external input ([docs/AVGL_SEMANTIC_IR_STABILIZATION_INPUT_2026-09-19.md](./docs/AVGL_SEMANTIC_IR_STABILIZATION_INPUT_2026-09-19.md)). Prerequisite for AVGL-0277/AVGL-0287: the semantic claims layer must be a stable contract before context/role projections consume it. The semantic claims layer is the agentic-vocabulary claims contract feeding identities/evidence into the v0.2 IR — it is not the universal kernel and not a runtime/call/dependency graph.

Observed baseline (main @ f8ce7bf): resolver provenance (resolver, rule, reason, mode) already partially emitted by src/semantic-resolution.js including a `legacy.lexical.v0` fallback; confidence is numeric; 5 of 8 negative canonical fixtures and the synthesize pipeline expectation are red on main.

- [x] Every emitted semantic classification carries resolver provenance (resolver id incl. version, rule, mode SEMANTIC/LEXICAL_FALLBACK, reason), propagated consistently into the IR.
- [x] Every claim carries evidence refs (source path, line span where available, bounded excerpt, category implementation/configuration/documentation/test).
- [x] Confidence stays orthogonal to the canonical evidence states (EXPLICIT/INFERRED/OBSERVED/UNKNOWN, SoT §15); any confidence vocabulary is defined schema-first and must not duplicate or weaken evidence states.
- [x] Unknown stays unknown: absent evidence never becomes a false or negative claim.
- [x] Forbidden shortcuts asserted by negative tests: name matching, documentation inflation, permission inflation, receipt inflation.
- [x] Declared-only relations: no calls/dependency topology without a relation resolver (P4 evidence gates apply).
- [x] Class vocabulary changes require an explicit Source of Truth revision (§28); no parallel ADR process is introduced.
- [x] Contract lands as schema/JSON fields, not TypeScript artifacts.
- [x] Semantic-resolution subset of the currently red main suite is green: 5 red negative canonical fixtures, canonical negatives, documentation-alone, DID acceptance, synthesize pipeline expectation.
- [x] UI/icon renderers only consume the contract; they never derive meaning from filename, icon, color, position, or keywords alone (strengthens AVGL-0287).

Out of scope: the mobile-first layout test failure on main (separate defect, not semantic-resolution scope).

### AVGL-0216 — Typed observation signals, claim triples, and provenance chain

Owner-adopted 2026-09-19 from a third dispositioned external input ([docs/AVGL_STRUCTURE_OPTIMIZATION_INPUT_2026-09-19.md](./docs/AVGL_STRUCTURE_OPTIMIZATION_INPUT_2026-09-19.md)). Refines EXTRACT/CLASSIFY/BIND within the canonical pipeline — no parallel layer vocabulary and no second pipeline. A code signal is not truth; observations, claims, and projections stay distinct, reconstructible stages.

- [ ] Observation records expose typed signals (e.g. function-call, exception, import, config-key) in addition to the lexical line candidate; lexical candidates remain the fallback.
- [ ] Semantic claims carry subject/predicate/object framing, defined schema-first; claim triples must not duplicate or bypass typed relation records (P4).
- [ ] Evidence/provenance records bind the immutable source revision (repository, ref, commit where available), per the workspace revision-binding invariant.
- [ ] The resolution chain is reconstructible end to end: observation → semantic claim → IR node → projection, each step carrying resolver/rule provenance.
- [ ] Positive, negative, and provenance tests for each new signal type; unknowns preserved; no signal type creates semantics without a resolver rule.

## Gate P1

Schema review must prove:

~~~text
file != identity
containment != inheritance
relation != evidence
declared state != effective state
WHO…DID != universal kernel
~~~

## DoD P1

- [ ] Minimal fixture validates.
- [ ] Rich multi-identity fixture validates.
- [ ] Effective-state fixture validates.
- [ ] Invalid underspecified relation fixtures fail.
- [ ] v0.1 semantics fit without defining the universal kernel.

---

# PHASE 2 — Structural discovery and materialization

## Purpose

Unify the current repository inventory and semantic pipeline.

## Tickets

### AVGL-0220 — Repository space

- [ ] Materialize repository root as SPACE.
- [ ] Preserve source/ref metadata.
- [ ] Bind scan coverage to the repository space.

### AVGL-0221 — Folder spaces

- [ ] Materialize folders as nested spaces.
- [ ] Emit explicit contains relations.
- [ ] Preserve observable unsupported/inaccessible limitations.
- [ ] Never infer inheritance from nesting alone.

### AVGL-0222 — File objects

- [ ] Materialize scanned/eligible files as objects.
- [ ] Preserve path, size, source kind, source ref.
- [ ] Link files to containing spaces.
- [ ] Link evidence to file objects.

### AVGL-0223 — Inventory/IR convergence

Refactor:

~~~text
GitHub inventory → Web tree
scanner inventory → semantic IR
~~~

into:

~~~text
source inventory
      ↓
AVGL structural IR
      ↓
structure projection / tree
~~~

- [ ] Web tree derives from IR.
- [ ] Repository inventory endpoint becomes derived/compatible rather than a second model.
- [ ] Renderer does not maintain a second semantic tree.

### AVGL-0224 — Coverage semantics

- [ ] Mark unreadable, unsupported, oversized, skipped surfaces.
- [ ] Keep secret exclusions default-deny.
- [ ] Distinguish complete topology from complete semantic-content coverage.

## Gate P2

A nested fixture must reproduce repository/folder/file structure from IR without Web-specific reconstruction.

## DoD P2

- [ ] Root/folder/file objects exist in IR.
- [ ] contains relations are explicit.
- [ ] Web tree renders from IR.
- [ ] Full-tree fallback tests remain green.
- [ ] Secret surfaces remain unread.

---

# PHASE 3 — Multi-identity and vocabularies

## Purpose

Allow one artifact to participate in several semantic dimensions.

## Tickets

### AVGL-0230 — Identity records

Implement:

- [ ] stable object reference;
- [ ] vocabulary;
- [ ] type;
- [ ] scope;
- [ ] evidence refs;
- [ ] evidence state;
- [ ] confidence.

### AVGL-0231 — Filesystem/repository identities

Support deterministic identities such as:

- [ ] file;
- [ ] config;
- [ ] documentation;
- [ ] implementation;
- [ ] test;
- [ ] schema;
- [ ] CI/repository automation.

### AVGL-0232 — Context identities

Initial deterministic identities:

- [ ] instruction source;
- [ ] prompt source;
- [ ] memory/context source;
- [ ] policy/context contributor;
- [ ] resource/knowledge source.

### AVGL-0233 — Agentic vocabulary migration

Move current classification into typed identities/claims while preserving behavior:

- [ ] WHO;
- [ ] KNOW;
- [ ] THINK;
- [ ] CAN;
- [ ] MAY;
- [ ] ACT;
- [ ] DID.

Current evidence-strength gates for MAY/ACT/DID remain mandatory.

### AVGL-0234 — Deduplication

- [ ] One object may have many identities.
- [ ] Repeated evidence must not create duplicate identical identities.
- [ ] Evidence aggregates deterministically.

## Gate P3

One AGENTS.md fixture can carry multiple identities without creating disconnected duplicate file objects.

## DoD P3

- [ ] Multi-identity tests PASS.
- [ ] Existing Story semantics still render.
- [ ] Identity evidence is inspectable.
- [ ] Object ID stays stable across vocabulary projections.

---

# PHASE 4 — Evidence-bound typed relations

## Purpose

Populate the relation layer without creating an assumption graph.

## Tickets

### AVGL-0240 — Relation registry

For each relation define:

- [ ] category;
- [ ] directionality;
- [ ] transitivity policy;
- [ ] allowed endpoints;
- [ ] evidence requirement;
- [ ] default projection behavior.

Initial types:

~~~text
contains
belongs_to
defines
references
imports
depends_on
reads
writes
calls
applies_to
inherits
overrides
shadows
extends
derives
resolves_to
contributes_to
composes_with
instantiates
invokes
executes_as
dispatches_to
affects
propagates_to
mutates
produces
verifies
implements
provides
consumes
guards
authorizes
~~~

- [ ] Registry entries for implements/provides/consumes/guards/authorizes (owner-adopted 2026-09-19, third dispositioned input) define semantics, directionality, and evidence requirements before any emission.

### AVGL-0241 — Deterministic extraction

Start only with high-confidence relations:

- [ ] containment from repository tree;
- [ ] supported direct JS/TS import/reference relations;
- [ ] exact manifest/config references;
- [ ] explicit workflow/config links where an adapter proves both endpoints.

### AVGL-0242 — Relation evidence gate

- [ ] Every non-derived relation has evidence.
- [ ] Same-file co-occurrence never creates a relation.
- [ ] Ambiguous target resolution remains UNKNOWN/unresolved.
- [ ] Confidence never upgrades evidence state.

### AVGL-0243 — Traversal API

Provide:

- [ ] outgoing;
- [ ] incoming;
- [ ] filter by type/family;
- [ ] bounded traversal;
- [ ] cycle-safe traversal.

## Gate P4

Fixtures distinguish containment, dependency, and scope/inheritance as different semantics.

## DoD P4

- [ ] relations is no longer an untyped placeholder.
- [ ] Relation schema tests PASS.
- [ ] False-relation fixture emits no unsupported edge.
- [ ] Traversal is deterministic.

---

# PHASE 5 — Scope, inheritance, override, precedence

## Purpose

Implement the first material form of STRUCTURE = EFFECT.

## Support boundary

Start with explicit deterministic scope rules. Do not claim universal inheritance across arbitrary files.

Recommended first adapter:

~~~text
AGENTS.md-style hierarchical instruction scope
~~~

plus one controlled configuration-inheritance fixture.

## Tickets

### AVGL-0250 — Scope model

Represent:

- [ ] exact object scope;
- [ ] folder/subtree scope;
- [ ] repository scope;
- [ ] explicit target scope;
- [ ] unresolved scope;
- [ ] structural, semantic (taxonomy), and context (scope) inheritance distinguished explicitly and never merged into one edge type (owner-adopted 2026-09-19, third dispositioned input).

### AVGL-0251 — Inheritance adapter

- [ ] Detect supported inherited instruction source.
- [ ] Emit applies_to / inherits with evidence.
- [ ] Never infer inheritance from filename similarity alone.
- [ ] Record the adapter/rule responsible.

### AVGL-0252 — Override/shadow

- [ ] Define precedence rules for the supported adapter.
- [ ] Emit overrides or shadows explicitly.
- [ ] Keep all declared sources visible.
- [ ] Keep lower-precedence sources in provenance.

### AVGL-0253 — Conflict handling

- [ ] Deterministic tie behavior where specified.
- [ ] Explicit conflict/UNKNOWN where precedence is undefined.
- [ ] Cycle detection.
- [ ] No silent winner selection under ambiguity.

## Gate P5

Fixture:

~~~text
/AGENTS.md
/apps/AGENTS.md
/apps/booking/agent.*
~~~

must show root scope, nested scope, explicit precedence, and preserved provenance.

## DoD P5

- [ ] Inheritance chain is navigable.
- [ ] Override chain is inspectable.
- [ ] Ambiguous inheritance fails closed.
- [ ] Containment-only fixture emits no inheritance.

---

# PHASE 6 — Derivation, effective state, propagation

## Purpose

Turn supported structural relations into explainable effective state.

## Tickets

### AVGL-0260 — Declared vs effective

Implement:

~~~text
DECLARED
→ inherited
→ overridden
→ composed
→ RESOLVED / EFFECTIVE
~~~

- [ ] Effective-state record references all contributors.
- [ ] Resolution method/version recorded.
- [ ] Unsupported fields remain UNKNOWN.

### AVGL-0261 — Provenance resolver

Given an effective property, return:

- [ ] direct source;
- [ ] inherited contributors;
- [ ] overridden contributors;
- [ ] deterministic winner where defined;
- [ ] evidence refs.

### AVGL-0262 — Propagation resolver

Given a source object/identity, return bounded downstream impact:

- [ ] direct affected objects;
- [ ] derived/effective states;
- [ ] supported downstream relation paths;
- [ ] cycle-safe traversal;
- [ ] path explanation.

### AVGL-0263 — Impact synthesis

Summaries must be computed only from traversable relations.

No impact may be generated from keyword proximity.

## Gate P6

IR alone can answer:

~~~text
Where did this effective instruction come from?
What can changing this source affect?
~~~

## DoD P6

- [ ] Provenance deterministic.
- [ ] Propagation deterministic.
- [ ] Effective != declared.
- [ ] Impact summaries match relation paths.
- [ ] Unknown propagation stays UNKNOWN.

---

# PHASE 7 — Lens and projection framework

## Purpose

Replace hard-coded view semantics with explicit projections over one model.

## Tickets

### AVGL-0270 — Lens contract

A lens can:

- [ ] select relevant object/identity/relation families;
- [ ] emphasize/collapse detail;
- [ ] retain stable object refs;
- [ ] expose evidence;
- [ ] declare required IR features.

### AVGL-0271 — Structure lens

Show:

- [ ] spaces/boundaries;
- [ ] containment;
- [ ] useful identity granularity;
- [ ] coverage limitations.

### AVGL-0272 — Evidence lens

Migrate current Inspect behavior:

- [ ] object → assertion → evidence;
- [ ] relation → evidence;
- [ ] effective state → contributor evidence.

### AVGL-0273 — Agentic/Narrative lens

Preserve WHO…DID as a vocabulary projection.

- [ ] Seven-class story remains available.
- [ ] It is explicitly not the universal kernel.
- [ ] CAN != MAY remains explicit.

### AVGL-0274 — Inheritance lens

Show:

- [ ] scope;
- [ ] inherited source;
- [ ] override;
- [ ] shadowed source;
- [ ] effective destination.

### AVGL-0275 — Propagation lens

Show:

- [ ] selected source;
- [ ] supported downstream paths;
- [ ] impact groups;
- [ ] evidence access.

### AVGL-0276 — Effective-State lens

Show:

- [ ] effective properties/identities;
- [ ] contributors;
- [ ] precedence;
- [ ] unresolved/conflict markers.

### AVGL-0277 — Context lens

Owner-adopted 2026-09-19 from dispositioned external input ([docs/AVGL_CONTEXTUAL_UNDERSTANDING_INPUT_2026-09-19.md](./docs/AVGL_CONTEXTUAL_UNDERSTANDING_INPUT_2026-09-19.md)). Materializes the SoT §5.2 Context lens family. For one selected object, the lens answers: **which role does this artifact play in the overall system?**

The context projection is a deterministic projection over the existing IR. It introduces no new resolver pipeline stage, no new file family, and no semantics absent from the IR.

- [ ] Role framing derived only from evidenced identities (vocabulary roles, including agentic WHO…DID where evidenced), shown as primary/related.
- [ ] Evidenced typed relations grouped by direction (e.g. reads/consumes inbound, produces/affects outbound); existing relation grammar only.
- [ ] Containing spaces shown as structural parents (containment only, never inheritance).
- [ ] Component/domain framing only when derivable from evidenced identities/relations.
- [ ] Evidence refs exposed for every asserted role, relation, and parent.
- [ ] Unknown roles/relations remain explicitly UNKNOWN; no adjacency- or filename-based framing.
- [ ] Stable object refs retained per the AVGL-0270 lens contract.
- [ ] Context envelope fields (who / where / why / depends_on / constrained_by / effects / evidence) render only from evidenced identities/relations; purpose ("why") stays UNKNOWN without evidence (owner-adopted 2026-09-19, third dispositioned input).

## Gate P7

Switching lenses must retain the same underlying selected object and must not create semantic duplication.

## DoD P7

- [ ] All required lenses derive from one IR.
- [ ] Story/Inspect survive as compatible projections.
- [ ] System view is reframed as Agentic/Governance where appropriate.
- [ ] No lens stores independent semantic truth.

---

# PHASE 8 — Spatial projection and navigation UI

## Purpose

Make SEE = UNDERSTAND = NAVIGATE true in the product.

## UX rule

Do not default to a force-directed graph.

Prefer:

- containment;
- zones;
- nested spaces;
- paths;
- bands;
- aligned causal/source directions;
- progressive disclosure;
- local relation diagrams only where useful.

## Tickets

### AVGL-0280 — Structural canvas

Represent:

- [ ] repository/folder spaces;
- [ ] object placement;
- [ ] meaningful boundaries;
- [ ] selected relation paths;
- [ ] identities without visual overload.

### AVGL-0281 — Navigation state

Maintain:

- [ ] selected object;
- [ ] selected identity;
- [ ] current lens;
- [ ] navigation path/breadcrumb;
- [ ] relation direction;
- [ ] evidence return point.

### AVGL-0282 — Follow relation

- [ ] forward;
- [ ] backward;
- [ ] preserve provenance trail;
- [ ] reveal relation type;
- [ ] reveal evidence.

### AVGL-0283 — Provenance action

One action answers:

> Where did this come from?

### AVGL-0284 — Propagation action

One action answers:

> What does this affect?

### AVGL-0285 — Effective-state action

One action answers:

> Why is this effective here?

### AVGL-0286 — Progressive disclosure

- [ ] Avoid raw edge explosion.
- [ ] Summarize groups.
- [ ] Expand locally.
- [ ] Preserve readable labels.
- [ ] Reveal exact technical evidence on demand.

### AVGL-0287 — Context role card and icon grammar

Owner-adopted 2026-09-19 from dispositioned external input ([docs/AVGL_CONTEXTUAL_UNDERSTANDING_INPUT_2026-09-19.md](./docs/AVGL_CONTEXTUAL_UNDERSTANDING_INPUT_2026-09-19.md)).

- [ ] Object card renders the AVGL-0277 context-lens framing: role, evidenced relations by direction, structural parents, evidence reference count.
- [ ] Relations on the card are navigable per AVGL-0282; evidence stays one step away per AVGL-0286.
- [ ] Icon/glyph families (actor, structure, cognition, capability, authority, effective, evidence) are renderer-level visual syntax only.
- [ ] Icon choice never encodes semantics absent from the IR (SoT §20/§21).
- [ ] Card remains usable in narrow/mobile layouts (AVGL-0280 boundary applies).
- [ ] Confidence model (owner-adopted 2026-09-19, fourth dispositioned input): every rendered role, relation, and effect carries its canonical evidence state — EXPLICIT / INFERRED / OBSERVED / UNKNOWN (SoT §15) — rendered as an evidence state, never as a numeric score or model self-confidence; interpretive INFERRED claims remain visually distinguishable from deterministic facts (SoT §24).
- [ ] Deterministically derived content (effective state, propagation impact) renders with its derivation/provenance chain (AVGL-0261/0263) instead of a separate confidence value. Owner-final (third message, 2026-09-19): DERIVED is a derivation mechanism, not an evidence state — evidence state and derivation (resolver/method/sources, per the AVGL-0215 provenance contract) remain separate fields; no SoT §28 revision.
- [ ] Claims without sufficient evidence render as UNKNOWN rather than being asserted with a confidence value (unknown stays unknown; AVGL-0215 contract applies).

## Gate P8

A user can navigate:

~~~text
physical location
→ semantic identities
→ inherited/overriding sources
→ effective state
→ downstream impact
→ source evidence
~~~

without switching to an unrelated model.

## DoD P8

- [ ] Core navigation works by click/tap.
- [ ] Selected object survives lens switches.
- [ ] No graph hairball is the default.
- [ ] Evidence remains one navigation step away.
- [ ] Narrow/mobile layouts remain usable.

---

# PHASE 9 — API, CLI, and compatibility migration

## Purpose

Expose v0.2 consistently.

## Tickets

### AVGL-0290 — Analyzer output

- [ ] analyzeRepository exposes explicit v0.2 IR.
- [ ] GitHub analyzer returns same contract.
- [ ] Legacy projection adapter exists where needed.

### AVGL-0291 — CLI

Provide/adjust:

- [ ] json → v0.2 IR;
- [ ] story → Agentic lens;
- [ ] structure;
- [ ] evidence;
- [ ] optional inheritance/effective formats.

### AVGL-0292 — API

- [ ] /api/analyze returns versioned IR.
- [ ] repository/file endpoints derive from the same model where practical.
- [ ] chat consumes v0.2 context but never becomes structural truth.

### AVGL-0293 — Documentation

- [ ] README reflects universal kernel.
- [ ] v0.1 concept doc is clearly historical/baseline where needed.
- [ ] Source of Truth remains canonical.
- [ ] Schema docs include examples.

## Gate P9

CLI, local analyzer, GitHub analyzer, API, and Web agree on object IDs and relation semantics for the same source/ref.

## DoD P9

- [ ] Compatibility tests PASS.
- [ ] No public surface calls WHO…DID the universal AVGL kernel.
- [ ] Public docs match behavior.

---

# PHASE 10 — Verification and architecture acceptance

## Acceptance scenario A — Multi-identity

Given one instruction artifact:

- [ ] file identity visible;
- [ ] instruction-source identity visible;
- [ ] scope identity visible;
- [ ] agentic identity only where evidenced;
- [ ] all resolve to one underlying object.

## Scenario B — Inheritance and override

Given root + nested instruction sources:

- [ ] containment shown;
- [ ] inheritance shown separately;
- [ ] override shown separately;
- [ ] effective state computed;
- [ ] provenance includes all contributors.

## Scenario C — False relation resistance

Given unrelated semantic hits in one file:

- [ ] no unsupported call/dependency/inheritance relation emitted.

## Scenario D — Evidence downgrade resistance

Given documentation-only authority/effect claims:

- [ ] MAY/ACT/DID stay UNKNOWN where stronger evidence is required.

## Scenario E — Propagation

Given a supported scoped source:

- [ ] downstream impact derives from relations;
- [ ] unrelated files do not expand the impact set.

## Scenario F — Lens coherence

For one selected object, Structure, Agentic, Evidence, Inheritance, Propagation, and Effective-State lenses all reference the same object ID.

## Scenario G — Coverage limitation

Given a failed content fetch:

- [ ] scan is incomplete;
- [ ] unseen semantics remain UNKNOWN;
- [ ] structural vs content coverage stay distinguishable.

## Final architecture acceptance

All must answer yes:

- [ ] Can AVGL represent location without pretending location is effect?
- [ ] Can it represent effect without reducing effect to a generic edge?
- [ ] Can one artifact possess several identities without duplication?
- [ ] Can inheritance and override be inspected independently?
- [ ] Can effective state be explained from contributors?
- [ ] Can every structural assertion be traced to bounded evidence?
- [ ] Can users navigate structure and effect from one model?
- [ ] Does the UI avoid making a graph the default mental model?
- [ ] Does WHO…DID remain useful without defining the universal kernel?
- [ ] Is time still cleanly deferred?

## DoD P10 / Release Gate

- [ ] Gates P0–P9 PASS.
- [ ] Scenarios A–G PASS.
- [ ] npm test PASS.
- [ ] npm run check PASS.
- [ ] No open P0/P1 architecture defects.
- [ ] Source of Truth and implementation are consistent.
- [ ] Deferred work is recorded explicitly.

---

## 4. Required execution order

~~~text
P0 baseline
 ↓
P1 IR contract
 ↓
P2 structural materialization
 ↓
P3 multi-identity
 ↓
P4 typed relations
 ↓
P5 scope/inheritance/override
 ↓
P6 effective state/propagation
 ↓
P7 lenses
 ↓
P8 navigation UI
 ↓
P9 compatibility
 ↓
P10 acceptance
~~~

Do not build the new visual layer before P1–P6 are structurally sound. Otherwise the UI will encode semantics the IR cannot prove or serialize.

---

## 5. Test strategy

Every new semantic capability requires:

### Positive test

A supported source produces the expected object/identity/relation/state.

### Negative test

A superficially similar unsupported source does not produce the semantic claim.

### Provenance test

The claim points to correct evidence and can be traced projection → IR → source.

Also require:

- [ ] schema validation;
- [ ] stable ID determinism;
- [ ] cycle handling;
- [ ] partial coverage;
- [ ] conflicting precedence;
- [ ] cross-lens identity consistency;
- [ ] v0.1 Story compatibility;
- [ ] structured eval records for canonical fixtures (expected/actual/result/reason per resolution), so semantic resolution quality is measurable over time (owner-adopted 2026-09-19, third dispositioned input).

---

## 6. Change discipline

For every implementation ticket:

- [ ] identify Source of Truth clauses affected;
- [ ] define deterministic evidence requirement;
- [ ] add positive test;
- [ ] add negative test;
- [ ] add provenance test;
- [ ] preserve UNKNOWN;
- [ ] update schema before emitting a new shape;
- [ ] update docs when public contract changes;
- [ ] run npm test;
- [ ] run npm run check.

A ticket is not complete merely because a renderer displays the desired result.

---

## 7. Deferred roadmap

### Temporal AVGL

~~~text
TIME = FIRST-CLASS PRIMITIVE
~~~

Later dimensions may include:

- execution history;
- system revision/evolution;
- state transitions;
- temporal provenance;
- replay/compare.

### Bidirectional AVGL

~~~text
SYSTEM ⇄ AVGL
~~~

Later capabilities:

- simulate;
- propose;
- patch planning;
- controlled apply.

### AVGL as source of truth

Later capabilities:

- authoritative serializable definitions;
- generation/reconciliation;
- policy-governed mutation;
- implementation drift detection.

### AVGL-0297 — Jev Classification Adapter (deferred design phase)

**Motivation.** Let an external model (Jev, provider `typesafe`, model `jev-1.13`) propose candidate semantic labels from already-extracted repository signals, strictly as classification assistance. This is the sanctioned AGENTS.md rule-7 augmentation of the deterministic baseline ("LLM-assisted classification may augment the analyzer later, but it must not replace inspectable deterministic evidence") and the SoT §24 LLM-assist boundary.

**Architectural placement.** Between deterministic extraction and semantic resolution — an optional assist adapter inside the frozen `CLASSIFY`/`RELATE` stages (no new pipeline stage name, SoT §18). Chain: signals → Jev → candidate labels → deterministic AVGL validation → evidence-backed representation; candidates assist `KNOW`/`THINK` semantics only and remain subject to the AVGL-0296 projection contract on the way out to agents.

**Non-goals.** No authority decisions, no permission evaluation, no MAY/CAN/ACT/DID resolution, no projection/visibility decisions, no truth generation, no autonomous semantic mutation. Invariants: Model Output ≠ Evidence, Classification ≠ Resolution, Prediction ≠ Authority, Visibility ≠ Capability, Agent Output ≠ DID, Engine Execution ≠ Authority, Classification Assistance ≠ Semantic Authority. Jev output never becomes system truth.

**Implementation status.** DESIGN PHASE — non-canonical design input recorded ([docs/AVGL_0297_JEV_CLASSIFICATION_ADAPTER_DESIGN_INPUT.md](./docs/AVGL_0297_JEV_CLASSIFICATION_ADAPTER_DESIGN_INPUT.md)): purpose, architecture position, input/output contracts (signals-only in; candidate classification + `INFERRED` provenance out), evidence boundary, failure handling (fail closed; Jev optional), validation layer, negative fixtures 1–4, activation criteria. No `schema/`, no `src/`, no `test/` material exists. Adapter implementation (proposed `src/semantic/jev-adapter.js` → deterministic validation layer → negative fixtures) starts only after the owner's design-approval + activation decision.

**Validation results.** Design phase: not yet applicable (no runtime artifact). Baseline at recording: `npm run check` exit 0; `npm test` 84 tests / 83 pass / 1 pre-existing failure (mobile-first layout contracts). Implementation-phase acceptance: provenance enforced on every Jev result, negative fixtures 1–4 pass, CAN/MAY/ACT/DID isolation verified, check + tests pass with recorded total/added/failure counts, and the implementation creates no truth.

None of these may compromise the architecture-first evidence-bound core built by this plan.
