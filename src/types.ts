export type Severity = "error" | "warning" | "info";

export interface PatternViolation {
  rule: string;
  message: string;
  severity: Severity;
  line?: number;
  column?: number;
  suggestion?: string;
}

export interface NamingRules {
  enabled: boolean;
  severity: Severity;
  patterns: {
    classes: string;
    functions: string;
    constants: string;
    variables: string;
  };
}

export interface SolidRules {
  enabled: boolean;
  severity: Severity;
  maxFunctionLines: number;
  maxClassMethods: number;
  maxParameters: number;
}

export interface CodeSmellRules {
  enabled: boolean;
  severity: Severity;
  detectDuplication: boolean;
  detectLongMethods: boolean;
  detectGodClasses: boolean;
  detectDeadCode: boolean;
}

export interface PatternConfig {
  rules: {
    naming: NamingRules;
    solid: SolidRules;
    codeSmells: CodeSmellRules;
  };
}
