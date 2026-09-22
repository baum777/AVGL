const SEMANTIC_ORDER = Object.freeze(["WHO","KNOW","THINK","CAN","MAY","ACT","DID"]);

function uniqueBy(values, keyFn) {
  const seen = new Set();
  const out = [];
  for (const value of values) {
    const key = keyFn(value);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

function evidenceKey(item) {
  return [
    item.semanticClass ?? "",
    item.path ?? "",
    item.line ?? 0,
    item.detector ?? "",
    item.source ?? ""
  ].join(":");
}

export function projectFileSemanticContext(ir, path) {
  const targetPath = String(path ?? "");
  const nodes = Array.isArray(ir?.nodes) ? ir.nodes : [];
  const relations = Array.isArray(ir?.relations) ? ir.relations : [];
  const effects = Array.isArray(ir?.effects) ? ir.effects : [];

  const semanticClasses = new Set();
  const evidence = [];

  for (const node of nodes) {
    for (const ref of node?.evidence ?? []) {
      if (ref?.path !== targetPath) continue;
      if (node?.semanticClass) semanticClasses.add(node.semanticClass);
      evidence.push({
        semanticClass: node?.semanticClass ?? null,
        nodeId: node?.id ?? null,
        evidenceState: node?.evidenceState ?? null,
        confidence: node?.confidence ?? null,
        path: ref.path,
        line: ref.line,
        sourceKind: ref.sourceKind,
        detector: ref.detector,
        semanticResolution: ref.semanticResolution ?? null,
        source: "node"
      });
    }
  }

  const fileRelations = relations.filter((relation) => (
    (relation?.from?.kind === "file" && relation.from.id === targetPath) ||
    (relation?.to?.kind === "file" && relation.to.id === targetPath)
  ));

  for (const relation of fileRelations) {
    if (relation?.semanticClass) semanticClasses.add(relation.semanticClass);
    if (!relation?.semanticClass) continue;
    for (const ref of relation.evidence ?? []) {
      evidence.push({
        semanticClass: relation.semanticClass,
        relationId: relation.id ?? null,
        path: ref?.path ?? targetPath,
        line: ref?.line ?? null,
        sourceKind: ref?.sourceKind ?? null,
        detector: null,
        semanticResolution: null,
        source: "relation"
      });
    }
  }

  const fileEffects = effects.filter((effect) => effect?.path === targetPath);
  for (const effect of fileEffects) {
    if (effect?.semanticClass) semanticClasses.add(effect.semanticClass);
    if (!effect?.semanticClass) continue;
    const ref = effect.evidence;
    evidence.push({
      semanticClass: effect.semanticClass,
      effectId: effect.id ?? null,
      path: ref?.path ?? targetPath,
      line: ref?.line ?? null,
      sourceKind: ref?.sourceKind ?? null,
      detector: null,
      semanticResolution: null,
      source: "effect"
    });
  }

  const orderedClasses = [...semanticClasses].sort(
    (a, b) => SEMANTIC_ORDER.indexOf(a) - SEMANTIC_ORDER.indexOf(b)
  );

  return {
    path: targetPath,
    status: orderedClasses.length ? "EVIDENCED" : "UNKNOWN",
    semanticClasses: orderedClasses,
    evidence: uniqueBy(evidence, evidenceKey),
    relations: fileRelations,
    effects: fileEffects,
    semanticSource: "canonical-ir"
  };
}
