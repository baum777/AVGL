import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { classifyDiscoveries, discoverFiles } from '../src/index.js';

const canonicalCanvasFixture = new URL('./fixtures/semantic-resolution/canvas-context-negative.mjs', import.meta.url);
const canonicalWhoNegativeFixture = new URL('./fixtures/semantic-resolution/who-non-agent-negative.mjs', import.meta.url);
const canonicalThinkNegativeFixture = new URL('./fixtures/semantic-resolution/think-non-cognition-negative.mjs', import.meta.url);
const canonicalCanNegativeFixture = new URL('./fixtures/semantic-resolution/can-non-capability-negative.mjs', import.meta.url);
const canonicalMayNegativeFixture = new URL('./fixtures/semantic-resolution/may-non-authority-negative.mjs', import.meta.url);
const canonicalMayScopeRevocationNegativeFixture = new URL('./fixtures/semantic-resolution/may-scope-revocation-negative.mjs', import.meta.url);
const canonicalActNegativeFixture = new URL('./fixtures/semantic-resolution/act-non-effect-negative.mjs', import.meta.url);
const canonicalDidNegativeFixture = new URL('./fixtures/semantic-resolution/did-non-verification-negative.mjs', import.meta.url);

test('canonical negative fixture rejects Canvas 2D context as agentic KNOW evidence', async () => {
  const content = await readFile(canonicalCanvasFixture, 'utf8');
  const discovery = discoverFiles([{
    path: 'examples/snake/snake.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  const know = discovery.observations.filter((item) => item.candidateClass === 'KNOW');
  assert.equal(know.length, 0);
  assert.ok(discovery.semanticResolution.rejected >= 3);
  assert.ok(discovery.semanticRejections.some((item) => item.rule === 'canvas-rendering-context'));
});

test('semantic resolver accepts explicit runtime context APIs and preserves provenance', () => {
  const content = `
    export function createRunContext(messages, memory) {
      const context = { messages, memory, tools: [] };
      return context;
    }
  `;

  const discovery = discoverFiles([{
    path: 'runtime/kernel/runtime-context.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  const know = discovery.observations.find((item) => item.candidateClass === 'KNOW');
  assert.ok(know);
  assert.equal(know.semanticResolution.mode, 'SEMANTIC');
  assert.equal(know.semanticResolution.resolver, 'know.context.v1');

  const classified = classifyDiscoveries(discovery);
  const claim = classified.classifications.find((item) => item.semanticClass === 'KNOW');
  assert.ok(claim);
  assert.equal(claim.evidence[0].semanticResolution.mode, 'SEMANTIC');
  assert.match(claim.evidence[0].semanticResolution.rule, /context|memory/);
});

test('generic context tokens fail closed instead of becoming KNOW by word match alone', () => {
  const content = `
    export function normalize(value) {
      const context = {};
      return { value, context };
    }
  `;

  const discovery = discoverFiles([{
    path: 'src/normalize.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  assert.equal(discovery.observations.some((item) => item.candidateClass === 'KNOW'), false);
  assert.ok(discovery.semanticRejections.some((item) => item.rule === 'unresolved-context-token'));
});

test('canonical WHO negative fixture rejects User-Agent, UI role, and browser Worker', async () => {
  const content = await readFile(canonicalWhoNegativeFixture, 'utf8');
  const discovery = discoverFiles([{
    path: 'web/client.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  const who = discovery.observations.filter((item) => item.candidateClass === 'WHO');
  assert.equal(who.length, 0);
  const rules = new Set(discovery.semanticRejections.filter((item) => item.candidateClass === 'WHO').map((item) => item.rule));
  assert.equal(rules.has('http-user-agent'), true);
  assert.equal(rules.has('ui-role'), true);
  assert.equal(rules.has('browser-worker'), true);
});

test('WHO accepts structured agent definitions and preserves semantic provenance', () => {
  const content = `
    export const agent = {
      role: 'reviewer',
      instructions: 'Review the repository',
      model,
      tools: [runTests]
    };
  `;
  const discovery = discoverFiles([{
    path: 'src/agents/reviewer.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  const who = discovery.observations.find((item) => item.candidateClass === 'WHO');
  assert.ok(who);
  assert.equal(who.semanticResolution.mode, 'SEMANTIC');
  assert.equal(who.semanticResolution.resolver, 'who.actor.v1');
  assert.match(who.semanticResolution.rule, /actor|agent|harness/);
});

test('generic worker or role tokens fail closed without agentic support', () => {
  const content = `
    const worker = queue.next();
    const role = account.role;
  `;
  const discovery = discoverFiles([{
    path: 'src/queue.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  assert.equal(discovery.observations.some((item) => item.candidateClass === 'WHO'), false);
  assert.ok(discovery.semanticRejections.some((item) => item.rule === 'unresolved-actor-token'));
});

test('canonical THINK negative fixture rejects ORM models, route planners, project planning, and generic reasoning prose', async () => {
  const content = await readFile(canonicalThinkNegativeFixture, 'utf8');
  const discovery = discoverFiles([{
    path: 'src/domain/planning.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  const think = discovery.observations.filter((item) => item.candidateClass === 'THINK');
  assert.equal(think.length, 0);

  const rules = new Set(
    discovery.semanticRejections
      .filter((item) => item.candidateClass === 'THINK')
      .map((item) => item.rule)
  );

  assert.equal(rules.has('data-or-orm-model'), true);
  assert.equal(rules.has('generic-planner-class'), true);
  assert.equal(rules.has('non-agentic-planning'), true);
  assert.equal(rules.has('unresolved-cognition-token'), true);
});

test('THINK accepts explicit LLM invocation and preserves semantic provenance', () => {
  const content = [
    'const response = await openai.responses.create({',
    "  model: 'gpt-5.6',",
    '  input: messages',
    '});'
  ].join('\n');

  const discovery = discoverFiles([{
    path: 'runtime/model/openai-adapter.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  const think = discovery.observations.find((item) => item.candidateClass === 'THINK');
  assert.ok(think);
  assert.equal(think.semanticResolution.mode, 'SEMANTIC');
  assert.equal(think.semanticResolution.resolver, 'think.cognition.v1');
  assert.equal(think.semanticResolution.rule, 'llm-model-invocation');
});

test('THINK accepts recognized LLM model configuration', () => {
  const content = "export const runtime = { model: 'claude-sonnet-4-5' };";
  const discovery = discoverFiles([{
    path: 'runtime/model/config.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  const think = discovery.observations.find((item) => item.candidateClass === 'THINK');
  assert.ok(think);
  assert.equal(think.semanticResolution.resolver, 'think.cognition.v1');
  assert.equal(think.semanticResolution.rule, 'explicit-llm-model-config');
});

test('THINK accepts planning only when coupled to agentic runtime semantics', () => {
  const content = [
    'export function planner(agent, workflow, model) {',
    '  return planning({ agent, workflow, model, prompt: agent.prompt });',
    '}'
  ].join('\n');

  const discovery = discoverFiles([{
    path: 'runtime/planner/agent-planner.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  const think = discovery.observations.find((item) => item.candidateClass === 'THINK');
  assert.ok(think);
  assert.equal(think.semanticResolution.resolver, 'think.cognition.v1');
  assert.equal(think.semanticResolution.rule, 'agentic-cognition-orchestration');
});

test('generic model tokens fail closed without LLM/runtime support', () => {
  const content = 'const model = catalog.model;';
  const discovery = discoverFiles([{
    path: 'src/catalog.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  assert.equal(discovery.observations.some((item) => item.candidateClass === 'THINK'), false);
  assert.ok(discovery.semanticRejections.some((item) => item.rule === 'unresolved-model-token'));
});

test('canonical CAN negative fixture rejects domain tools, browser metadata, UI shells, and diagram connectors', async () => {
  const content = await readFile(canonicalCanNegativeFixture, 'utf8');
  const discovery = discoverFiles([{
    path: 'src/ui/presentation.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  const can = discovery.observations.filter((item) => item.candidateClass === 'CAN');
  assert.equal(can.length, 0);

  const rules = new Set(
    discovery.semanticRejections
      .filter((item) => item.candidateClass === 'CAN')
      .map((item) => item.rule)
  );

  assert.equal(rules.has('generic-domain-tool'), true);
  assert.equal(rules.has('browser-metadata'), true);
  assert.equal(rules.has('ui-layout-shell'), true);
  assert.equal(rules.has('diagram-connector'), true);
});

test('CAN accepts explicit MCP tool surfaces and preserves semantic provenance', () => {
  const content = [
    "import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';",
    "const server = new McpServer({ name: 'avgl' });",
    "server.tool('scan_repo', {}, async () => ({ content: [] }));"
  ].join('\n');

  const discovery = discoverFiles([{
    path: 'src/mcp/server.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  const can = discovery.observations.find((item) => item.candidateClass === 'CAN');
  assert.ok(can);
  assert.equal(can.semanticResolution.mode, 'SEMANTIC');
  assert.equal(can.semanticResolution.resolver, 'can.capability.v1');
  assert.equal(can.semanticResolution.rule, 'explicit-mcp-capability');

  const classified = classifyDiscoveries(discovery);
  const claim = classified.classifications.find((item) => item.semanticClass === 'CAN');
  assert.ok(claim);
  assert.equal(claim.evidence[0].semanticResolution.resolver, 'can.capability.v1');
});

test('CAN accepts explicit agent tool configuration without implying MAY or ACT', () => {
  const content = [
    'export const agent = {',
    "  model: 'gpt-5.6',",
    "  prompt: 'Review repository',",
    '  tools: [searchRepo, readFile]',
    '};'
  ].join('\n');

  const discovery = discoverFiles([{
    path: 'src/agents/reviewer.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  const can = discovery.observations.find((item) => item.candidateClass === 'CAN');
  assert.ok(can);
  assert.equal(can.semanticResolution.rule, 'explicit-tool-surface');
  assert.equal(discovery.observations.some((item) => item.candidateClass === 'MAY'), false);
  assert.equal(discovery.observations.some((item) => item.candidateClass === 'ACT'), false);
});

test('CAN treats fetch as static network reachability, not permission or execution proof', () => {
  const content = "const response = await fetch(endpoint);";
  const discovery = discoverFiles([{
    path: 'src/tools/http-client.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  const can = discovery.observations.find((item) => item.candidateClass === 'CAN');
  assert.ok(can);
  assert.equal(can.semanticResolution.resolver, 'can.capability.v1');
  assert.equal(can.semanticResolution.rule, 'network-client-reachability');
  assert.match(can.semanticResolution.reason, /does not prove permission or runtime execution/);
});

test('CAN accepts concrete browser automation surfaces', () => {
  const content = 'const browser = await chromium.launch();';
  const discovery = discoverFiles([{
    path: 'src/tools/browser-tool.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  const can = discovery.observations.find((item) => item.candidateClass === 'CAN');
  assert.ok(can);
  assert.equal(can.semanticResolution.rule, 'browser-automation-surface');
});

test('generic capability words in documentation fail closed', () => {
  const content = 'This tool uses a browser adapter and connector.';
  const discovery = discoverFiles([{
    path: 'docs/capabilities.md',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  assert.equal(discovery.observations.some((item) => item.candidateClass === 'CAN'), false);
  assert.ok(discovery.semanticRejections.some((item) => item.rule === 'unresolved-adapter-connector' || item.rule === 'unresolved-capability-token'));
});

test('canonical MAY negatives reject policy, funding grant, approval metric, generic scope, and certificate revocation', async () => {
  const [contentA, contentB] = await Promise.all([
    readFile(canonicalMayNegativeFixture, 'utf8'),
    readFile(canonicalMayScopeRevocationNegativeFixture, 'utf8')
  ]);

  const discovery = discoverFiles([
    { path: 'src/domain/governance-words.mjs', content: contentA, size: Buffer.byteLength(contentA, 'utf8') },
    { path: 'src/domain/scope-words.mjs', content: contentB, size: Buffer.byteLength(contentB, 'utf8') }
  ]);

  assert.equal(discovery.observations.some((item) => item.candidateClass === 'MAY'), false);
  const rules = new Set(
    discovery.semanticRejections
      .filter((item) => item.candidateClass === 'MAY')
      .map((item) => item.rule)
  );
  assert.equal(rules.has('privacy-or-editorial-policy'), true);
  assert.equal(rules.has('research-or-financial-grant'), true);
  assert.equal(rules.has('approval-rating'), true);
  assert.equal(rules.has('generic-program-scope'), true);
  assert.equal(rules.has('certificate-revocation'), true);
});

test('MAY accepts explicit permission binding and preserves semantic provenance', () => {
  const content = [
    'export function authorizeAction(permission, subject, action) {',
    '  if (!permissions.has(permission)) throw new Error("denied");',
    '  return { subject, action };',
    '}'
  ].join('\n');

  const discovery = discoverFiles([{
    path: 'src/authority/permissions.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);
  const may = discovery.observations.find((item) => item.candidateClass === 'MAY');
  assert.ok(may);
  assert.equal(may.semanticResolution.mode, 'SEMANTIC');
  assert.equal(may.semanticResolution.resolver, 'may.authority.v1');
  assert.equal(may.semanticResolution.rule, 'permission-binding');

  const classified = classifyDiscoveries(discovery);
  const claim = classified.classifications.find((item) => item.semanticClass === 'MAY');
  assert.ok(claim);
  assert.equal(claim.evidence[0].semanticResolution.resolver, 'may.authority.v1');
});

test('MAY accepts executable policy authorization enforcement', () => {
  const content = 'const allowed = policy.enforce(subject, action, resource);';
  const discovery = discoverFiles([{
    path: 'src/policy/enforce.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);
  const may = discovery.observations.find((item) => item.candidateClass === 'MAY');
  assert.ok(may);
  assert.equal(may.semanticResolution.rule, 'policy-authorization-enforcement');
});

test('MAY accepts approval gates tied to runtime operations', () => {
  const content = 'await requireApproval({ workflow, action, subject });';
  const discovery = discoverFiles([{
    path: 'src/approvals/runtime-gate.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);
  const may = discovery.observations.find((item) => item.candidateClass === 'MAY');
  assert.ok(may);
  assert.equal(may.semanticResolution.rule, 'approval-gate');
});

test('MAY accepts authority grant lifecycle surfaces', () => {
  const content = 'const valid = validateGrant(grantToken);';
  const discovery = discoverFiles([{
    path: 'src/grants/validate.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);
  const may = discovery.observations.find((item) => item.candidateClass === 'MAY');
  assert.ok(may);
  assert.equal(may.semanticResolution.rule, 'authority-grant-lifecycle');
});

test('MAY accepts authority scope enforcement', () => {
  const content = 'requireScope(subject, requiredScope);';
  const discovery = discoverFiles([{
    path: 'src/scopes/enforce.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);
  const may = discovery.observations.find((item) => item.candidateClass === 'MAY');
  assert.ok(may);
  assert.equal(may.semanticResolution.rule, 'authority-scope-enforcement');
});

test('MAY accepts authority revocation without implying ACT or DID', () => {
  const content = 'revokeGrant(grantId);';
  const discovery = discoverFiles([{
    path: 'src/grants/revocation.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);
  const may = discovery.observations.find((item) => item.candidateClass === 'MAY');
  assert.ok(may);
  assert.equal(may.semanticResolution.rule, 'authority-revocation');
  assert.equal(discovery.observations.some((item) => item.candidateClass === 'ACT'), false);
  assert.equal(discovery.observations.some((item) => item.candidateClass === 'DID'), false);
});

test('generic authority vocabulary fails closed even in implementation code', () => {
  const content = 'const permission = policy.permission; const scope = request.scope;';
  const discovery = discoverFiles([{
    path: 'src/runtime.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);
  assert.equal(discovery.observations.some((item) => item.candidateClass === 'MAY'), false);
  assert.ok(discovery.semanticRejections.some((item) => item.rule === 'unresolved-authority-token'));
});

test('canonical ACT negative fixture rejects references and definition-only execution vocabulary', async () => {
  const content = await readFile(canonicalActNegativeFixture, 'utf8');
  const discovery = discoverFiles([{
    path: 'src/domain/effect-words.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  assert.equal(discovery.observations.some((item) => item.candidateClass === 'ACT'), false);
  const rules = new Set(
    discovery.semanticRejections
      .filter((item) => item.candidateClass === 'ACT')
      .map((item) => item.rule)
  );
  assert.equal(rules.has('generic-effect-reference'), true);
  assert.equal(rules.has('effect-definition-only'), true);
});

test('ACT accepts filesystem writes and preserves semantic provenance without implying DID', () => {
  const content = "await fs.writeFile(targetPath, body);";
  const discovery = discoverFiles([{
    path: 'src/effects/file-writer.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  const act = discovery.observations.find((item) => item.candidateClass === 'ACT');
  assert.ok(act);
  assert.equal(act.semanticResolution.mode, 'SEMANTIC');
  assert.equal(act.semanticResolution.resolver, 'act.effect.v1');
  assert.equal(act.semanticResolution.rule, 'filesystem-write-effect');
  assert.equal(discovery.observations.some((item) => item.candidateClass === 'DID'), false);

  const classified = classifyDiscoveries(discovery);
  const claim = classified.classifications.find((item) => item.semanticClass === 'ACT');
  assert.ok(claim);
  assert.equal(claim.evidence[0].semanticResolution.resolver, 'act.effect.v1');
});

test('ACT accepts concrete message send effects', () => {
  const content = 'await mail.send(message);';
  const discovery = discoverFiles([{
    path: 'src/messaging/send-mail.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);
  const act = discovery.observations.find((item) => item.candidateClass === 'ACT');
  assert.ok(act);
  assert.equal(act.semanticResolution.rule, 'message-send-effect');
});

test('ACT accepts repository push and commit effects', () => {
  const content = 'await repo.push(remote);';
  const discovery = discoverFiles([{
    path: 'src/git/push.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);
  const act = discovery.observations.find((item) => item.candidateClass === 'ACT');
  assert.ok(act);
  assert.equal(act.semanticResolution.rule, 'repository-commit-effect');
});

test('ACT accepts deployment effects only with execution context', () => {
  const content = 'await deploy(release);';
  const discovery = discoverFiles([{
    path: 'src/runtime/deployment/apply.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);
  const act = discovery.observations.find((item) => item.candidateClass === 'ACT');
  assert.ok(act);
  assert.equal(act.semanticResolution.rule, 'deployment-effect');
});

test('ACT accepts database mutation effects', () => {
  const content = 'await db.update(record);';
  const discovery = discoverFiles([{
    path: 'src/effects/database/update.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);
  const act = discovery.observations.find((item) => item.candidateClass === 'ACT');
  assert.ok(act);
  assert.equal(act.semanticResolution.rule, 'mutation-effect');
});

test('ACT accepts runtime executor calls', () => {
  const content = 'await executor.execute(workOrder);';
  const discovery = discoverFiles([{
    path: 'src/runtime/executor/commit.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);
  const act = discovery.observations.find((item) => item.candidateClass === 'ACT');
  assert.ok(act);
  assert.equal(act.semanticResolution.rule, 'execution-dispatch-path');
});

test('generic execute calls fail closed outside runtime/effect context', () => {
  const content = 'execute(value);';
  const discovery = discoverFiles([{
    path: 'src/math/apply.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);
  assert.equal(discovery.observations.some((item) => item.candidateClass === 'ACT'), false);
  assert.ok(discovery.semanticRejections.some((item) => item.rule === 'unresolved-execution-call'));
});

test('documentation and test callsites do not establish production ACT', () => {
  const docs = 'Use send to dispatch the message.';
  const testCode = 'await executor.execute(workOrder);';
  const discovery = discoverFiles([
    { path: 'docs/execution.md', content: docs, size: Buffer.byteLength(docs, 'utf8') },
    { path: 'test/executor.test.mjs', content: testCode, size: Buffer.byteLength(testCode, 'utf8') }
  ]);
  assert.equal(discovery.observations.some((item) => item.candidateClass === 'ACT'), false);
  const rules = new Set(discovery.semanticRejections.filter((item) => item.candidateClass === 'ACT').map((item) => item.rule));
  assert.equal(rules.has('documentation-effect-mention'), true);
  assert.equal(rules.has('test-only-effect-path'), true);
});

test('canonical DID negative fixture rejects receipts, logs, audit entries, execution, commits, and success values without verification', async () => {
  const content = await readFile(canonicalDidNegativeFixture, 'utf8');
  const discovery = discoverFiles([{
    path: 'src/runtime/evidence.mjs',
    content,
    size: Buffer.byteLength(content, 'utf8')
  }]);

  assert.equal(discovery.observations.some((item) => item.candidateClass === 'DID'), false);
  const rules = new Set(
    discovery.semanticRejections
      .filter((item) => item.candidateClass === 'DID')
      .map((item) => item.rule)
  );
  assert.equal(rules.has('evidence-metadata-creation'), true);
  assert.equal(rules.has('logging-not-proof'), true);
  assert.equal(rules.has('execution-not-verification'), true);
});

test('DID accepts explicit receipt verification with semantic provenance', () => {
  const content = 'verifyReceipt(receipt);';
  const discovery = discoverFiles([{ path: 'src/evidence/receipt.mjs', content, size: Buffer.byteLength(content, 'utf8') }]);
  const did = discovery.observations.find((item) => item.candidateClass === 'DID');
  assert.ok(did);
  assert.equal(did.semanticResolution.mode, 'SEMANTIC');
  assert.equal(did.semanticResolution.resolver, 'did.evidence.v1');
  assert.equal(did.semanticResolution.rule, 'execution-receipt');
});

test('DID accepts artifact verification', () => {
  const content = 'checkChecksum(hash);';
  const discovery = discoverFiles([{ path: 'src/evidence/artifact.mjs', content, size: Buffer.byteLength(content, 'utf8') }]);
  const did = discovery.observations.find((item) => item.candidateClass === 'DID');
  assert.ok(did);
  assert.equal(did.semanticResolution.rule, 'artifact-verification');
});

test('DID accepts state verification', () => {
  const content = 'verifyDeployment(id);';
  const discovery = discoverFiles([{ path: 'src/evidence/state.mjs', content, size: Buffer.byteLength(content, 'utf8') }]);
  const did = discovery.observations.find((item) => item.candidateClass === 'DID');
  assert.ok(did);
  assert.equal(did.semanticResolution.rule, 'state-verification');
});

test('DID accepts reconciliation proof', () => {
  const content = 'reconcile(expected, actual);';
  const discovery = discoverFiles([{ path: 'src/evidence/reconcile.mjs', content, size: Buffer.byteLength(content, 'utf8') }]);
  const did = discovery.observations.find((item) => item.candidateClass === 'DID');
  assert.ok(did);
  assert.equal(did.semanticResolution.rule, 'reconciliation-proof');
});

test('DID accepts external confirmation', () => {
  const content = 'provider.confirm(transactionId);';
  const discovery = discoverFiles([{ path: 'src/evidence/provider.mjs', content, size: Buffer.byteLength(content, 'utf8') }]);
  const did = discovery.observations.find((item) => item.candidateClass === 'DID');
  assert.ok(did);
  assert.equal(did.semanticResolution.rule, 'external-confirmation');
});

test('DID accepts audit evidence only when result or outcome evidence exists', () => {
  const content = [
    'recordEvidence({',
    '  actor,',
    '  event,',
    '  result,',
    '  timestamp',
    '});'
  ].join('\n');
  const discovery = discoverFiles([{ path: 'src/evidence/audit.mjs', content, size: Buffer.byteLength(content, 'utf8') }]);
  const did = discovery.observations.find((item) => item.candidateClass === 'DID');
  assert.ok(did);
  assert.equal(did.semanticResolution.rule, 'audit-evidence');
});

test('ACT remains distinct from DID', () => {
  const content = 'await executor.execute(workOrder);';
  const discovery = discoverFiles([{ path: 'src/runtime/executor/run.mjs', content, size: Buffer.byteLength(content, 'utf8') }]);
  assert.ok(discovery.observations.find((item) => item.candidateClass === 'ACT'));
  assert.equal(discovery.observations.some((item) => item.candidateClass === 'DID'), false);
});
