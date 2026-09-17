import { HUMAN_LABELS, SEMANTIC_CLASSES } from './constants.js';

function nodesFor(ir, semanticClass) { return ir.nodes.filter((node) => node.semanticClass === semanticClass); }
function areaFor(ir, semanticClass) { return ir.synthesis?.areas?.[semanticClass] ?? null; }
function evidenceSuffix(node) { const first = node.evidence[0]; return first ? ` — ${node.evidenceState.toLowerCase()} · ${first.path}:${first.line}` : ''; }

function section(ir, semanticClass) {
  const nodes = nodesFor(ir, semanticClass);
  const area = areaFor(ir, semanticClass);
  const heading = HUMAN_LABELS[semanticClass];
  if (nodes.length === 0) return `## ${heading}\n\nNicht belegt. AVGL hat dafür in diesem statischen Scan keine ausreichenden Hinweise gefunden.`;
  const families = area?.families?.length ? `\n\nErkannte Familien: ${area.families.map((family) => family.label).join(', ')}.` : '';
  const bullets = nodes.map((node) => `- ${node.label}${evidenceSuffix(node)}`).join('\n');
  return `## ${heading}\n\n${area?.summary ?? nodes[0].statement}${families}\n\n${bullets}`;
}

export function projectStory(ir) {
  const body = SEMANTIC_CLASSES.map((semanticClass) => section(ir, semanticClass)).join('\n\n');
  const unknown = ir.unknowns.length > 0 ? `\n\n> Offen / nicht belegt: ${ir.unknowns.join(', ')}` : '';
  return `# AVGL Story — ${ir.source.label}\n\n` +
    `AVGL zeigt zuerst die verständliche Systemgeschichte. Technische Details bleiben an Evidence gebunden und können später aufgeklappt werden.\n\n` + body + unknown;
}

export function projectHarnessCard(ir) {
  const rows = SEMANTIC_CLASSES.map((semanticClass) => {
    const area = areaFor(ir, semanticClass);
    const value = area?.status === 'EVIDENCED' ? area.summary : 'Nicht belegt';
    return `| ${semanticClass} | ${HUMAN_LABELS[semanticClass]} | ${value} |`;
  }).join('\n');
  return `# Harness Card — ${ir.source.label}\n\n` +
    `| AVGL | Menschliche Frage | Erkannter Stand |\n|---|---|---|\n${rows}\n\n` +
    `**Wichtig:** Ein erkannter Tool-Pfad (CAN) ist keine nachgewiesene Berechtigung (MAY).`;
}

export function projectJson(ir) { return JSON.stringify(ir, null, 2); }
