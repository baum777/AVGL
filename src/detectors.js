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
    patterns: [/\b(context|memory|retriev(?:e|al)?|rag|vector(?:store|db)?|knowledge|resource)\b/i]
  },
  {
    id: 'think.model-cognition',
    semanticClass: 'THINK',
    label: 'Model / planning / cognition',
    confidence: 0.78,
    evidenceState: 'INFERRED',
    patterns: [/\b(openai|anthropic|gemini|model|llm|planner|planning|reasoning|replan|subagent)\b/i]
  },
  {
    id: 'can.tool-surface',
    semanticClass: 'CAN',
    label: 'Tool / adapter surface',
    confidence: 0.76,
    evidenceState: 'INFERRED',
    patterns: [/\b(tool|tools|mcp|function_call|functionCall|tool_choice|toolChoice|browser|shell|adapter|connector)\b/i]
  },
  {
    id: 'may.authority-control',
    semanticClass: 'MAY',
    label: 'Policy / authorization control',
    confidence: 0.82,
    evidenceState: 'INFERRED',
    patterns: [/\b(policy|permission|approval|grant|authorize|authorized|revok(?:e|ed|ation)|scope)\b/i]
  },
  {
    id: 'act.effect-path',
    semanticClass: 'ACT',
    label: 'Execution / effect path',
    confidence: 0.78,
    evidenceState: 'INFERRED',
    patterns: [/\b(executor|execute|dispatch|send|write|commit|deploy|mutate|mutation)\b/i]
  },
  {
    id: 'did.evidence-verification',
    semanticClass: 'DID',
    label: 'Evidence / verification path',
    confidence: 0.82,
    evidenceState: 'INFERRED',
    patterns: [
      /\b(evidence|receipt|audit|verify|verification|reconcile|reconciliation|outcome|confirmation|attestation|proof|checksum|hash)\b/i,
      /\b(?:verifyReceipt|verifyArtifact|checkChecksum|reconcile|confirmTransaction|validateOutcome)\s*\(/i
    ]
  }
]);
