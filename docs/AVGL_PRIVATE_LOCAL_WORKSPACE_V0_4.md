# AVGL v0.4 — Private GitHub, Local Private, Workspace IR

Status: IMPLEMENTATION_FOUNDATION

## Phase 4 — Private GitHub repositories

AVGL uses a GitHub App installation flow rather than a long-lived broad OAuth token.

Required deployment configuration:

```
GITHUB_APP_ID=...
GITHUB_APP_SLUG=...
GITHUB_APP_PRIVATE_KEY=...
AVGL_SESSION_SECRET=...
```

Optional public-repository fallback:

```
GITHUB_TOKEN=...
```

Flow:

```
User
  ↓
/api/github-app/install
  ↓
GitHub App installation / repository selection
  ↓
/api/github-app/callback
  ↓
signed HttpOnly installation session
  ↓
short-lived installation token minted server-side
  ↓
analyze / repository / file / workspace
```

Security properties:
- installation token is minted only server-side
- installation token is not persisted in AVGL cookies
- cookies are HttpOnly + Secure + SameSite=Lax
- install flow state is signed and expires
- private repository access is fail-closed when the session is absent/expired
- source data is not intentionally persisted by these endpoints
- OpenRouter chat rejects GitHub App private-repository context by default

The GitHub App itself should be configured read-only:
- Contents: read
- Metadata: read
- Pull requests: read only when needed
- Issues: read only when needed

No write/admin/actions/secrets permissions are required for analysis.

This mode is least-privilege / zero-retention-oriented processing. It is not cryptographic zero knowledge because AVGL cloud still processes source in plaintext during analysis.

## Phase 5 — LOCAL_PRIVATE

```
avgl local-private <repo-path> --out avgl.private.json
```

Optional:

```
--no-paths
```

LOCAL_PRIVATE:
- runs repository analysis locally
- runs relation/effect extraction locally
- removes `snippet`, `content`, and `excerpt` before transport/export
- adds privacy metadata asserting that raw source was not transported
- can remove source file paths too

Transport IR metadata:

```json
{
  "privacy": {
    "mode": "LOCAL_PRIVATE",
    "rawSourceTransported": false,
    "sourceSnippetsTransported": false
  }
}
```

This is the foundation for a later local/self-hosted inference mode where source and questions never leave the environment.

## Phase 6 — Multi-repository Workspace IR

Local:

```
avgl workspace ./avgl.workspace.json --out workspace.avgl.json
```

Transport-safe local workspace:

```
avgl workspace ./avgl.workspace.json --out workspace.avgl.json --transport-safe
```

Server API:

```
POST /api/workspace
```

The server path:
1. resolves every repository/ref to an immutable commit SHA
2. analyzes each repository independently
3. constructs a Workspace IR
4. adds only evidence-bound cross-repo relations
5. separates explicit relations from derived module dependencies/effect reachability

Workspace invariants:

```
EXPLICIT_RELATION != INFERRED_RELATION
INFERRED_RELATION != DERIVED_EFFECT
DEPENDENCY != INVOCATION
CROSS_REPO_REACHABILITY != EXECUTION
```

Initial cross-repo vocabulary:
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

A derived effect chain is only a reachability candidate. A dependency on a provider that has an external effect does not prove the consumer invoked that effect.

## Workspace manifest

See `examples/avgl.workspace.example.json`.
