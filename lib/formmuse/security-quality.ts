export type SecurityFinding = Readonly<{
  path: string;
  rule: string;
}>;

export type LicenseRecord = Readonly<{
  license: string;
  name: string;
  version: string;
}>;

type ContentRule = readonly [rule: string, matcher: RegExp];

const secretRules: readonly ContentRule[] = [
  ["private key", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  [
    "credential-shaped assignment",
    /(?:api[_-]?key|secret|token|password)\s*[:=]\s*["'][^"']{8,}["']/i,
  ],
  ["GitHub token", /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/],
  ["GitHub fine-grained token", /\bgithub_pat_[A-Za-z0-9_]{22,}\b/],
  ["npm token", /\bnpm_[A-Za-z0-9]{20,}\b/],
  ["OpenAI-style token", /\bsk-[A-Za-z0-9]{20,}\b/],
  ["Google API key", /\bAIza[A-Za-z0-9_-]{20,}\b/],
];

const distributedSourceRules: readonly ContentRule[] = [
  ["dynamic evaluation", /\beval\s*\(/],
  ["Function constructor", /\b(?:new\s+)?Function\s*\(/],
  ["dynamic module import", /\bimport\s*\(/],
  [
    "unsafe HTML rendering",
    /\b(?:dangerouslySetInnerHTML|innerHTML|insertAdjacentHTML)\b/,
  ],
  ["document write", /\bdocument\.write\s*\(/],
  [
    "template-initiated network API",
    /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b/,
  ],
  ["tracking image", /\bnew\s+Image\s*\(/],
  [
    "analytics or telemetry marker",
    /\b(?:analytics|gtag|dataLayer|plausible|posthog|umami)\b/i,
  ],
  [
    "remote resource URL",
    /\b(?:src|href|action)\s*=\s*(?:["']|\{\s*["'`])https?:\/\//i,
  ],
];

const staticExportRules: readonly ContentRule[] = [
  [
    "remote executable or media resource",
    /<(?:script|iframe|img|audio|video|source|link|form)\b[^>]*\b(?:src|href|action)=["']https?:\/\//i,
  ],
  [
    "analytics or telemetry resource",
    /<(?:script|img|iframe)\b[^>]*(?:googletagmanager|google-analytics|plausible|posthog|umami|clarity)/i,
  ],
];

function findingsFor(
  content: string,
  path: string,
  rules: readonly ContentRule[],
): SecurityFinding[] {
  return rules
    .filter(([, matcher]) => matcher.test(content))
    .map(([rule]) => ({ path, rule }));
}

export function secretFindings(
  content: string,
  path: string,
): SecurityFinding[] {
  return findingsFor(content, path, secretRules);
}

export function distributedSourceFindings(
  content: string,
  path: string,
): SecurityFinding[] {
  return [
    ...secretFindings(content, path),
    ...findingsFor(content, path, distributedSourceRules),
  ];
}

export function staticExportFindings(
  content: string,
  path: string,
): SecurityFinding[] {
  return [
    ...secretFindings(content, path),
    ...findingsFor(content, path, staticExportRules),
  ];
}

function isRecordedBuildOnlyLicenseException(record: LicenseRecord): boolean {
  return (
    record.license === "Unknown" &&
    record.name.startsWith("@yuku-analyzer/binding-") &&
    record.version === "0.6.12"
  );
}

export function unrecordedUnknownLicenseRecords(
  records: readonly LicenseRecord[],
): LicenseRecord[] {
  return records.filter(
    (record) =>
      record.license === "Unknown" &&
      !isRecordedBuildOnlyLicenseException(record),
  );
}

export function ownerReviewLicenseRecords(
  records: readonly LicenseRecord[],
): LicenseRecord[] {
  return records.filter(isRecordedBuildOnlyLicenseException);
}
