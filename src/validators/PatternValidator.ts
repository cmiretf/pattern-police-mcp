import { parse } from "@typescript-eslint/typescript-estree";
import {
  PatternConfig,
  PatternViolation,
  Severity,
} from "../types.js";
import type { TSESTree } from "@typescript-eslint/typescript-estree";

export class PatternValidator {
  private config: PatternConfig;

  constructor(config: PatternConfig) {
    this.config = config;
  }

  getConfig(): PatternConfig {
    return this.config;
  }

  validateCode(code: string, filename: string): PatternViolation[] {
    const violations: PatternViolation[] = [];

    try {
      const ast = parse(code, {
        loc: true,
        range: true,
        comment: false,
      });

      violations.push(...this.validateNamingAST(ast));
      violations.push(...this.validateSOLIDAST(ast, code));
      violations.push(...this.validateCodeSmells(code, ast));
    } catch (error) {
      violations.push({
        rule: "parse-error",
        message: `Error al parsear el código: ${error instanceof Error ? error.message : "Error desconocido"}`,
        severity: "warning",
        suggestion: "Verifica la sintaxis del código",
      });
    }

    return violations;
  }

  private validateNamingAST(ast: TSESTree.Program): PatternViolation[] {
    if (!this.config.rules.naming.enabled) return [];

    const violations: PatternViolation[] = [];

    const visit = (node: TSESTree.Node) => {
      if (node.type === "ClassDeclaration" && node.id) {
        const className = node.id.name;
        if (!/^[A-Z][a-zA-Z0-9]*$/.test(className)) {
          violations.push({
            rule: "naming-class-pascalcase",
            message: `La clase '${className}' debe usar PascalCase`,
            severity: this.config.rules.naming.severity,
            line: node.loc?.start.line,
            column: node.loc?.start.column,
            suggestion: `Renombrar a '${this.toPascalCase(className)}'`,
          });
        }
      }

      if (node.type === "FunctionDeclaration" && node.id) {
        const funcName = node.id.name;
        if (!/^[a-z][a-zA-Z0-9]*$/.test(funcName)) {
          violations.push({
            rule: "naming-function-camelcase",
            message: `La función '${funcName}' debe usar camelCase`,
            severity: this.config.rules.naming.severity,
            line: node.loc?.start.line,
            column: node.loc?.start.column,
            suggestion: `Renombrar a '${this.toCamelCase(funcName)}'`,
          });
        }
      }

      if (
        node.type === "MethodDefinition" &&
        node.key.type === "Identifier" &&
        node.kind === "method"
      ) {
        const methodName = node.key.name;
        if (!/^[a-z][a-zA-Z0-9]*$/.test(methodName) && methodName !== "constructor") {
          violations.push({
            rule: "naming-method-camelcase",
            message: `El método '${methodName}' debe usar camelCase`,
            severity: this.config.rules.naming.severity,
            line: node.loc?.start.line,
            column: node.loc?.start.column,
            suggestion: `Renombrar a '${this.toCamelCase(methodName)}'`,
          });
        }
      }

      if (
        node.type === "VariableDeclaration" &&
        node.kind === "const"
      ) {
        for (const declarator of node.declarations) {
          if (declarator.id.type === "Identifier") {
            const constName = declarator.id.name;
            const isUpperCase = constName === constName.toUpperCase();
            const isCamelCase = /^[a-z][a-zA-Z0-9]*$/.test(constName);

            if (!isUpperCase && !isCamelCase && constName.includes("_")) {
              violations.push({
                rule: "naming-const-convention",
                message: `La constante '${constName}' debería usar camelCase o UPPER_CASE`,
                severity: "info" as Severity,
                line: declarator.loc?.start.line,
                column: declarator.loc?.start.column,
                suggestion: `Usar camelCase para valores o UPPER_CASE para constantes globales`,
              });
            }
          }
        }
      }

      for (const key in node) {
        const child = (node as any)[key];
        if (child && typeof child === "object") {
          if (Array.isArray(child)) {
            child.forEach((c) => c && typeof c === "object" && visit(c));
          } else if (child.type) {
            visit(child);
          }
        }
      }
    };

    visit(ast);
    return violations;
  }

