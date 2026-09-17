const CLASSES = ['WHO', 'KNOW', 'THINK', 'CAN', 'MAY', 'ACT', 'DID'];
const QUESTIONS = {
  WHO: 'Who is acting?', KNOW: 'What does it work with?', THINK: 'How does it think or plan?',
  CAN: 'What can it technically reach?', MAY: 'What is it allowed to do?',
  ACT: 'Where can real effects happen?', DID: 'How is the result evidenced?'
};
const form = document.querySelector('#analyze-form');
const repositoryInput = document.querySelector('#repository');
const analyzeButton = document.querySelector('#analyze-button');
const demoButton = document.querySelector('#demo-button');
const statusNode = document.querySelector('#status');
const errorNode = document.querySelector('#error');
const resultNode = document.querySelector('#result');
const resultTitle = document.querySelector('#result-title');
const scanMeta = document.querySelector('#scan-meta');
const partialWarning = document.querySelector('#partial-warning');
const storyView = document.querySelector('#story-view');
const inspectView = document.querySelector('#inspect-view');
const systemView = document.querySelector('#system-view');
const tabs = [...document.querySelectorAll('.view-tab')];

function create(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function byClass(ir, semanticClass) { return ir.nodes.find((node) => node.semanticClass === semanticClass) ?? null; }
function evidenceKinds(node) { return [...new Set((node?.evidence ?? []).map((item) => item.sourceKind).filter(Boolean))]; }
function areaFor(ir, semanticClass) {
  const area = ir.synthesis?.areas?.[semanticClass];
  if (area) return area;
  const node = byClass(ir, semanticClass);
  return { semanticClass, status: node ? 'EVIDENCED' : 'UNKNOWN', summary: node?.label ?? 'Not evidenced', families: [], evidenceKinds: evidenceKinds(node) };
}
function answer(ir, semanticClass) { return areaFor(ir, semanticClass).summary; }
function metaChip(text) { return create('span', 'meta-chip', text); }
function evidenceHint(node) {
  const kinds = evidenceKinds(node);
  if (!node) return 'No bounded evidence strong enough for this semantic area.';
  if (kinds.length === 0) return node.statement;
  return `${node.statement} Source surfaces: ${kinds.join(', ')}.`;
}
function exampleIr() {
  const node = (semanticClass, label, evidence, sourceKind = 'implementation') => ({
    id: `${semanticClass.toLowerCase()}-example`, semanticClass, label,
    statement: `Example evidence for ${semanticClass}.`, evidenceState: 'INFERRED', confidence: 0.8,
    evidence: [{ path: evidence, line: 12, snippet: `example ${label.toLowerCase()}`, detector: 'demo', sourceKind }]
  });
  return {
    avglVersion: '0.1', generatedAt: new Date().toISOString(), source: { kind: 'repository', label: 'example/review-agent' },
    analysis: { pipeline: ['DISCOVER', 'CLASSIFY', 'BIND', 'PROJECT'], mode: 'demo', filesSeen: 38, filesEligible: 22, filesScanned: 17, scanComplete: false, sourceCoverage: { implementation: 10, config: 2, test: 3, documentation: 2, other: 0 }, skippedSensitive: ['.env'], skippedOversize: [], rejectedWeakEvidence: 2 },
    nodes: [node('WHO', 'Review agent / harness', 'src/agent.ts'), node('KNOW', 'Repository + issue context', 'src/context.ts'), node('THINK', 'Reasoning model + review loop', 'src/reviewer.ts'), node('CAN', 'Repository reader + test runner', 'src/tools.ts'), node('ACT', 'Named test execution', 'src/executor.ts'), node('DID', 'Test result + review evidence', 'test/reviewer.test.ts', 'test')],
    relations: [], unknowns: ['MAY'], invariants: ['HARNESS != AUTHORITY', 'CONTEXT != PERMISSION', 'CAN != MAY', 'PROPOSAL != EXECUTION', 'ACT != DID', 'RECEIPT != VERIFICATION']
  };
}
function familyList(area) {
  if (!area?.families?.length) return null;
  const row = create('div', 'scan-meta');
  for (const family of area.families) row.append(create('span', 'source-kind', family.label));
  return row;
}
function storyStep(index, ir, semanticClass) {
  const node = byClass(ir, semanticClass);
  const area = areaFor(ir, semanticClass);
  const wrapper = create('div', `story-step${node ? '' : ' unknown'}`);
  wrapper.append(create('div', 'story-number', String(index)));
  const body = create('div');
  const question = create('div', 'story-question');
  question.append(create('span', 'token', semanticClass), document.createTextNode(` · ${QUESTIONS[semanticClass]}`));
  body.append(question, create('p', 'story-answer', area.summary), create('p', 'story-explain', evidenceHint(node)));
  const families = familyList(area); if (families) body.append(families);
  wrapper.append(body);
  return wrapper;
}
function renderStory(ir) {
  storyView.replaceChildren();
  const stack = create('div', 'story-stack');
  stack.append(storyStep(1, ir, 'WHO'), storyStep(2, ir, 'KNOW'), storyStep(3, ir, 'THINK'));
  const pair = create('div', 'capability-pair');
  const can = byClass(ir, 'CAN'); const may = byClass(ir, 'MAY');
  const canArea = areaFor(ir, 'CAN'); const mayArea = areaFor(ir, 'MAY');
  const canCard = create('div', 'pair-card');
  canCard.append(create('span', 'token', 'CAN'), create('h3', '', canArea.summary), create('p', '', evidenceHint(can)));
  const canFamilies = familyList(canArea); if (canFamilies) canCard.append(canFamilies);
  const mayCard = create('div', `pair-card${may ? '' : ' authority-missing'}`);
  mayCard.append(create('span', 'token', 'MAY'), create('h3', '', mayArea.summary), create('p', '', evidenceHint(may)));
  const mayFamilies = familyList(mayArea); if (mayFamilies) mayCard.append(mayFamilies);
  pair.append(canCard, mayCard);
  if (can && !may) pair.append(create('p', 'invariant-note', 'Technical capability signals were found, but no implementation/config authority evidence passed the MAY gate.'));
  stack.append(pair, storyStep(4, ir, 'ACT'), storyStep(5, ir, 'DID'));
  storyView.append(stack);
}
function renderInspect(ir) {
  inspectView.replaceChildren();
  const intro = create('div', 'inspect-intro');
  intro.append(create('strong', '', 'Evidence view'), create('span', '', ' Static signals are grouped by semantic area. Source type matters: documentation can support understanding, but cannot by itself prove MAY/ACT/DID.'));
  inspectView.append(intro);
  const grid = create('div', 'inspect-grid');
  for (const semanticClass of CLASSES) {
    const node = byClass(ir, semanticClass);
    const card = create('article', 'inspect-card');
    const head = create('div', 'inspect-card-head');
    const titleBox = create('div');
    titleBox.append(create('span', 'token', semanticClass), create('h3', '', QUESTIONS[semanticClass]));
    head.append(titleBox, create('span', 'state-chip', node?.evidenceState ?? 'UNKNOWN'));
    card.append(head, create('p', '', node ? node.label : 'No bounded evidence passed this semantic gate.'));
    if (node?.evidence?.length) {
      const details = create('details');
      details.append(create('summary', '', `${node.evidence.length} evidence reference${node.evidence.length === 1 ? '' : 's'}`));
      const list = create('ul', 'evidence-list');
      for (const evidence of node.evidence) {
        const item = create('li', 'evidence-item');
        const row = create('div', 'evidence-row');
        row.append(create('div', 'evidence-path', `${evidence.path}:${evidence.line}`), create('span', 'source-kind', evidence.sourceKind ?? 'unknown'));
        item.append(row, create('div', 'evidence-snippet', evidence.snippet || '(empty line)'));
        list.append(item);
      }
      details.append(list); card.append(details);
    }
    grid.append(card);
  }
  inspectView.append(grid);
}
function systemBand(token, title, copy) { const band = create('div', 'system-band'); band.append(create('span', 'token', token), create('h3', '', title), create('p', '', copy)); return band; }
function arrow() { return create('div', 'system-arrow', '↓'); }
function renderSystem(ir) {
  systemView.replaceChildren();
  const disclaimer = create('div', 'notice');
  disclaimer.textContent = 'Semantic frame, not reconstructed topology. v0.1 has no relation/call-path extraction yet.';
  systemView.append(disclaimer);
  const story = create('div', 'system-story');
  story.append(systemBand('WHO · KNOW · THINK', 'Agent plane', `${answer(ir, 'WHO')} · ${answer(ir, 'KNOW')} · ${answer(ir, 'THINK')}`), arrow(), systemBand('PROPOSAL', 'Intent leaves cognition', 'A model proposal is not yet authority or an external effect.'), arrow(), create('div', 'system-boundary', 'Authority boundary'));
  const pair = create('div', 'system-pair');
  pair.append(systemBand('CAN', answer(ir, 'CAN'), 'Technical reach / callable surface'), systemBand('MAY', answer(ir, 'MAY'), 'Authority evidence from implementation/config only'));
  story.append(pair, arrow(), systemBand('ACT', answer(ir, 'ACT'), 'Implementation-backed effect path'), arrow(), systemBand('DID', answer(ir, 'DID'), 'Implementation/test/config-backed evidence path'));
  systemView.append(story);
}
function render(ir) {
  resultTitle.textContent = ir.source?.label || 'Repository';
  const eligible = ir.analysis.filesEligible ?? ir.analysis.filesSeen;
  const coverage = ir.analysis.sourceCoverage ?? {};
  const sourceMix = `impl ${coverage.implementation ?? 0} · cfg ${coverage.config ?? 0} · test ${coverage.test ?? 0} · docs ${coverage.documentation ?? 0}`;
  scanMeta.replaceChildren(
    metaChip(`${ir.analysis.filesScanned}/${eligible} analyzable files sampled`),
    metaChip(sourceMix),
    metaChip(ir.analysis.scanComplete ? 'complete bounded scan' : 'partial bounded scan')
  );
  partialWarning.hidden = Boolean(ir.analysis.scanComplete);
  if (!partialWarning.hidden) partialWarning.textContent = `Partial scan: ${ir.analysis.filesScanned} of ${eligible} analyzable files were sampled with implementation/config/test/documentation weighting. Unseen evidence remains unknown.`;
  renderStory(ir); renderInspect(ir); renderSystem(ir);
  resultNode.hidden = false;
  resultNode.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}
function setBusy(busy, message = '') { analyzeButton.disabled = busy; analyzeButton.textContent = busy ? 'Analyzing…' : 'Analyze'; statusNode.textContent = message; }
function showError(message) { errorNode.textContent = message; errorNode.hidden = false; }
function clearError() { errorNode.hidden = true; errorNode.textContent = ''; }
form.addEventListener('submit', async (event) => {
  event.preventDefault(); clearError(); const repository = repositoryInput.value.trim(); if (!repository) return;
  setBusy(true, 'Discovering, binding and synthesizing repository evidence…');
  try {
    const response = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ repository }) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || `Analysis failed (${response.status}).`);
    render(payload.ir); statusNode.textContent = 'Analysis complete. Signals are bounded; unknowns stay explicit.';
  } catch (error) { showError(error?.message || 'Analysis failed.'); statusNode.textContent = ''; }
  finally { setBusy(false, statusNode.textContent); }
});
demoButton.addEventListener('click', () => { clearError(); repositoryInput.value = 'example/review-agent'; render(exampleIr()); statusNode.textContent = 'Example loaded. MAY is intentionally unknown to demonstrate CAN ≠ MAY.'; });
tabs.forEach((tab) => tab.addEventListener('click', () => { const view = tab.dataset.view; tabs.forEach((candidate) => { const selected = candidate === tab; candidate.classList.toggle('active', selected); candidate.setAttribute('aria-selected', String(selected)); }); storyView.hidden = view !== 'story'; inspectView.hidden = view !== 'inspect'; systemView.hidden = view !== 'system'; }));
