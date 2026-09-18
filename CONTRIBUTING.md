# Contributing to AVGL

Thank you for considering a contribution to **AVGL — Agent Visual Grammar Language**.

AVGL is not intended to become another graph-heavy repository explorer, LLM-generated wiki, or opaque AI architecture summarizer. The project is building a machine-readable visual grammar for making complex agentic systems **visible, understandable, and navigable while preserving evidence, uncertainty, scope, and effect**.

This document explains how to contribute without weakening those properties.

---

## 1. Start here

Before changing code, read these files in this order:

1. [AVGL_SOURCE_OF_TRUTH.md](./AVGL_SOURCE_OF_TRUTH.md) — normative product and architecture definition.
2. [AVGL_IMPLEMENTATION_WORKING_PLAN.md](./AVGL_IMPLEMENTATION_WORKING_PLAN.md) — current architecture-first implementation path.
3. [AGENTS.md](./AGENTS.md) — repository invariants and implementation rules.
4. [README.md](./README.md) — current product and repository overview.

If implementation details, older documentation, comments, or this guide conflict with the Source of Truth, **the Source of Truth wins**.

Do not change a frozen architecture decision incidentally inside an implementation PR. Propose the architecture change explicitly first.

---

## 2. What AVGL is trying to become

The long-term direction is:

~~~text
SOURCE SYSTEMS
    ↓
DISCOVER
    ↓
EXTRACT
    ↓
CLASSIFY
    ↓
BIND
    ↓
RELATE
    ↓
RESOLVE
    ↓
SYNTHESIZE
    ↓
PROJECT
    ↓
SEE = UNDERSTAND = NAVIGATE
~~~

The universal architecture is moving toward:

~~~text
OBJECT
SPACE
BOUNDARY
RELATION
FLOW
STATE
TRANSFORMATION
IDENTITY
~~~

with typed vocabularies for:

- filesystem / repository;
- agentic systems;
- context and memory;
- workflows;
- data;
- runtime;
- governance;
- evidence.

The current:

~~~text
WHO → KNOW → THINK → CAN → MAY → ACT → DID
~~~

model remains important, but it is an **Agentic / Governance vocabulary and projection**, not the universal AVGL kernel.

Longer term, AVGL may evolve from:

~~~text
SYSTEM → AVGL
~~~

to:

~~~text
SYSTEM ⇄ AVGL
~~~

and eventually support AVGL as an authoritative, serializable source of truth.

Contributions should make that evolution easier, not encode current UI or scanner assumptions permanently into the model.

---

## 3. Core principles every contribution must preserve

These are not style preferences. They are architectural constraints.

### Evidence before interpretation

Every asserted semantic or structural fact must either:

- be traceable to bounded evidence;
- be deterministically derived from evidence-bound facts; or
- remain explicitly unknown.

### Unknown stays unknown

Absence of evidence is not evidence of a nearby concept.

Do not infer a relation, permission, runtime outcome, or effective state because it would make the visualization look more complete.

### Structure = effect

AVGL is not satisfied by locating files and drawing connections.

The architecture must be able to distinguish questions such as:

- Where is this object?
- What scope does it belong to?
- What does it inherit?
- What overrides it?
- What does it contribute to?
- What can it affect?
- Why is this state effective here?

### One IR, many lenses

A renderer, lens, assistant, or UI state must not become a second semantic source of truth.

Views should project the same underlying AVGL model.

### Deterministic baseline first

LLMs may assist AVGL, but they do not get to silently define architecture.

Deterministic extraction, bounded evidence, explicit derivation, and inspectability remain the baseline.

### Human comprehension over graph density

A graph can be useful locally.

A generic node-edge graph is not the product model.

AVGL should favor:

- spaces;
- boundaries;
- containment;
- paths;
- layers;
- lenses;
- progressive disclosure;
- navigable provenance and propagation.

### Privacy and authority fail closed

