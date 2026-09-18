// Detectors generate lexical candidates only. Semantic acceptance/rejection belongs in semantic-resolution.js.
export const DETECTORS = Object.freeze([
  {
    id: 'who.agent-definition',
    semanticClass: 'WHO',
    label: 'Agent / harness definition',
    confidence: 0.72,
    evidenceState: 'INFERRED',
    patterns: [
      /\b(systemPrompt|system_prompt|instructions|agent|assistant|worker|role)\b/i,
      /\b(AGENTS\.md|harness)\b/i
    ]
  },
  {
    id: 'know.context-resource',
    semanticClass: 'KNOW',
    label: 'Context / memory / retrieval access',
    confidence: 0.74,
    evidenceState: 'INFERRED',
    patterns: [
      /\b(context|memory|retriev(?:e|al)?|rag|vector(?:store|db)?|knowledge|resource)\b/i
    ]
  },
  {
    id: 'think.model-cognition',
    semanticClass: 'THINK',
    label: 'Model / planning / cognition',
    confidence: 0.78,
    evidenceState: 'INFERRED',
    patterns: [
      /\b(openai|anthropic|gemini|model|llm|planner|planning|reasoning|replan|subagent)\b/i
    ]
  },
  {
    id: 'can.tool-surface',
    semanticClass: 'CAN',
    label: 'Tool / adapter surface',
    confidence: 0.76,
    evidenceState: 'INFERRED',
    patterns: [
      /\b(tool|tools|mcp|function_call|functionCall|tool_choice|toolChoice|browser|shell|adapter|connector)\b/i,
      /\b(registerTool|defineTool|createTool|McpServer|mcpServers|callTool|listTools|apiClient)\b/i,
      /\bclient\.request\b|\bfetch\s*\(/i
    ]
  },
  {
    id: 'may.authority-control',
    semanticClass: 'MAY',
    label: 'Policy / authorization control',
    confidence: 0.82,
    evidenceState: 'INFERRED',
    patterns: [
      /\b(policy|permission|permissions|approval|approved|grant|grants|authorize|authorise|authorized|authorised|revok(?:e|ed|ation)|delegation|scope|scopes)\b/i,
      /\b(requirePermission|checkPermission|hasPermission|assertPermission|requireApproval|approvalGate|evaluatePolicy|enforcePolicy|requireScope|checkScope|validateScope|issueGrant|createGrant|validateGrant|revokeGrant|isRevoked)\b/i
    ]
  },
  {
    id: 'act.effect-path',
    semanticClass: 'ACT',
    label: 'Execution / effect path',
    confidence: 0.78,
    evidenceState: 'INFERRED',
    patterns: [
      /\b(executor|execute|dispatch|send|write|commit|deploy|mutate|mutation)\b/i,
      /\b(?:git|github|repo|repository|client)\.push\s*\(/i
    ]
  },
  {
    id: 'did.evidence-verification',
    semanticClass: 'DID',
    label: 'Evidence / verification path',
    confidence: 0.82,
    evidenceState: 'INFERRED',
    patterns: [
      /\b(evidence|receipt|audit|verify|verification|reconcile|reconciliation|outcome)\b/i
    ]
  }
]);