  private validateSOLIDAST(ast: TSESTree.Program, code: string): PatternViolation[] {
    if (!this.config.rules.solid.enabled) return [];

    const violations: PatternViolation[] = [];

    const visit = (node: TSESTree.Node) => {
      if (node.type === "FunctionDeclaration" || node.type === "FunctionExpression" || node.type === "ArrowFunctionExpression") {
        const params = node.params.length;
        if (params > this.config.rules.solid.maxParameters) {
          const name = node.type === "FunctionDeclaration" && node.id ? node.id.name : "función anónima";
          violations.push({
            rule: "solid-too-many-parameters",
            message: `La función '${name}' tiene ${params} parámetros (máx: ${this.config.rules.solid.maxParameters})`,
            severity: this.config.rules.solid.severity,
            line: node.loc?.start.line,
            column: node.loc?.start.column,
            suggestion: `Considera usar un objeto de opciones o dividir la función`,
          });
        }

        if (this.config.rules.codeSmells.detectLongMethods && node.loc) {
          const functionLength = node.loc.end.line - node.loc.start.line;
          if (functionLength > this.config.rules.solid.maxFunctionLines) {
            const name = node.type === "FunctionDeclaration" && node.id ? node.id.name : "función anónima";
            violations.push({
              rule: "solid-function-too-long",
              message: `La función '${name}' tiene ${functionLength} líneas (máx: ${this.config.rules.solid.maxFunctionLines})`,
              severity: this.config.rules.solid.severity,
              line: node.loc.start.line,
              column: node.loc.start.column,
              suggestion: `Divide esta función en funciones más pequeñas y específicas`,
            });
          }
        }
      }

      if (node.type === "MethodDefinition" && node.value.type === "FunctionExpression") {
        const params = node.value.params.length;
        if (params > this.config.rules.solid.maxParameters) {
          const name = node.key.type === "Identifier" ? node.key.name : "método";
          violations.push({
            rule: "solid-too-many-parameters",
            message: `El método '${name}' tiene ${params} parámetros (máx: ${this.config.rules.solid.maxParameters})`,
            severity: this.config.rules.solid.severity,
            line: node.loc?.start.line,
            column: node.loc?.start.column,
            suggestion: `Considera usar un objeto de opciones o dividir el método`,
          });
        }

        if (this.config.rules.codeSmells.detectLongMethods && node.value.loc) {
          const methodLength = node.value.loc.end.line - node.value.loc.start.line;
          if (methodLength > this.config.rules.solid.maxFunctionLines) {
            const name = node.key.type === "Identifier" ? node.key.name : "método";
            violations.push({
              rule: "solid-method-too-long",
              message: `El método '${name}' tiene ${methodLength} líneas (máx: ${this.config.rules.solid.maxFunctionLines})`,
              severity: this.config.rules.solid.severity,
              line: node.value.loc.start.line,
              column: node.value.loc.start.column,
              suggestion: `Divide este método en métodos más pequeños y específicos`,
            });
          }
        }
      }

      if (node.type === "ClassDeclaration" && this.config.rules.codeSmells.detectGodClasses) {
        const methodCount = node.body.body.filter(
          (member) => member.type === "MethodDefinition" && member.kind === "method"
        ).length;

        if (methodCount > this.config.rules.solid.maxClassMethods) {
          const className = node.id ? node.id.name : "clase anónima";
          violations.push({
            rule: "solid-god-class",
            message: `La clase '${className}' tiene ${methodCount} métodos (máx: ${this.config.rules.solid.maxClassMethods})`,
            severity: this.config.rules.solid.severity,
            line: node.loc?.start.line,
            column: node.loc?.start.column,
            suggestion: `Considera dividir esta clase aplicando Single Responsibility Principle`,
          });
        }
      }

      for (const key in node) {
        const child = (node as any)[key];
        if (child && typeof child === "object") {
          if (Array.isArray(child)) {
            child.forEach((c) => c && typeof c === "object" && visit(c));
          } else if (child.type) {
            visit(child);
          }
        }
      }
    };

    visit(ast);
    return violations;
  }