Private-source, authority, and execution claims require stronger guarantees, not looser heuristics.

---

## 4. Non-negotiable semantic invariants

The following distinctions must remain explicit:

~~~text
HARNESS != AUTHORITY
CONTEXT != PERMISSION
CAN != MAY
PROPOSAL != EXECUTION
ACT != DID
RECEIPT != VERIFICATION

LOCATION != EFFECT
CONTAINMENT != INHERITANCE
REFERENCE != DEPENDENCY
DEPENDENCY != EXECUTION
DECLARED != EFFECTIVE
INHERITED != OVERRIDDEN
RELATION != ASSUMPTION
PROJECTION != SOURCE OF TRUTH
~~~

A contribution that collapses one of these distinctions needs a very strong architecture-level justification and explicit maintainer agreement before implementation.

---

## 5. Good ways to contribute

AVGL has useful contribution surfaces at several levels.

### Good first contributions

These are usually the lowest-risk ways to start:

- documentation corrections;
- clearer examples;
- accessibility improvements;
- UI copy improvements that preserve semantics;
- additional positive/negative test fixtures;
- regression tests for existing invariants;
- framework sample repositories;
- false-positive / false-negative detector cases;
- repository coverage edge cases;
- safe source-kind classification improvements;
- developer tooling that does not change semantic output.

A small PR with a strong negative test is often more valuable than a large feature with unclear semantics.

### Deterministic extractors and adapters

Useful contributions include adapters for explicit, inspectable structures such as:

- imports;
- manifests;
- workflow definitions;
- tool declarations;
- model/provider configuration;
- agent definitions;
- context/instruction surfaces;
- runtime manifests;
- supported framework metadata.

Framework-specific behavior should live behind an adapter and normalize into AVGL semantics.

Do not make framework vocabulary part of the universal kernel merely because one framework uses it.

### Evidence and classification

Contributions may improve:

- evidence-source classification;
- confidence handling;
- weak-evidence rejection;
- coverage accounting;
- detector precision;
- evidence references;
- explicit unknown behavior.

Effect-sensitive semantics require appropriately strong evidence.

Documentation text alone should not silently become proof of permission, execution, or verified outcome.

### Relations and lineage

Relation work is highly valuable, but every new relation type needs a contract.

A relation proposal should define:

- semantic meaning;
- direction;
- valid endpoint kinds;
- evidence requirement;
- whether it may be derived;
- derivation rule;
- confidence behavior;
- scope behavior;
- cycle behavior;
- transitivity, if any;
- how it appears in projections;
- at least one negative example.

Do not create a relation because two facts occur in the same file.

### Multi-identity

One source artifact may participate in several vocabularies.

For example:

~~~text
AGENTS.md
├─ filesystem:file
├─ context:instruction-source
├─ governance:policy-source
├─ scope:repository-default
└─ runtime:context-contributor
~~~

Prefer multiple identities attached to one stable object over duplicating the source object for each semantic role.

### Scope, inheritance, override, and effective state

This is a major architecture area.

Useful contributions include:

- deterministic scope adapters;
- explicit precedence rules;
- inheritance fixtures;
- override/shadow semantics;
- conflict detection;
- provenance resolution;
- effective-state explanation;
- propagation traversal.

Never infer inheritance merely from containment or filename similarity.

Ambiguous precedence must fail closed rather than silently selecting a winner.

### Lenses and navigation

AVGL is designed around:

~~~text
SYSTEM MODEL + LENS = PROJECTION
~~~

Useful lens work includes:

- Structure;
- Agentic;
- Evidence;
- Context;
- Dependency;
- Inheritance;
- Propagation;
- Effective State;
- Authority / Governance;
- later Runtime and Temporal lenses.

A lens must preserve stable underlying object identity.

Switching lenses must not manufacture new semantic facts.

### Product and visual design

Design contributions are welcome when they reinforce the grammar.

Useful areas include:

