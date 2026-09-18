# AVGL v0.3 — Relation, Lineage, Effect and Private-Source Run

Status: IMPLEMENTATION_STARTED

## Goal

Move AVGL from evidence lists to an evidence-bound relation and effect model while preserving the human-first projections.

The runtime pipeline becomes:

```
DISCOVER
  ↓
EXTRACT
  ↓
CLASSIFY
  ↓
BIND
  ↓
RESOLVE RELATIONS
  ↓
TRACE EFFECTS
  ↓
SYNTHESIZE
  ↓
PROJECT
```

## Phase 1 — Relation kernel

Scope:
- source symbols
- imports / exports
- file references
- calls
- code inheritance
- forward and reverse file relations
- relation basis: EXPLICIT / INFERRED / DERIVED

Initial relation vocabulary:
- CONTAINS
- IMPORTS / IMPORTED_BY
- IMPORTS_MODULE
- EXPORTS
- REFERENCES / REFERENCED_BY
- CALLS
- EXTENDS
- LOCAL_MUTATION
- EMITS_EFFECT

DoD:
- relation records retain file:line evidence
- reverse edges are marked DERIVED
- inheritance is typed as CODE_INHERITANCE
- no semantic similarity is presented as inheritance

## Phase 2 — Effect tracing

Scope:
- distinguish local in-memory mutation from external effect
- create bounded effect chains
- classify explicit external effect families:
  - network requests
  - filesystem writes
  - command execution
  - Git/repository mutation
  - message sending
  - deployment
  - database mutation

DoD:
- `array.push(...)` is LOCAL_MUTATION and not ACT
- `gitClient.push(...)` can become an ACT candidate
- CALL is EXPLICIT
- effect classification is INFERRED
- ACT reachability is DERIVED until stronger runtime evidence exists

## Phase 3 — Human projection

File detail:
1. WHAT IS THIS?
2. HOW IS IT CONNECTED?
3. WHAT DOES IT AFFECT?

DoD:
- related files are navigable
- relation basis is visible
- local mutation and external effect are visibly different
- evidence path/line remains available

## Phase 4 — Private GitHub repositories

Architecture:
- GitHub App, not broad legacy OAuth scopes
- User authorization + installation
- repository selection at GitHub
- short-lived installation token
- Contents: read
- Metadata: read
- Pull requests / Issues read only when a feature explicitly needs them
- no write/admin/actions/secrets permissions
- no raw repository persistence by default
- repository content excluded from application logs

DoD:
- private repository can be analyzed only after explicit installation authorization
- token is short-lived and server-side
- repo access is least-privilege
- authorization failure is fail-closed

Important:
This is zero-retention / least-privilege processing, not cryptographic zero knowledge.

## Phase 5 — Local Private mode

For the stronger property "private source never reaches AVGL cloud":

```
GitHub/private source
      ↓
Local AVGL worker
      ↓
Full scan + relations + effect tracing
      ↓
AVGL IR only
      ↓
AVGL Web
```

DoD:
- raw source stays local
- local/self-hosted inference may be used
- cloud UI receives only explicitly allowed IR/evidence summaries

## Phase 6 — Multi-repository workspace

Introduce AVGL Workspace IR:

```
WORKSPACE
├── repo A @ immutable revision
├── repo B @ immutable revision
└── repo C @ immutable revision
       ↓
CROSS-REPO RELATION LAYER
```

Cross-repo vocabulary:
- PROVIDES
- CONSUMES
- IMPLEMENTS
- MIRRORS
- SUPERSEDES
- GENERATES
- PROJECTS
- REGISTERS
- ACTIVATES
- GOVERNS
- AUTHORIZES
- EXECUTES
- VERIFIES
- CROSS_REPO_DEPENDS_ON
- CROSS_REPO_PROVIDES

Every cross-repo edge must preserve:
- source repository + revision
- target repository + revision
- evidence
- basis (EXPLICIT / INFERRED / DERIVED)
- confidence
- freshness

## Non-goals of the first relation slice

- no claim of complete call graph
- no interprocedural dataflow yet
- no runtime trace proof yet
- no framework-specific semantic truth from naming alone
- no graph-first opening UI
- no private-repo write capability

## Next adapters

After the deterministic relation kernel is stable:
1. JS/TS AST adapter
2. config/schema reference adapter
3. test-to-implementation adapter
4. MCP manifest adapter
5. Python AST adapter
6. framework adapters
7. runtime trace binding
