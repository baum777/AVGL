export function resolveAuthority(input = {}) {
  const text = `${input.path || ''} ${input.content || ''}`;

  const hasAuthoritySignals = /permission|policy|grant|approval|authorize/i.test(text);

  return {
    authority: hasAuthoritySignals
      ? 'authority-evidence-present'
      : 'reference-only-or-unknown',
    evidenceState: hasAuthoritySignals ? 'INFERRED' : 'UNKNOWN',
    invariant: 'CAN != MAY'
  };
}
