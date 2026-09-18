# AVGL v0.5 — GitHub User OAuth, Private Repo UI, Workspace UI

## Security correction from v0.4

A GitHub App setup redirect may include an `installation_id`, but that value alone is not authority.

AVGL v0.5 therefore uses:

```
Install GitHub App
        ↓
Setup callback receives installation_id
        ↓
signed state validation
        ↓
GitHub App user OAuth
        ↓
user access token
        ↓
GET /user/installations/{installation_id}/repositories
        ↓
verified user ↔ installation ↔ repository intersection
        ↓
encrypted AVGL session
```

The interactive private-repository path uses a GitHub App **user access token** for GitHub API reads. This token is limited by the intersection of:
- GitHub App permissions
- repositories selected for the installation
- the authenticated user's own access

The token is sealed with AES-256-GCM into a short-lived HttpOnly/Secure/SameSite cookie. It is not exposed to browser JavaScript or LocalStorage.

## GitHub App configuration

Set the GitHub App fields:

### Homepage URL

```
https://avgl.vercel.app
```

### Setup URL

```
https://avgl.vercel.app/api/github-app/callback
```

Enable **Redirect on update** if repository selection changes should return to AVGL.

### User authorization callback URL

```
https://avgl.vercel.app/api/github-app/oauth-callback
```

AVGL initiates user OAuth explicitly after the installation setup callback. Do not depend on `installation_id` as a session credential.

### Repository permissions

Required:
- Metadata: read
- Contents: read

Optional only when a future feature needs them:
- Pull requests: read
- Issues: read

Not required:
- Contents: write
- Actions: write
- Administration
- Secrets
- Deployments: write

Webhooks are not required for repository analysis.

## Vercel environment

Required:

```
GITHUB_APP_SLUG=...
GITHUB_APP_CLIENT_ID=...
GITHUB_APP_CLIENT_SECRET=...
AVGL_SESSION_SECRET=...
AVGL_PUBLIC_ORIGIN=https://avgl.vercel.app
```

Optional:

```
GITHUB_APP_ID=...
GITHUB_APP_PRIVATE_KEY=...
GITHUB_TOKEN=...
```

`GITHUB_APP_ID` and `GITHUB_APP_PRIVATE_KEY` remain available for future app-level automation but are not required for user-scoped repository reading.

## UI flow

### Single repository

```
PUBLIC URL
  └─ URL input → Analyze

PRIVATE GITHUB
  └─ Connect GitHub
       ↓
     user-scoped accessible repositories
       ↓
     repository picker
       ↓
     Analyze
```

For `github_app` analysis, the remote OpenRouter assistant remains disabled by default.

### Workspace

The Workspace UI accepts up to eight repositories.

Connected GitHub App repositories are tagged `GITHUB APP`. Manually entered repositories are tagged `PUBLIC`.

Mixed workspaces are supported per repository:

```
private repo A ── github_app user token
private repo B ── github_app user token
public repo C  ── public GitHub path
                     ↓
                 Workspace IR
```

Every server-side workspace repository is still resolved to an immutable commit SHA before analysis.

## Private content transport

The full scanner fetches repository file content via authenticated GitHub REST blob endpoints using blob SHA:

```
Git tree
  ↓
blob SHA
  ↓
GET /repos/{owner}/{repo}/git/blobs/{sha}
```

This replaces the previous raw.githubusercontent.com content path and works with the same user-scoped GitHub App token used for private repository access.

## E2E gate

A real private-repository E2E run requires:
1. GitHub App registered/configured with the URLs above
2. required Vercel environment variables
3. app installed on at least one selected private repository
4. user OAuth authorization completed

Without those credentials, the install/auth endpoints must fail closed and the public analysis path must remain functional.
