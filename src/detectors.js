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
      /\b(policy|permission|permissions|approval|approved|grant|grants|authorize|authorise|authorized|authorised|revok(?:e|ed|ing)|revocation|delegation|scope|scopes)\b/i,
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
      /\b(?:executor|runner|workflow|runtime|dispatcher)\.(?:execute|dispatch)\s*\(/i,
      /\b(?:mail|email|message|transport|client|channel|webhook|producer)\.(?:send|publish)\s*\(/i,
      /\b(?:sendMail|sendMessage)\s*\(/i,
      /\b(?:fs(?:\.promises)?\.)?(?:writeFile|writeFileSync|appendFile|appendFileSync|rename|unlink|rm)\s*\(/i,
      /\b(?:git|github|repo|repository|transaction|client)\.(?:commit|push)\s*\(/i,
      /\b(?:db|database|collection|repository|store)\.(?:insert|update|delete|upsert|mutate|save)\s*\(/i,
      /\b(?:provider|gateway|apiClient|remoteClient)\.(?:request|create|update|delete|refund|charge|cancel|submit|send|publish|post|put|patch)[A-Za-z_$\d]*\s*\(/i
    ]
  },
  {
    id: 'did.evidence-verification',
    semanticClass: 'DID',
    label: 'Evidence / verification path',
    confidence: 0.82,
    evidenceState: 'INFERRED',
    patterns: [
      /\b(evidence|receipt|audit|verify|verification|reconcile|reconciliation|outcome|checksum|hash|confirm|confirmation|attestation)\b/i,
      /\b(?:verifyReceipt|verifyDeployment|verifyArtifact|validateHash|checkChecksum|assertDatabaseState|checkState|compareCommittedState|compareState|recordEvidence|confirmTransaction|verifyWebhookSignature|validateConsistency)\s*\(/i
    ]
  }
]);
