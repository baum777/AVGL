import { extname, dirname, posix } from 'node:path';
import { sourceKindForPath } from './discover.js';

const CODE_EXTENSIONS = new Set(['.js','.mjs','.cjs','.ts','.tsx','.jsx']);
const RESOLVE_EXTENSIONS = ['', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.json', '.yaml', '.yml'];
const LOCAL_MUTATION_METHODS = new Set(['push','pop','shift','unshift','splice','sort','reverse','fill','copyWithin']);

const PROVIDER_BOUNDARY_RECEIVER = /(?:^|\.)(?:provider|gateway|apiClient|remoteClient)$/i;
const PROVIDER_MUTATION_METHOD = /^(?:request|create|update|delete|refund|charge|cancel|submit|send|publish|post|put|patch)/i;

const EXTERNAL_EFFECT_RULES = Object.freeze([
  { kind:'NETWORK_REQUEST', semanticClass:'ACT', confidence:0.94, pattern:/^(?:fetch|axios\.(?:post|put|patch|delete)|[^.]+\.(?:request|post|put|patch|delete))$/i },
  { kind:'FILESYSTEM_WRITE', semanticClass:'ACT', confidence:0.97, pattern:/^(?:fs\.)?(?:writeFile|writeFileSync|appendFile|appendFileSync|rm|rmSync|rename|renameSync|unlink|unlinkSync|mkdir|mkdirSync)$/i },
  { kind:'COMMAND_EXECUTION', semanticClass:'ACT', confidence:0.98, pattern:/^(?:child_process\.)?(?:exec|execFile|spawn|fork)$/i },
  { kind:'GIT_MUTATION', semanticClass:'ACT', confidence:0.96, pattern:/^(?:[^.]*?(?:git|repo|repository|github|octokit|client)\.)?(?:push|commit|merge|createPullRequest|create_pull_request)$/i },
  { kind:'MESSAGE_SEND', semanticClass:'ACT', confidence:0.96, pattern:/^(?:(?:mail|mailer|email|message|slack|client)\.)?(?:send|sendMail|sendMessage|postMessage)$/i },
  { kind:'DEPLOYMENT', semanticClass:'ACT', confidence:0.96, pattern:/^(?:(?:vercel|deploy|deployment|client)\.)?(?:deploy|release|promote)$/i },
  { kind:'DATABASE_WRITE', semanticClass:'ACT', confidence:0.9, pattern:/^(?:(?:db|database|sql|query|prisma|supabase|repository|repo)\.)?(?:insert|update|delete|upsert|execute|transaction)$/i }
]);

function cleanPath(value) {
  return String(value ?? '').replaceAll('\\', '/');
}

function lineNumber(content, index) {
  return content.slice(0, index).split(/\r?\n/).length;
}

function lineSnippet(content, index) {
  const before = content.lastIndexOf('\n', index);
  const after = content.indexOf('\n', index);
  return content.slice(before < 0 ? 0 : before + 1, after < 0 ? content.length : after).trim().slice(0, 220);
}

function evidence(path, content, index, sourceKind) {
  return { path, line:lineNumber(content,index), snippet:lineSnippet(content,index), sourceKind:sourceKind ?? sourceKindForPath(path) };
}

function factId(prefix, path, index, suffix='') {
  const safe = (path + ':' + index + ':' + suffix).replace(/[^A-Za-z0-9_.:-]+/g, '-');
  return prefix + ':' + safe;
}

function detectSymbols(path, content, sourceKind) {
  const facts = [];
  const patterns = [
    { kind:'FUNCTION', re:/\b(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g },
    { kind:'CLASS', re:/\b(?:export\s+)?class\s+([A-Za-z_$][\w$]*)(?:\s+extends\s+([A-Za-z_$][\w$]*))?/g },
    { kind:'CONST', re:/\bexport\s+const\s+([A-Za-z_$][\w$]*)\b/g }
  ];
  for (const item of patterns) {
    for (const match of content.matchAll(item.re)) {
      const index = match.index ?? 0;
      facts.push({
        id:factId('symbol',path,index,match[1]),
        factType:'SYMBOL',
        symbolKind:item.kind,
        name:match[1],
        path,
        sourceKind,
        extends:match[2] ?? null,
        evidence:evidence(path,content,index,sourceKind)
      });
    }
  }
  return facts;
}

function detectImports(path, content, sourceKind) {
  const facts = [];
  const patterns = [
    /\bimport\s+(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g,
    /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  ];
  for (const re of patterns) {
    for (const match of content.matchAll(re)) {
      const index = match.index ?? 0;
      facts.push({ id:factId('import',path,index,match[1]), factType:'IMPORT', path, sourceKind, target:match[1], evidence:evidence(path,content,index,sourceKind) });
    }
  }
  return facts;
}

function detectImportBindings(path, content, sourceKind) {
  const facts = [];

  for (const match of content.matchAll(/\bimport\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g)) {
    const index = match.index ?? 0;
    for (const raw of match[1].split(',')) {
      const spec = raw.trim();
      if (!spec) continue;
      const parts = spec.split(/\s+as\s+/i).map((part) => part.trim()).filter(Boolean);
      const importedName = parts[0];
      const localName = parts[1] ?? importedName;
      if (!importedName || !localName) continue;
      facts.push({
        id: factId('import-binding', path, index, localName),
        factType: 'IMPORT_BINDING',
        path,
        sourceKind,
        target: match[2],
        importedName,
        localName,
        bindingKind: 'NAMED',
        evidence: evidence(path, content, index, sourceKind)
      });
    }
  }

  for (const match of content.matchAll(/\bimport\s+([A-Za-z_$][\w$]*)\s+from\s*['"]([^'"]+)['"]/g)) {
    const index = match.index ?? 0;
    facts.push({
      id: factId('import-binding', path, index, match[1]),
      factType: 'IMPORT_BINDING',
      path,
      sourceKind,
      target: match[2],
      importedName: 'default',
      localName: match[1],
      bindingKind: 'DEFAULT',
      evidence: evidence(path, content, index, sourceKind)
    });
  }

  return facts;
}

function detectExports(path, content, sourceKind) {
  const facts = [];
  for (const match of content.matchAll(/\bexport\s*\{([^}]+)\}/g)) {
    const index = match.index ?? 0;
    for (const raw of match[1].split(',')) {
      const name = raw.trim().split(/\s+as\s+/i).pop()?.trim();
      if (!name) continue;
      facts.push({ id:factId('export',path,index,name), factType:'EXPORT', path, sourceKind, name, evidence:evidence(path,content,index,sourceKind) });
    }
  }
  const declarationPatterns = [
    /\bexport\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g,
    /\bexport\s+class\s+([A-Za-z_$][\w$]*)/g,
    /\bexport\s+const\s+([A-Za-z_$][\w$]*)/g
  ];
  for (const re of declarationPatterns) {
    for (const match of content.matchAll(re)) {
      const index = match.index ?? 0;
      facts.push({
        id: factId('export', path, index, match[1]),
        factType: 'EXPORT',
        path,
        sourceKind,
        name: match[1],
        evidence: evidence(path, content, index, sourceKind)
      });
    }
  }
  return facts;
}

function detectCalls(path, content, sourceKind) {
  const facts = [];
  const seen = new Set();
  const re = /\b([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*\(/g;
  for (const match of content.matchAll(re)) {
    const callee = match[1];
    if (['if','for','while','switch','catch','function'].includes(callee)) continue;
    const index = match.index ?? 0;
    const key = index + ':' + callee;
    if (seen.has(key)) continue;
    seen.add(key);
    const receiver = callee.includes('.') ? callee.split('.').slice(0,-1).join('.') : null;
    const method = callee.split('.').pop();
    facts.push({ id:factId('call',path,index,callee), factType:'CALL', path, sourceKind, callee, receiver, method, evidence:evidence(path,content,index,sourceKind) });
  }
  return facts;
}

function detectPathReferences(path, content, sourceKind) {
  const facts = [];
  const re = /['"]((?:\.{1,2}\/|\/)?(?:[A-Za-z0-9_.-]+\/)+[A-Za-z0-9_.-]+\.(?:js|mjs|cjs|ts|tsx|jsx|json|ya?ml|md))['"]/g;
  for (const match of content.matchAll(re)) {
    const index = match.index ?? 0;
    facts.push({ id:factId('pathref',path,index,match[1]), factType:'PATH_REFERENCE', path, sourceKind, target:match[1], evidence:evidence(path,content,index,sourceKind) });
  }
  return facts;
}

function classifyCallEffect(call) {
  const method = call.method ?? '';
  if (PROVIDER_BOUNDARY_RECEIVER.test(call.receiver ?? '') && PROVIDER_MUTATION_METHOD.test(method)) {
    return {
      effectKind:'NETWORK_REQUEST',
      external:true,
      semanticClass:'ACT',
      confidence:0.95,
      reason:'provider/gateway boundary receiver plus effect-bearing operation'
    };
  }
  if (LOCAL_MUTATION_METHODS.has(method) && !/(?:git|github|repo|repository|octokit|client)$/i.test(call.receiver ?? '')) {
    return { effectKind:'LOCAL_MUTATION', external:false, semanticClass:null, confidence:0.99, reason:'collection mutation; not an external effect' };
  }
  for (const rule of EXTERNAL_EFFECT_RULES) {
    if (rule.pattern.test(call.callee)) {
      return { effectKind:rule.kind, external:true, semanticClass:rule.semanticClass, confidence:rule.confidence, reason:'matched explicit external-effect call family' };
    }
  }
  return null;
}

export function extractRelationFacts(file) {
  const path = cleanPath(file.path);
  const content = typeof file.content === 'string' ? file.content : '';
  const sourceKind = file.sourceKind ?? sourceKindForPath(path);
  if (!content || (!CODE_EXTENSIONS.has(extname(path).toLowerCase()) && sourceKind !== 'config')) return { path, sourceKind, facts:[], effects:[] };

  const facts = [
    ...detectSymbols(path,content,sourceKind),
    ...detectImports(path,content,sourceKind),
    ...detectImportBindings(path,content,sourceKind),
    ...detectExports(path,content,sourceKind),
    ...detectCalls(path,content,sourceKind),
    ...detectPathReferences(path,content,sourceKind)
  ];

  const effects = facts.filter((fact)=>fact.factType==='CALL').map((call)=>{
    const classification = classifyCallEffect(call);
    if (!classification) return null;
    return { id:'effect:' + call.id, factType:'EFFECT', path, sourceKind, callId:call.id, callee:call.callee, ...classification, evidence:call.evidence };
  }).filter(Boolean);

  return { path, sourceKind, facts, effects };
}

function resolveRelativeImport(fromPath,target,allPaths) {
  if (!target.startsWith('.')) return null;
  const base = cleanPath(posix.normalize(posix.join(dirname(fromPath),target)));
  const candidates = [];
  for (const extension of RESOLVE_EXTENSIONS) candidates.push(base + extension);
  for (const extension of RESOLVE_EXTENSIONS.slice(1)) candidates.push(base + '/index' + extension);
  return candidates.find((candidate)=>allPaths.has(candidate)) ?? null;
}

function resolvePathReference(fromPath,target,allPaths) {
  const normalizedTarget = cleanPath(target);
  if (allPaths.has(normalizedTarget)) return normalizedTarget;
  if (normalizedTarget.startsWith('.')) {
    const candidate = cleanPath(posix.normalize(posix.join(dirname(fromPath),normalizedTarget)));
    if (allPaths.has(candidate)) return candidate;
  }
  return null;
}

function relation(type,from,to,basis,confidence,evidenceValue,metadata={}) {
  const evidenceList = Array.isArray(evidenceValue)
    ? evidenceValue.filter(Boolean)
    : evidenceValue
      ? [evidenceValue]
      : [];
  return {
    id:'rel:' + type + ':' + from.kind + ':' + from.id + '->' + to.kind + ':' + to.id + ':' + (evidenceList[0]?.line ?? 0),
    type, from, to, basis, confidence,
    evidence:evidenceList,
    ...metadata
  };
}

export function resolveRelations(fileFacts,inventoryPaths=[]) {
  const allPaths = new Set(inventoryPaths.map(cleanPath));
  const relations = [];
  const effects = [];
  const exportsByFile = new Map();
  const symbolsByFile = new Map();

  for (const bundle of fileFacts) {
    const exported = new Map();
    for (const exp of bundle.facts.filter((fact)=>fact.factType==='EXPORT')) exported.set(exp.name, exp);
    exportsByFile.set(bundle.path, exported);

    const symbols = new Map();
    for (const symbol of bundle.facts.filter((fact)=>fact.factType==='SYMBOL')) symbols.set(symbol.name, symbol);
    symbolsByFile.set(bundle.path, symbols);
  }

  for (const bundle of fileFacts) {
    for (const symbol of bundle.facts.filter((fact)=>fact.factType==='SYMBOL')) {
      relations.push(relation('CONTAINS',{kind:'file',id:bundle.path},{kind:'symbol',id:bundle.path + '#' + symbol.name},'EXPLICIT',0.99,symbol.evidence,{symbolKind:symbol.symbolKind}));
      if (symbol.extends) relations.push(relation('EXTENDS',{kind:'symbol',id:bundle.path + '#' + symbol.name},{kind:'symbol_name',id:symbol.extends},'EXPLICIT',0.99,symbol.evidence,{inheritanceKind:'CODE_INHERITANCE'}));
    }

    for (const exp of bundle.facts.filter((fact)=>fact.factType==='EXPORT')) {
      relations.push(relation('EXPORTS',{kind:'file',id:bundle.path},{kind:'symbol_name',id:exp.name},'EXPLICIT',0.99,exp.evidence));
    }

    for (const imp of bundle.facts.filter((fact)=>fact.factType==='IMPORT')) {
      const resolved = resolveRelativeImport(bundle.path,imp.target,allPaths);
      relations.push(relation(resolved?'IMPORTS':'IMPORTS_MODULE',{kind:'file',id:bundle.path},{kind:resolved?'file':'module',id:resolved??imp.target},'EXPLICIT',resolved?0.99:0.95,imp.evidence,{rawTarget:imp.target}));
    }

    const importBindings = bundle.facts.filter((fact)=>fact.factType==='IMPORT_BINDING');
    for (const binding of importBindings) {
      const resolved = resolveRelativeImport(bundle.path,binding.target,allPaths);
      if (!resolved || binding.importedName === 'default') continue;
      const exported = exportsByFile.get(resolved)?.get(binding.importedName);
      const symbol = symbolsByFile.get(resolved)?.get(binding.importedName);
      if (!exported || !symbol) continue;
      relations.push(relation(
        'IMPORTS_SYMBOL',
        {kind:'file',id:bundle.path},
        {kind:'symbol',id:resolved + '#' + binding.importedName},
        'DERIVED',
        0.99,
        [binding.evidence, exported.evidence],
        {
          rawTarget:binding.target,
          importedName:binding.importedName,
          localName:binding.localName,
          resolution:'IMPORT_EXPORT_BINDING'
        }
      ));
    }

    for (const ref of bundle.facts.filter((fact)=>fact.factType==='PATH_REFERENCE')) {
      const resolved = resolvePathReference(bundle.path,ref.target,allPaths);
      if (resolved) relations.push(relation('REFERENCES',{kind:'file',id:bundle.path},{kind:'file',id:resolved},'EXPLICIT',0.98,ref.evidence,{rawTarget:ref.target}));
    }

    for (const call of bundle.facts.filter((fact)=>fact.factType==='CALL')) {
      relations.push(relation('CALLS',{kind:'file',id:bundle.path},{kind:'callable',id:call.callee},'EXPLICIT',0.9,call.evidence));

      if (call.callee.includes('.')) continue;
      const binding = importBindings.find((candidate)=>candidate.localName===call.callee);
      if (!binding || binding.importedName === 'default') continue;
      const resolved = resolveRelativeImport(bundle.path,binding.target,allPaths);
      if (!resolved) continue;
      const exported = exportsByFile.get(resolved)?.get(binding.importedName);
      const symbol = symbolsByFile.get(resolved)?.get(binding.importedName);
      if (!exported || !symbol) continue;

      relations.push(relation(
        'CALLS_SYMBOL',
        {kind:'file',id:bundle.path},
        {kind:'symbol',id:resolved + '#' + binding.importedName},
        'DERIVED',
        0.99,
        [call.evidence, binding.evidence, exported.evidence],
        {
          callee:call.callee,
          importedName:binding.importedName,
          localName:binding.localName,
          sourceModule:binding.target,
          resolvedFile:resolved,
          resolution:'IMPORT_EXPORT_CALL_BINDING'
        }
      ));
    }

    for (const effect of bundle.effects) {
      effects.push(effect);
      relations.push(relation(effect.external?'EMITS_EFFECT':'LOCAL_MUTATION',{kind:'file',id:bundle.path},{kind:'effect',id:effect.effectKind},effect.external?'INFERRED':'EXPLICIT',effect.confidence,effect.evidence,{external:effect.external,semanticClass:effect.semanticClass,callee:effect.callee,reason:effect.reason}));
    }
  }

  const reverse = [];
  for (const rel of relations) {
    if (!['IMPORTS','REFERENCES'].includes(rel.type) || rel.to.kind !== 'file') continue;
    reverse.push(relation(rel.type==='IMPORTS'?'IMPORTED_BY':'REFERENCED_BY',rel.to,rel.from,'DERIVED',rel.confidence,rel.evidence[0],{derivedFrom:rel.id}));
  }
  return { relations:[...relations,...reverse], effects };
}

export function traceEffectChains(resolved) {
  return resolved.effects.filter((effect)=>effect.external).map((effect)=>({
    id:'chain:' + effect.id,
    source:{kind:'file',id:effect.path},
    steps:[
      {type:'CALL',value:effect.callee,basis:'EXPLICIT'},
      {type:'EFFECT_CLASSIFICATION',value:effect.effectKind,basis:'INFERRED'},
      {type:'ACT_CANDIDATE',value:effect.semanticClass,basis:'DERIVED'}
    ],
    confidence:effect.confidence,
    evidence:[effect.evidence]
  }));
}

export function buildRelationModel(files,inventoryPaths=files.map((file)=>file.path)) {
  const fileFacts = files.map(extractRelationFacts);
  const resolved = resolveRelations(fileFacts,inventoryPaths);
  return { facts:fileFacts, relations:resolved.relations, effects:resolved.effects, effectChains:traceEffectChains(resolved) };
}
