const ALLOWED_CROSS_REPO_TYPES = new Set([
  'PROVIDES','CONSUMES','IMPLEMENTS','MIRRORS','SUPERSEDES','GENERATES','PROJECTS',
  'REGISTERS','ACTIVATES','GOVERNS','AUTHORIZES','EXECUTES','VERIFIES',
  'CROSS_REPO_DEPENDS_ON','CROSS_REPO_PROVIDES'
]);

function normalizeRevision(value) {
  const revision = String(value ?? '').trim();
  return revision || 'UNPINNED';
}

function repositoryId(entry, index) {
  return String(entry.id ?? entry.ir?.source?.label ?? ('repo-' + (index + 1))).trim();
}

function repoEntity(id) {
  return { kind:'repository', id };
}

function workspaceRelation(type, from, to, basis, confidence, metadata = {}) {
  return {
    id:'workspace-rel:' + type + ':' + from.id + '->' + to.id + ':' + basis,
    type,
    from,
    to,
    basis,
    confidence,
    evidence:metadata.evidence ? [metadata.evidence] : [],
    freshness:metadata.freshness ?? null,
    derivedFrom:metadata.derivedFrom ?? null,
    note:metadata.note ?? null
  };
}

function normalizeManifestRelation(input) {
  const type = String(input?.type ?? '').trim();
  if (!ALLOWED_CROSS_REPO_TYPES.has(type)) throw new Error('Unsupported workspace relation type: ' + type);
  const from = String(input?.from ?? '').trim();
  const to = String(input?.to ?? '').trim();
  if (!from || !to) throw new Error('Workspace relation requires from and to.');
  return {
    type,
    from,
    to,
    basis:'EXPLICIT',
    confidence:Number.isFinite(input?.confidence) ? input.confidence : 1,
    evidence:input?.evidence ?? null,
    note:input?.note ?? null
  };
}

function moduleAliases(entry) {
  const aliases = new Set();
  for (const value of entry.provides ?? []) aliases.add(String(value));
  if (entry.packageName) aliases.add(String(entry.packageName));
  return aliases;
}

function collectImportedModules(ir) {
  return (ir?.relations ?? [])
    .filter((relation) => relation.type === 'IMPORTS_MODULE' && relation.to?.kind === 'module')
    .map((relation) => ({
      module:relation.to.id,
      evidence:relation.evidence?.[0] ?? null,
      relationId:relation.id
    }));
}

function externalEffects(ir) {
  return (ir?.effects ?? []).filter((effect) => effect.external === true);
}

