export const SEMANTIC_CLASSES = Object.freeze([
  'WHO',
  'KNOW',
  'THINK',
  'CAN',
  'MAY',
  'ACT',
  'DID'
]);

export const EVIDENCE_STATES = Object.freeze([
  'EXPLICIT',
  'INFERRED',
  'OBSERVED',
  'UNKNOWN'
]);

export const HUMAN_LABELS = Object.freeze({
  WHO: 'Wer arbeitet hier?',
  KNOW: 'Womit arbeitet das System?',
  THINK: 'Wie denkt oder plant es?',
  CAN: 'Was kann es technisch erreichen?',
  MAY: 'Was darf es?',
  ACT: 'Was kann reale Wirkung erzeugen?',
  DID: 'Wie wird das Ergebnis nachgewiesen?'
});

export const DEFAULT_EXCLUDED_DIRECTORIES = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.next',
  '.venv',
  'venv',
  '__pycache__',
  'vendor'
]);

export const TEXT_EXTENSIONS = new Set([
  '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.py', '.go', '.rs', '.java',
  '.kt', '.rb', '.php', '.md', '.json', '.yaml', '.yml', '.toml', '.ini', '.txt'
]);

export const TEXT_FILENAMES = new Set([
  'Dockerfile', 'Makefile', 'Procfile', 'AGENTS.md', 'README.md'
]);

export const MAX_FILE_BYTES = 512 * 1024;