  private validateCodeSmells(code: string, ast: TSESTree.Program): PatternViolation[] {
    if (!this.config.rules.codeSmells.enabled) return [];

    const violations: PatternViolation[] = [];

    if (this.config.rules.codeSmells.detectDeadCode) {
      const declaredVars = new Map<string, { line: number; column: number }>();
      const usedVars = new Set<string>();

      const collectDeclarations = (node: TSESTree.Node) => {
        if (node.type === "VariableDeclaration") {
          for (const declarator of node.declarations) {
            if (declarator.id.type === "Identifier") {
              declaredVars.set(declarator.id.name, {
                line: declarator.loc?.start.line || 0,
                column: declarator.loc?.start.column || 0,
              });
            }
          }
        }

        for (const key in node) {
          const child = (node as any)[key];
          if (child && typeof child === "object") {
            if (Array.isArray(child)) {
              child.forEach((c) => c && typeof c === "object" && collectDeclarations(c));
            } else if (child.type) {
              collectDeclarations(child);
            }
          }
        }
      };

      const collectUsages = (node: TSESTree.Node, parent?: TSESTree.Node, key?: string) => {
        if (node.type === "Identifier" && declaredVars.has(node.name)) {
          const isDeclaration = parent?.type === "VariableDeclarator" && key === "id";
          const isPropertyKey = parent?.type === "Property" && key === "key" && (parent as any).computed === false;
          const isMethodName = parent?.type === "MethodDefinition" && key === "key";
          const isMemberProperty = parent?.type === "MemberExpression" && key === "property" && (parent as any).computed === false;
          const isLabel = parent?.type === "LabeledStatement" && key === "label";
          
          if (!isDeclaration && !isPropertyKey && !isMethodName && !isMemberProperty && !isLabel) {
            usedVars.add(node.name);
          }
        }

        for (const childKey in node) {
          const child = (node as any)[childKey];
          if (child && typeof child === "object") {
            if (Array.isArray(child)) {
              child.forEach((c: any) => c && typeof c === "object" && collectUsages(c, node, childKey));
            } else if (child.type) {
              collectUsages(child, node, childKey);
            }
          }
        }
      };

      collectDeclarations(ast);
      collectUsages(ast);

      declaredVars.forEach((loc, varName) => {
        if (!usedVars.has(varName)) {
          violations.push({
            rule: "code-smell-unused-variable",
            message: `La variable '${varName}' está declarada pero nunca se usa`,
            severity: this.config.rules.codeSmells.severity,
            line: loc.line,
            column: loc.column,
            suggestion: `Elimina esta variable o úsala en tu código`,
          });
        }
      });
    }

    if (this.config.rules.codeSmells.detectDuplication) {
      const lines = code.split("\n");
      const lineMap = new Map<string, number[]>();

      lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (trimmed.length > 20 && !trimmed.startsWith("//") && !trimmed.startsWith("/*")) {
          if (!lineMap.has(trimmed)) {
            lineMap.set(trimmed, []);
          }
          lineMap.get(trimmed)!.push(index + 1);
        }
      });

      lineMap.forEach((lineNumbers, content) => {
        if (lineNumbers.length > 2) {
          violations.push({
            rule: "code-smell-duplication",
            message: `Código duplicado encontrado en ${lineNumbers.length} lugares (líneas: ${lineNumbers.join(", ")})`,
            severity: "info" as Severity,
            line: lineNumbers[0],
            suggestion: `Considera extraer este código en una función reutilizable`,
          });
        }
      });
    }

    const lines = code.split("\n");
    const commentOnlyLines = lines.filter(
      (line) => line.trim().startsWith("//") || line.trim().startsWith("/*")
    ).length;
    const codeLines = lines.filter((line) => line.trim() && !line.trim().startsWith("//")).length;

    if (codeLines > 0 && commentOnlyLines / codeLines < 0.05 && codeLines > 50) {
      violations.push({
        rule: "code-smell-lack-of-comments",
        message: `Este archivo tiene muy pocos comentarios (${commentOnlyLines} comentarios para ${codeLines} líneas de código)`,
        severity: "info" as Severity,
        suggestion: `Agrega comentarios para explicar la lógica compleja`,
      });
    }

    return violations;
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/^[a-z]/, (char) => char.toUpperCase())
      .replace(/_([a-z])/g, (_, char) => char.toUpperCase());
  }

  private toCamelCase(str: string): string {
    return str
      .replace(/^[A-Z]/, (char) => char.toLowerCase())
      .replace(/_([a-z])/g, (_, char) => char.toUpperCase());
  }
}