export function createWorkspaceIr(entries, options = {}) {
  if (!Array.isArray(entries) || entries.length === 0) throw new Error('Workspace requires at least one repository.');

  const repositories = entries.map((entry, index) => {
    const id = repositoryId(entry, index);
    return {
      id,
      source:entry.ir?.source?.label ?? entry.source ?? id,
      revision:normalizeRevision(entry.revision),
      avglVersion:entry.ir?.avglVersion ?? null,
      scanComplete:Boolean(entry.ir?.analysis?.scanComplete),
      provides:[...moduleAliases(entry)],
      dependsOn:[...(entry.dependsOn ?? [])].map(String),
      effectCount:externalEffects(entry.ir).length,
      ir:entry.ir
    };
  });

  const byId = new Map(repositories.map((repo) => [repo.id, repo]));
  if (byId.size !== repositories.length) throw new Error('Workspace repository IDs must be unique.');

  const relations = [];

  for (const repo of repositories) {
    for (const provided of repo.provides) {
      relations.push(workspaceRelation(
        'CROSS_REPO_PROVIDES',
        repoEntity(repo.id),
        { kind:'module', id:provided },
        'EXPLICIT',
        1,
        { note:'Declared workspace provider alias.' }
      ));
    }
    for (const target of repo.dependsOn) {
      if (!byId.has(target)) throw new Error('Workspace dependency target not found: ' + target);
      relations.push(workspaceRelation(
        'CROSS_REPO_DEPENDS_ON',
        repoEntity(repo.id),
        repoEntity(target),
        'EXPLICIT',
        1,
        { note:'Declared workspace dependency.' }
      ));
    }
  }

  for (const raw of options.relations ?? []) {
    const rel = normalizeManifestRelation(raw);
    if (!byId.has(rel.from) || !byId.has(rel.to)) {
      throw new Error('Workspace relation references unknown repository.');
    }
    relations.push(workspaceRelation(
      rel.type,
      repoEntity(rel.from),
      repoEntity(rel.to),
      'EXPLICIT',
      rel.confidence,
      { evidence:rel.evidence, note:rel.note }
    ));
  }

  const providers = [];
  for (const repo of repositories) {
    for (const alias of repo.provides) providers.push({ repoId:repo.id, alias });
  }

  for (const repo of repositories) {
    for (const imported of collectImportedModules(repo.ir)) {
      const provider = providers.find((candidate) =>
        candidate.repoId !== repo.id &&
        (imported.module === candidate.alias || imported.module.startsWith(candidate.alias + '/'))
      );
      if (!provider) continue;

      const exists = relations.some((rel) =>
        rel.type === 'CROSS_REPO_DEPENDS_ON' &&
        rel.from.id === repo.id &&
        rel.to.id === provider.repoId
      );
      if (!exists) {
        relations.push(workspaceRelation(
          'CROSS_REPO_DEPENDS_ON',
          repoEntity(repo.id),
          repoEntity(provider.repoId),
          'DERIVED',
          0.9,
          {
            evidence:imported.evidence,
            derivedFrom:imported.relationId,
            note:'Derived from IMPORTS_MODULE matched to a declared provider alias.'
          }
        ));
      }

      relations.push(workspaceRelation(
        'CONSUMES',
        repoEntity(repo.id),
        { kind:'module', id:imported.module },
        'DERIVED',
        0.9,
        {
          evidence:imported.evidence,
          derivedFrom:imported.relationId,
          note:'Derived module consumption.'
        }
      ));
    }
  }

  const effectChains = [];
  for (const dependency of relations.filter((rel) => rel.type === 'CROSS_REPO_DEPENDS_ON')) {
    const provider = byId.get(dependency.to.id);
    if (!provider) continue;
    for (const effect of externalEffects(provider.ir).slice(0, 50)) {
      effectChains.push({
        id:'workspace-chain:' + dependency.from.id + '->' + dependency.to.id + ':' + effect.id,
        basis:'DERIVED',
        confidence:Math.min(dependency.confidence, effect.confidence ?? 0.5),
        source:repoEntity(dependency.from.id),
        via:repoEntity(dependency.to.id),
        effect:{
          kind:effect.effectKind,
          callee:effect.callee,
          repository:dependency.to.id
        },
        steps:[
          { type:'CROSS_REPO_DEPENDS_ON', repository:dependency.to.id, basis:dependency.basis },
          { type:'PROVIDER_EFFECT_CANDIDATE', value:effect.effectKind, basis:'DERIVED' }
        ],
        note:'Reachability candidate only. Dependency does not prove that the consumer invokes this provider effect.'
      });
    }
  }

  return {
    avglWorkspaceVersion:'0.1',
    generatedAt:new Date().toISOString(),
    source:{ kind:'workspace', label:options.label ?? 'workspace' },
    repositories:repositories.map(({ ir, ...repo }) => repo),
    repositoryIrs:Object.fromEntries(repositories.map((repo) => [repo.id, repo.ir])),
    relations,
    effectChains,
    invariants:[
      'EXPLICIT_RELATION != INFERRED_RELATION',
      'INFERRED_RELATION != DERIVED_EFFECT',
      'DEPENDENCY != INVOCATION',
      'CROSS_REPO_REACHABILITY != EXECUTION'
    ]
  };
}

export function workspaceSummary(workspace) {
  return {
    repositories:workspace.repositories.length,
    explicitRelations:workspace.relations.filter((rel) => rel.basis === 'EXPLICIT').length,
    derivedRelations:workspace.relations.filter((rel) => rel.basis === 'DERIVED').length,
    derivedEffectChains:workspace.effectChains.length
  };
}