- spatial system projections;
- progressive disclosure;
- accessibility;
- information hierarchy;
- lens transitions;
- system navigation;
- provenance/effect traversal;
- iconography derived from AVGL primitives;
- responsive interaction.

Avoid visual conventions that imply unsupported semantics.

Layout is not evidence.

Proximity is not a relation.

Color must not be the only carrier of semantic meaning.

### Privacy, GitHub App, and private-source work

Private-source changes require extra care.

Current invariants include:

- GitHub App user and installation tokens remain server-side and short-lived;
- private-repository analysis fails closed when authority is absent or expired;
- private source/context is not sent to a remote model provider by default;
- LOCAL_PRIVATE transport IR must not contain raw source, snippet, content, or excerpt fields;
- do not claim cryptographic zero knowledge when plaintext source reaches cloud infrastructure.

Changes in this area should include explicit privacy regression tests.

### Cross-repository workspaces

Workspace contributions must preserve revision and derivation boundaries.

Current invariants:

- each repository is bound to an immutable revision;
- EXPLICIT, INFERRED, and DERIVED relations stay distinguishable;
- dependency does not prove invocation;
- reachability does not prove execution;
- derived effect chains expose derivation and uncertainty.

---

## 6. Contributions that should start as an issue or design proposal

Please do not begin a large implementation PR for these areas without first aligning on the design:

- changing the universal kernel;
- changing a frozen Source of Truth decision;
- introducing a new evidence state;
- changing the meaning of an existing relation;
- changing schema compatibility/versioning rules;
- introducing universal inheritance semantics;
- introducing first-class time;
- runtime-history or replay models;
- mutation / APPLY behavior;
- bidirectional AVGL editing;
- AVGL-as-source-of-truth generation;
- broad LLM-driven structural inference;
- private-source architecture changes;
- cryptographic privacy claims;
- new authority/permission semantics.

A good architecture proposal should answer:

~~~text
What problem is being solved?
What is the smallest semantic primitive required?
What evidence proves it?
What remains unknown?
How does it compose with the existing IR?
How is it rendered without becoming renderer truth?
How does it affect compatibility?
What is the negative case?
~~~

Prototype code is welcome when it helps evaluate a proposal, but mark it clearly as exploratory.

---

## 7. Contributions that are unlikely to be accepted

Examples:

- replacing AVGL with a force-directed graph;
- generic AI architecture diagrams inferred from README prose;
- using an LLM summary as authoritative topology;
- assigning MAY because CAN exists;
- assigning DID because ACT exists;
- claiming runtime execution from static dependency evidence;
- converting UNKNOWN into a guess for visual completeness;
- reading common credential/secret surfaces to increase scan coverage;
- sending private source to remote AI services without explicit architecture approval;
- hard-coding one framework's vocabulary into the universal kernel;
- storing semantic truth only in UI layout;
- large refactors with no invariant or regression tests;
- adding relation types without defined evidence semantics.

---

## 8. Local development

### Requirements

- Node.js 20 or newer.

The package is intentionally dependency-light.

### Setup

~~~bash
git clone <your-fork-or-repository-url>
cd AVGL
npm install
~~~

### Run the validation suite

~~~bash
npm run check
npm test
~~~

Both must pass before a PR is ready for review.

### Try the CLI

~~~bash
node ./bin/avgl.js analyze .
node ./bin/avgl.js analyze ../some-agent --format card
node ./bin/avgl.js analyze ../some-agent --format json
~~~

Do not put real secrets into fixtures.

---

## 9. Repository map

Current major surfaces include:

~~~text
src/        compiler, discovery, classification, relations, synthesis
schema/     AVGL IR and workspace machine contracts
api/        Vercel/server-side API and GitHub App surfaces
web/        human-facing projections and interaction
bin/        CLI
test/       invariant and regression tests
docs/       supporting concept documentation
examples/   example material
~~~

Before changing a public shape, inspect both its producer and every consumer.

Schema, compiler, API, CLI, Web, and tests should not drift into different definitions of the same concept.

---

## 10. Testing expectations

Every new semantic capability should normally include three tests.

### Positive test

A supported source produces the intended fact.

### Negative test

A similar but unsupported source does **not** produce the fact.

### Provenance test

The produced fact can be traced back to the correct bounded evidence or derivation path.

Depending on the feature, also consider:

- partial coverage;
- secret exclusion;
- stable IDs;
- cycle handling;
- conflicting precedence;
- private-source redaction;
- cross-repository revision binding;
- cross-lens identity consistency;
- compatibility with existing projections.

A test that only checks “something was found” is usually not sufficient for semantic work.

---

## 11. Evidence-strength rule

Confidence and evidence are different concepts.

High confidence does not upgrade weak evidence into stronger evidence.

For example:

~~~text
documentation says "this agent can deploy"
~~~

does not automatically prove:

~~~text
MAY deploy
ACT deployed
DID verify deployment
~~~

When adding a detector, adapter, or derivation, document why its evidence is strong enough for the semantic claim it emits.

---

## 12. IR and schema changes

Treat schemas as contracts, not implementation leftovers.

When changing an IR shape:

1. define the semantic need first;
2. update or introduce the schema;
3. define compatibility behavior;
4. update producers;
5. update consumers;
6. add schema/behavior fixtures;
7. document migration if externally visible.

Do not overload an existing field with a second meaning to avoid a version change.

Stable IDs must not depend on renderer order.

---

## 13. LLM-assisted contributions

LLM-assisted development is welcome.

LLM-generated semantic truth is not.

If using an LLM to help implement AVGL:

- verify generated code;
- add deterministic tests;
- do not paste secrets into model prompts;
- do not assume generated detector rules are semantically valid;
- review regexes and extraction rules for false positives;
- preserve provenance;
- distinguish hypothesis from evidence.

Inside the product, an LLM may later help with:

- naming;
- summarization;
- question answering;
- suggested lenses;
- optional classification;
- change intent.

It must not silently invent:

- objects;
- relations;
- inheritance;
- authority;
- execution;
- effective state;
- observed outcomes.

---

## 14. Branches and commits

Prefer a focused branch per contribution.

Suggested branch names:

~~~text
feat/<short-topic>
fix/<short-topic>
docs/<short-topic>
test/<short-topic>
design/<short-topic>
refactor/<short-topic>
~~~

The repository commonly uses concise Conventional-Commit-style subjects:

~~~text
feat: add ...
fix: harden ...
docs: document ...
test: cover ...
ui: align ...
design: refine ...
~~~

Atomic commits are preferred when they make the review sequence easier to understand.

Do not split one semantic change into arbitrary commits merely to increase commit count.

---

## 15. Pull request expectations

Keep PRs reviewable.

A good PR description should include:

### What changed?

Describe the concrete implementation.

### Why?

Connect the change to a user problem, invariant, roadmap ticket, or architecture requirement.

### Evidence model

For semantic work, explain what evidence proves the new claim.

### What stays unknown?

State the boundary explicitly.

### Validation

Include the exact checks run:

~~~text
npm run check  PASS
npm test       PASS
~~~

### Compatibility

Call out changes to:

- schemas;
- exported module surfaces;
- API responses;
- CLI output;
- UI semantics;
- privacy behavior.

### Screenshots

For UI/design changes, include before/after images where useful.

A visual improvement is not complete if it introduces unsupported semantic claims.

---

## 16. Pull request checklist

Before requesting review:

- [ ] I read the Source of Truth relevant to this change.
- [ ] The change does not silently alter a frozen architecture decision.
- [ ] New semantic claims have defined evidence requirements.
- [ ] UNKNOWN remains explicit where evidence is insufficient.
- [ ] I did not collapse CAN/MAY, ACT/DID, containment/inheritance, or dependency/execution.
- [ ] New relations define their semantics and derivation.
- [ ] Renderer/UI state is not the only location of semantic truth.
- [ ] Secret-surface exclusions remain intact.
- [ ] Private-source behavior remains fail closed where applicable.
- [ ] Positive tests exist where relevant.
- [ ] Negative tests exist where relevant.
- [ ] Provenance is tested where relevant.
- [ ] npm run check passes.
- [ ] npm test passes.
- [ ] Public contracts/docs were updated if needed.

---

## 17. Review philosophy

Review is not only about whether code works.

AVGL changes are evaluated against:

1. semantic correctness;
2. evidence quality;
3. false-positive resistance;
4. explicit uncertainty;
5. IR coherence;
6. human comprehensibility;
7. privacy/security boundaries;
8. compatibility;
9. long-term composability.

A smaller implementation that proves less but proves it well is preferable to a broader implementation that blurs evidence boundaries.

---

## 18. Roadmap alignment

The active architecture-first implementation is staged roughly as:

~~~text
baseline / guardrails
        ↓
IR contract
        ↓
structural materialization
        ↓
multi-identity
        ↓
typed relations
        ↓
scope / inheritance / override
        ↓
effective state / propagation
        ↓
lenses
        ↓
spatial navigation
        ↓
API / CLI compatibility
        ↓
architecture acceptance
~~~

See [AVGL_IMPLEMENTATION_WORKING_PLAN.md](./AVGL_IMPLEMENTATION_WORKING_PLAN.md) for the detailed current plan.

Later directions include:

- first-class temporal AVGL;
- runtime history and state transitions;
- simulation;
- proposed changes;
- controlled APPLY;
- bidirectional representations;
- AVGL as an authoritative system definition.

Please avoid implementing a later stage by bypassing the semantic foundation it depends on.

---

## 19. Documentation contributions

Documentation is part of the architecture surface.

Useful contributions include:

- clearer semantic examples;
- adapter authoring guides;
- schema examples;
- evidence-model explanations;
- lens specifications;
- negative examples;
- tutorials using real open repositories;
- diagrams that clarify rather than replace the IR.

Avoid documentation that presents planned behavior as already implemented.

Mark future architecture clearly as proposed, planned, or deferred.

---

## 20. Design and iconography contributions

AVGL's design language should reinforce the same model as the compiler.

Current visual direction favors:

~~~text
one model → many lenses
structure = effect
technical systems notation
spatial hierarchy
progressive disclosure
~~~

Design contributions should prefer composable visual primitives over unrelated pictograms.

Useful semantic families include:

- Object;
- Space;
- Boundary;
- Relation;
- Flow;
- State;
- Transformation;
- Identity;
- Evidence;
- Inheritance;
- Propagation;
- Effective State.

Do not use decoration to imply a semantic distinction that the underlying IR does not contain.

---

## 21. Security reports

Do not open a public issue containing:

- credentials;
- private repository source;
- authentication tokens;
- exploitable private-source details;
- sensitive deployment configuration.

Until a dedicated security reporting policy is published, contact the repository maintainer privately for sensitive reports.

Non-sensitive hardening improvements can use normal pull requests.

---

## 22. Licensing and contribution status

At the time this guide was written:

- the repository is private;
- the package metadata declares **UNLICENSED**;
- no public open-source license is currently granted by the repository metadata.

Do not assume an open-source license that is not present.

Before AVGL opens to broad public contribution, the project should publish an explicit LICENSE and decide whether it needs a DCO, CLA, or another contribution-terms mechanism.

If you are an invited collaborator, only submit material you have the right to contribute.

---

## 23. A useful rule of thumb

When uncertain, ask:

> **Can AVGL explain why it believes this?**

If the answer is no, the feature probably needs a stronger evidence, derivation, or unknown-state model before it needs more UI.

And when designing a projection, ask:

> **Can the user follow this from structure to effect and back to evidence?**

If yes, the contribution is likely moving AVGL in the right direction.
