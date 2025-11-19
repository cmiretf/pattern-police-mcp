#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { PatternValidator } from "./validators/PatternValidator.js";
import { JavaPatternValidator } from "./validators/JavaPatternValidator.js";
import { VuePatternValidator } from "./validators/VuePatternValidator.js";
import { PatternConfig } from "./types.js";
import { JavaPatternConfig } from "./types-java.js";
import { VuePatternConfig } from "./types-vue.js";
import * as fs from "fs/promises";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Resolver la ruta del directorio del módulo actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Función helper para resolver rutas de archivos de configuración
// Busca en el directorio del paquete instalado (relativo a dist/)
const resolveConfigPath = (filename: string): string => {
  // Cuando se ejecuta desde npm, el archivo está en dist/index.js
  // Los configs están en la raíz del paquete (un nivel arriba de dist/)
  return join(__dirname, "..", filename);
};

const DEFAULT_CONFIG: PatternConfig = {
  rules: {
    naming: {
      enabled: true,
      severity: "warning",
      patterns: {
        classes: "PascalCase",
        functions: "camelCase",
        constants: "UPPER_CASE",
        variables: "camelCase",
      },
    },
    solid: {
      enabled: true,
      severity: "warning",
      maxFunctionLines: 50,
      maxClassMethods: 10,
      maxParameters: 5,
    },
    codeSmells: {
      enabled: true,
      severity: "warning",
      detectDuplication: true,
      detectLongMethods: true,
      detectGodClasses: true,
      detectDeadCode: true,
    },
  },
};

class PatternPoliceServer {
  private server: Server;
  private validator: PatternValidator;
  private javaValidator: JavaPatternValidator | null = null;
  private vueValidator: VuePatternValidator | null = null;

  constructor() {
    this.server = new Server(
      {
        name: "pattern-police",
        version: "3.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.validator = new PatternValidator(DEFAULT_CONFIG);
    this.loadJavaValidator();
    this.loadVueValidator();

    this.setupHandlers();
  }

  private loadJavaValidator(): void {
    try {
      const configPath = resolveConfigPath("java-patterns.config.json");
      const configData = readFileSync(configPath, "utf-8");
      const javaConfig: JavaPatternConfig = JSON.parse(configData);
      this.javaValidator = new JavaPatternValidator(javaConfig);
    } catch (error) {
      console.error(
        "Warning: Could not load Java validator config, Java validation disabled"
      );
    }
  }

  private loadVueValidator(): void {
    try {
      const configPath = resolveConfigPath("vue-patterns.config.json");
      const configData = readFileSync(configPath, "utf-8");
      const vueConfig: VuePatternConfig = JSON.parse(configData);
      this.vueValidator = new VuePatternValidator(vueConfig);
    } catch (error) {
      console.error(
        "Warning: Could not load Vue validator config, Vue validation disabled"
      );
    }
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools(),
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "validate_code":
          return this.handleValidateCode(args);
        case "validate_file":
          return this.handleValidateFile(args);
        case "validate_java_code":
          return this.handleValidateJavaCode(args);
        case "validate_java_file":
          return this.handleValidateJavaFile(args);
        case "validate_vue_code":
          return this.handleValidateVueCode(args);
        case "validate_vue_file":
          return this.handleValidateVueFile(args);
        case "list_patterns":
          return this.handleListPatterns();
        case "list_java_patterns":
          return this.handleListJavaPatterns();
        case "list_vue_patterns":
          return this.handleListVuePatterns();
        case "get_violations":
          return this.handleGetViolations(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  private getTools(): Tool[] {
    return [
      {
        name: "validate_code",
        description:
          "Valida código TypeScript/JavaScript contra patrones de diseño establecidos. Retorna advertencias sobre violaciones de SOLID, naming conventions, y code smells.",
        inputSchema: {
          type: "object",
          properties: {
            code: {
              type: "string",
              description: "El código a validar",
            },
            filename: {
              type: "string",
              description: "Nombre del archivo (opcional, para mejor contexto)",
            },
          },
          required: ["code"],
        },
      },
      {
        name: "validate_file",
        description:
          "Valida un archivo específico en el sistema de archivos contra los patrones de diseño.",
        inputSchema: {
          type: "object",
          properties: {
            filepath: {
              type: "string",
              description: "Ruta al archivo a validar",
            },
          },
          required: ["filepath"],
        },
      },
      {
        name: "list_patterns",
        description:
          "Lista todos los patrones de diseño y reglas que están siendo validados, incluyendo su configuración y severidad.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_violations",
        description:
          "Obtiene un resumen de violaciones comunes y sugerencias de mejora basadas en el historial de validaciones.",
        inputSchema: {
          type: "object",
          properties: {
            severity: {
              type: "string",
              enum: ["warning", "error", "info"],
              description: "Filtrar por nivel de severidad",
            },
          },
        },
      },
      {
        name: "validate_java_code",
        description:
          "Detecta 50+ patrones de diseño en código Java (GoF, Enterprise J2EE, Modernos). Identifica Singleton, Factory, Builder, DAO, Repository, DTO, Service Layer, MVC, Dependency Injection, Circuit Breaker, Observer, Strategy, y muchos más.",
        inputSchema: {
          type: "object",
          properties: {
            code: {
              type: "string",
              description: "Código Java a analizar",
            },
            filename: {
              type: "string",
              description: "Nombre del archivo (opcional, para mejor contexto)",
            },
          },
          required: ["code"],
        },
      },
      {
        name: "validate_java_file",
        description:
          "Detecta 50+ patrones de diseño en archivo Java del sistema. Analiza GoF patterns (Creational, Structural, Behavioral), Enterprise patterns (DAO, DTO, Repository, Service Layer), y Modern patterns (DI, Circuit Breaker, CQRS, Event Sourcing).",
        inputSchema: {
          type: "object",
          properties: {
            filepath: {
              type: "string",
              description: "Ruta al archivo Java (.java)",
            },
          },
          required: ["filepath"],
        },
      },
      {
        name: "list_java_patterns",
        description:
          "Lista todos los 50+ patrones de diseño Java configurados: GoF (23 patterns), Enterprise/J2EE (15+ patterns), Modern (6+ patterns). Muestra categorías: Creational, Structural, Behavioral, Enterprise, Architectural, Modern.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "validate_vue_code",
        description:
          "Detecta 30+ patrones de diseño Vue.js (Composables, Components, Anti-patterns, Best Practices). Identifica composable patterns, smart/dumb components, renderless components, slots, mixins (anti-pattern), v-if+v-for, prop mutation, script setup usage, y más.",
        inputSchema: {
          type: "object",
          properties: {
            code: {
              type: "string",
              description:
                "Código Vue.js (SFC - Single File Component) a analizar",
            },
            filename: {
              type: "string",
              description: "Nombre del archivo (opcional, para mejor contexto)",
            },
          },
          required: ["code"],
        },
      },
      {
        name: "validate_vue_file",
        description:
          "Detecta 30+ patrones de diseño en archivo Vue.js del sistema. Analiza Composables patterns, Component patterns, Anti-patterns (mixins, v-if+v-for, prop mutation), Best Practices (prop validation, event naming, script setup), y Template patterns.",
        inputSchema: {
          type: "object",
          properties: {
            filepath: {
              type: "string",
              description: "Ruta al archivo Vue (.vue)",
            },
          },
          required: ["filepath"],
        },
      },
      {
        name: "list_vue_patterns",
        description:
          "Lista todos los 30+ patrones de diseño Vue.js configurados: Composables (5+ patterns), Components (5+ patterns), Anti-patterns (6+ patterns), Best Practices (6+ patterns), Template (3+ patterns), Lifecycle patterns. Incluye Composition API, Options API y Vue 3 features.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ];
  }

  private async handleValidateCode(args: any) {
    const { code, filename = "unknown.ts" } = args;
    const violations = this.validator.validateCode(code, filename);

    const warnings = violations.filter((v) => v.severity === "warning");
    const errors = violations.filter((v) => v.severity === "error");

    let response = `## Pattern Police - Resultados de Validación\n\n`;
    response += `📁 Archivo: ${filename}\n`;
    response += `⚠️  Advertencias: ${warnings.length}\n`;
    response += `❌ Errores: ${errors.length}\n\n`;

    if (violations.length === 0) {
      response += `✅ ¡Excelente! No se encontraron violaciones de patrones.\n`;
    } else {
      response += `### Violaciones Detectadas:\n\n`;
      violations.forEach((v, idx) => {
        const icon = v.severity === "error" ? "❌" : "⚠️";
        response += `${idx + 1}. ${icon} **${v.rule}** (${v.severity})\n`;
        response += `   📍 Línea: ${v.line || "N/A"}\n`;
        response += `   📝 ${v.message}\n`;
        if (v.suggestion) {
          response += `   💡 Sugerencia: ${v.suggestion}\n`;
        }
        response += `\n`;
      });
    }

    return {
      content: [{ type: "text", text: response }],
    };
  }

  private async handleValidateFile(args: any) {
    const { filepath } = args;
    const fs = await import("fs/promises");

    try {
      const code = await fs.readFile(filepath, "utf-8");
      return this.handleValidateCode({ code, filename: filepath });
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error al leer el archivo: ${
              error instanceof Error ? error.message : "Error desconocido"
            }`,
          },
        ],
        isError: true,
      };
    }
  }

  private async handleListPatterns() {
    const config = this.validator.getConfig();
    let response = `## Pattern Police - Patrones Configurados\n\n`;

    response += `### 1. Naming Conventions\n`;
    response += `- Estado: ${
      config.rules.naming.enabled ? "✅ Activo" : "❌ Inactivo"
    }\n`;
    response += `- Severidad: ${config.rules.naming.severity}\n`;
    response += `- Patrones:\n`;
    response += `  - Clases: ${config.rules.naming.patterns.classes}\n`;
    response += `  - Funciones: ${config.rules.naming.patterns.functions}\n`;
    response += `  - Constantes: ${config.rules.naming.patterns.constants}\n`;
    response += `  - Variables: ${config.rules.naming.patterns.variables}\n\n`;

    response += `### 2. Principios SOLID\n`;
    response += `- Estado: ${
      config.rules.solid.enabled ? "✅ Activo" : "❌ Inactivo"
    }\n`;
    response += `- Severidad: ${config.rules.solid.severity}\n`;
    response += `- Límites:\n`;
    response += `  - Máx. líneas por función: ${config.rules.solid.maxFunctionLines}\n`;
    response += `  - Máx. métodos por clase: ${config.rules.solid.maxClassMethods}\n`;
    response += `  - Máx. parámetros: ${config.rules.solid.maxParameters}\n\n`;

    response += `### 3. Code Smells\n`;
    response += `- Estado: ${
      config.rules.codeSmells.enabled ? "✅ Activo" : "❌ Inactivo"
    }\n`;
    response += `- Severidad: ${config.rules.codeSmells.severity}\n`;
    response += `- Detecta:\n`;
    response += `  - Código duplicado: ${
      config.rules.codeSmells.detectDuplication ? "✅" : "❌"
    }\n`;
    response += `  - Métodos largos: ${
      config.rules.codeSmells.detectLongMethods ? "✅" : "❌"
    }\n`;
    response += `  - God Classes: ${
      config.rules.codeSmells.detectGodClasses ? "✅" : "❌"
    }\n`;
    response += `  - Código muerto: ${
      config.rules.codeSmells.detectDeadCode ? "✅" : "❌"
    }\n`;

    return {
      content: [{ type: "text", text: response }],
    };
  }

  private async handleGetViolations(args: any = {}) {
    const { severity } = args;
    let response = `## Pattern Police - Guía de Violaciones Comunes\n\n`;

    if (severity) {
      response += `Filtrando por severidad: **${severity}**\n\n`;
    }

    const showSection = (sectionSeverity: string) => {
      if (!severity) return true;
      return severity === sectionSeverity;
    };

    if (showSection("warning")) {
      response += `### Violaciones de Naming Conventions (warning)\n`;
      response += `- ❌ **PascalCase para clases**: Las clases deben comenzar con mayúscula (ej: UserService)\n`;
      response += `- ❌ **camelCase para funciones**: Las funciones deben usar camelCase (ej: getUserData)\n`;
      response += `- ❌ **UPPER_CASE para constantes**: Las constantes deben estar en mayúsculas (ej: MAX_USERS)\n\n`;

      response += `### Violaciones de SOLID (warning)\n`;
      response += `- ⚠️ **Funciones muy largas**: Mantén funciones bajo 50 líneas\n`;
      response += `- ⚠️ **Demasiados parámetros**: Máximo 5 parámetros por función\n`;
      response += `- ⚠️ **God Classes**: Clases con más de 10 métodos pueden indicar violación de Single Responsibility\n\n`;
    }

    if (showSection("info")) {
      response += `### Code Smells Comunes (info)\n`;
      response += `- 🔍 **Código duplicado**: Extrae funcionalidad común en funciones/clases reutilizables\n`;
      response += `- 🔍 **Métodos largos**: Divide métodos complejos en funciones más pequeñas\n`;
      response += `- 🔍 **Variables no usadas**: Elimina código muerto para mejorar legibilidad\n\n`;
    }

    response += `### Mejores Prácticas\n`;
    response += `- ✅ Usa nombres descriptivos que expliquen el propósito\n`;
    response += `- ✅ Una función debe hacer una sola cosa\n`;
    response += `- ✅ Mantén las clases enfocadas en una responsabilidad\n`;
    response += `- ✅ Prefiere composición sobre herencia profunda\n`;

    return {
      content: [{ type: "text", text: response }],
    };
  }

  private async handleValidateJavaCode(args: any) {
    if (!this.javaValidator) {
      return {
        content: [
          {
            type: "text",
            text: "❌ Validador Java no disponible. Verifica que java-patterns.config.json existe.",
          },
        ],
        isError: true,
      };
    }

    const { code, filename = "Unknown.java" } = args;
    const violations = this.javaValidator.validateCode(code, filename);

    let response = `## Pattern Police Java - Patrones Detectados\n\n`;
    response += `📁 Archivo: ${filename}\n`;
    response += `🔍 Patrones encontrados: ${violations.length}\n\n`;

    if (violations.length === 0) {
      response += `No se detectaron patrones de diseño en este código.\n`;
      response += `Esto puede significar que el código es simple o que no sigue patrones reconocibles.\n`;
    } else {
      const byCategory = violations.reduce((acc, v) => {
        if (!acc[v.category]) acc[v.category] = [];
        acc[v.category].push(v);
        return acc;
      }, {} as Record<string, any[]>);

      const categoryNames: Record<string, string> = {
        creational: "🏗️  Patrones Creacionales (GoF)",
        structural: "🔗 Patrones Estructurales (GoF)",
        behavioral: "🎭 Patrones de Comportamiento (GoF)",
        enterprise: "🏢 Patrones Enterprise/J2EE",
        architectural: "🏛️  Patrones Arquitecturales",
        modern: "⚡ Patrones Modernos",
      };

      Object.entries(byCategory).forEach(([category, patterns]) => {
        response += `### ${categoryNames[category] || category}\n\n`;
        patterns.forEach((p, idx) => {
          response += `${idx + 1}. ${p.message}\n\n`;
        });
      });
    }

    return {
      content: [{ type: "text", text: response }],
    };
  }

  private async handleValidateJavaFile(args: any) {
    if (!this.javaValidator) {
      return {
        content: [
          {
            type: "text",
            text: "❌ Validador Java no disponible. Verifica que java-patterns.config.json existe.",
          },
        ],
        isError: true,
      };
    }

    const { filepath } = args;

    try {
      const code = await fs.readFile(filepath, "utf-8");
      return this.handleValidateJavaCode({ code, filename: filepath });
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error al leer el archivo: ${
              error instanceof Error ? error.message : "Error desconocido"
            }`,
          },
        ],
        isError: true,
      };
    }
  }

  private async handleListJavaPatterns() {
    let response = `## Pattern Police Java - Catálogo Completo de Patrones\n\n`;
    response += `Este validador detecta más de 50 patrones de diseño en código Java.\n\n`;

    response += `### 🏗️  Patrones Creacionales GoF (5)\n`;
    response += `1. **Singleton** - Una única instancia global\n`;
    response += `2. **Factory Method** - Creación de objetos mediante método factory\n`;
    response += `3. **Abstract Factory** - Familias de objetos relacionados\n`;
    response += `4. **Builder** - Construcción paso a paso de objetos complejos\n`;
    response += `5. **Prototype** - Clonación de objetos\n\n`;

    response += `### 🔗 Patrones Estructurales GoF (7)\n`;
    response += `6. **Adapter** - Adapta interfaces incompatibles\n`;
    response += `7. **Bridge** - Separa abstracción de implementación\n`;
    response += `8. **Composite** - Estructura de árbol de objetos\n`;
    response += `9. **Decorator** - Añade funcionalidad dinámicamente\n`;
    response += `10. **Facade** - Interfaz simplificada a subsistema complejo\n`;
    response += `11. **Flyweight** - Compartición eficiente de objetos\n`;
    response += `12. **Proxy** - Representante/placeholder de otro objeto\n\n`;

    response += `### 🎭 Patrones de Comportamiento GoF (11)\n`;
    response += `13. **Chain of Responsibility** - Cadena de handlers\n`;
    response += `14. **Command** - Encapsula request como objeto\n`;
    response += `15. **Interpreter** - Interpreta gramática/lenguaje\n`;
    response += `16. **Iterator** - Acceso secuencial a colección\n`;
    response += `17. **Mediator** - Mediador entre objetos\n`;
    response += `18. **Memento** - Captura y restaura estado\n`;
    response += `19. **Observer** - Notificación automática de cambios\n`;
    response += `20. **State** - Cambia comportamiento según estado\n`;
    response += `21. **Strategy** - Algoritmos intercambiables\n`;
    response += `22. **Template Method** - Esqueleto de algoritmo\n`;
    response += `23. **Visitor** - Operaciones sobre estructura de objetos\n\n`;

    response += `### 🏢 Patrones Enterprise/J2EE (15)\n`;
    response += `24. **DAO** - Data Access Object (acceso a datos)\n`;
    response += `25. **Repository** - Colección de agregados de dominio\n`;
    response += `26. **DTO** - Data Transfer Object (sin lógica de negocio)\n`;
    response += `27. **Service Layer** - Lógica de negocio y orquestación\n`;
    response += `28. **Factory** - Variantes enterprise de Factory\n`;
    response += `29. **Data Mapper** - Mapeo entre objetos y BD\n`;
    response += `30. **Active Record** - Objeto con datos + persistencia\n`;
    response += `31. **Value Object** - Objeto inmutable de valor\n`;
    response += `32. **MVC** - Model-View-Controller\n`;
    response += `33. **Front Controller** - Punto de entrada centralizado\n`;
    response += `34. **Business Delegate** - Desacopla presentación de negocio\n`;
    response += `35. **Session Facade** - Fachada de servicios de negocio\n`;
    response += `36. **Service Locator** - Lookup centralizado (anti-patrón moderno)\n`;
    response += `37. **Transfer Object Assembler** - Composición de DTOs\n`;
    response += `38. **Composite Entity** - Grafo de entidades dependientes\n\n`;

    response += `### ⚡ Patrones Modernos (6)\n`;
    response += `39. **Dependency Injection** - Inversión de control\n`;
    response += `40. **Circuit Breaker** - Previene fallos en cascada\n`;
    response += `41. **Saga** - Transacciones distribuidas\n`;
    response += `42. **CQRS** - Command Query Responsibility Segregation\n`;
    response += `43. **Event Sourcing** - Estado como secuencia de eventos\n`;
    response += `44. **Unit of Work** - Gestión de transacciones\n\n`;

    response += `### 📋 Cómo Usar\n\n`;
    response += `**Validar código:**\n`;
    response += `\`\`\`\nvalidate_java_code con tu código Java\n\`\`\`\n\n`;
    response += `**Validar archivo:**\n`;
    response += `\`\`\`\nvalidate_java_file con filepath: "./tu/archivo.java"\n\`\`\`\n\n`;
    response += `El validador detecta automáticamente qué patrones están presentes en tu código,\n`;
    response += `incluyendo anti-patrones comunes cuando están habilitados.\n`;

    return {
      content: [{ type: "text", text: response }],
    };
  }

  private async handleValidateVueCode(args: any) {
    if (!this.vueValidator) {
      return {
        content: [
          {
            type: "text",
            text: "❌ Validador Vue no disponible. Verifica que vue-patterns.config.json existe.",
          },
        ],
        isError: true,
      };
    }

    const { code, filename = "Component.vue" } = args;
    const { detections, violations } = this.vueValidator.validate(
      code,
      filename
    );

    let response = `## Pattern Police Vue.js - Análisis de Patrones\n\n`;
    response += `📁 Archivo: ${filename}\n`;
    response += `✨ Patrones detectados: ${detections.length}\n`;
    response += `⚠️  Violaciones/Anti-patrones: ${violations.length}\n\n`;

    if (detections.length > 0) {
      response += `### 🎯 Patrones Detectados\n\n`;

      const byCategory = detections.reduce((acc, d) => {
        if (!acc[d.category]) acc[d.category] = [];
        acc[d.category].push(d);
        return acc;
      }, {} as Record<string, any[]>);

      const categoryNames: Record<string, string> = {
        composables: "🧩 Composables Patterns",
        components: "🧱 Component Patterns",
        bestPractices: "✅ Best Practices",
        template: "📄 Template Patterns",
        lifecycle: "🔄 Lifecycle Patterns",
      };

      Object.entries(byCategory).forEach(([category, patterns]) => {
        response += `#### ${categoryNames[category] || category}\n\n`;
        patterns.forEach((p, idx) => {
          const confidenceIcon =
            p.confidence === "high"
              ? "🟢"
              : p.confidence === "medium"
              ? "🟡"
              : "🟠";
          response += `${idx + 1}. ${confidenceIcon} **${p.pattern}** (${
            p.componentName
          })\n`;
          response += `   📍 Ubicación: Línea ${p.location.line}${
            p.location.block ? ` (${p.location.block})` : ""
          }\n`;

          if (p.evidence && p.evidence.length > 0) {
            response += `   ✓ Evidencia:\n`;
            p.evidence.forEach((e: string) => {
              response += `     - ${e}\n`;
            });
          }

          if (p.antiPatterns && p.antiPatterns.length > 0) {
            response += `   ⚠️  Anti-patrones detectados:\n`;
            p.antiPatterns.forEach((a: string) => {
              response += `     - ${a}\n`;
            });
          }

          if (p.suggestions && p.suggestions.length > 0) {
            response += `   💡 Sugerencias:\n`;
            p.suggestions.forEach((s: string) => {
              response += `     - ${s}\n`;
            });
          }

          response += `\n`;
        });
      });
    }

    if (violations.length > 0) {
      response += `### ⚠️  Violaciones y Anti-patrones\n\n`;

      violations.forEach((v, idx) => {
        const icon =
          v.severity === "error"
            ? "❌"
            : v.severity === "warning"
            ? "⚠️"
            : "ℹ️";
        response += `${idx + 1}. ${icon} **${v.rule}** (${v.severity})\n`;
        response += `   📍 Línea: ${v.location.line}${
          v.location.block ? ` (${v.location.block})` : ""
        }\n`;
        response += `   📝 ${v.message}\n`;

        if (v.suggestion) {
          response += `   💡 Sugerencia: ${v.suggestion}\n`;
        }

        response += `\n`;
      });
    }

    if (detections.length === 0 && violations.length === 0) {
      response += `ℹ️  No se detectaron patrones ni violaciones en este componente.\n`;
      response += `Esto puede significar que el componente es muy simple o que usa patrones no reconocibles.\n`;
    }

    return {
      content: [{ type: "text", text: response }],
    };
  }

  private async handleValidateVueFile(args: any) {
    if (!this.vueValidator) {
      return {
        content: [
          {
            type: "text",
            text: "❌ Validador Vue no disponible. Verifica que vue-patterns.config.json exists.",
          },
        ],
        isError: true,
      };
    }

    const { filepath } = args;

    if (!filepath || typeof filepath !== "string") {
      return {
        content: [
          {
            type: "text",
            text: "❌ Error: Se requiere el parámetro 'filepath' (ruta del archivo).\n\n💡 ¿Quieres validar código directamente? Usa 'validate_vue_code' en su lugar.",
          },
        ],
        isError: true,
      };
    }

    if (filepath.includes("<template>") || filepath.includes("<script>")) {
      return {
        content: [
          {
            type: "text",
            text:
              "❌ Error: Parece que pasaste el CONTENIDO del archivo en lugar de la RUTA.\n\n" +
              "Para validar código directamente, usa la herramienta 'validate_vue_code' con el parámetro 'code'.\n" +
              "Para validar un archivo del sistema, usa 'validate_vue_file' con el parámetro 'filepath' (ej: './components/MyComponent.vue').",
          },
        ],
        isError: true,
      };
    }

    try {
      const code = await fs.readFile(filepath, "utf-8");
      return this.handleValidateVueCode({ code, filename: filepath });
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Error desconocido";
      return {
        content: [
          {
            type: "text",
            text: `❌ Error al leer el archivo: ${errorMsg}\n\n💡 Verifica que la ruta sea correcta. Si quieres validar código directamente, usa 'validate_vue_code' en su lugar.`,
          },
        ],
        isError: true,
      };
    }
  }

  private async handleListVuePatterns() {
    let response = `## Pattern Police Vue.js - Catálogo Completo de Patrones\n\n`;
    response += `Este validador detecta más de 30 patrones de diseño en código Vue.js 3.\n\n`;

    response += `### 🧩 Composables Patterns (5+)\n`;
    response += `1. **Composable Naming Convention** - Funciones con prefijo "use"\n`;
    response += `2. **Composable Options Object** - Parámetros configurables con objeto options\n`;
    response += `3. **Composable Return Reactive** - Retornar valores reactivos (ref, reactive, computed)\n`;
    response += `4. **Composable Flexible Arguments** - Aceptar refs o valores con unref/toRef\n`;
    response += `5. **Composable Lifecycle Hooks** - Uso de onMounted, onUnmounted, etc.\n\n`;

    response += `### 🧱 Component Patterns (5+)\n`;
    response += `6. **Smart/Dumb Components** - Separación de lógica y presentación\n`;
    response += `7. **List/Item Pattern** - Componentes de lista separados de items\n`;
    response += `8. **Renderless Component** - Componentes que solo proveen lógica\n`;
    response += `9. **Scoped Slots** - Slots que exponen datos al componente padre\n`;
    response += `10. **Named Slots** - Múltiples slots con nombres\n`;
    response += `11. **Provide/Inject Pattern** - Compartir estado entre componentes\n\n`;

    response += `### ⚠️  Anti-Patterns (6+)\n`;
    response += `12. **Mixin Usage** - Uso de mixins (deprecado en Vue 3)\n`;
    response += `13. **v-if with v-for** - v-if y v-for en mismo elemento\n`;
    response += `14. **Prop Mutation** - Mutación directa de props\n`;
    response += `15. **$parent Access** - Acceso a $parent, $children, $root\n`;
    response += `16. **God Component** - Componentes muy grandes (>300 líneas)\n`;
    response += `17. **Missing v-for Key** - v-for sin :key\n\n`;

    response += `### ✅ Best Practices (6+)\n`;
    response += `18. **Prop Validation** - Validación de tipos en props\n`;
    response += `19. **Computed vs Methods** - Uso correcto de computed properties\n`;
    response += `20. **Event Naming Convention** - Eventos en kebab-case\n`;
    response += `21. **Script Setup Usage** - Uso de <script setup> (Vue 3)\n`;
    response += `22. **TypeScript Usage** - Uso de TypeScript en componentes\n`;
    response += `23. **defineProps Pattern** - Uso correcto de defineProps\n`;
    response += `24. **defineEmits Pattern** - Uso correcto de defineEmits\n\n`;

    response += `### 📄 Template Patterns (3+)\n`;
    response += `25. **Pass-Through Pattern** - Uso de slots en lugar de props para contenido\n`;
    response += `26. **Conditional Rendering** - Patrones v-if/v-show correctos\n`;
    response += `27. **Teleport Usage** - Renderizado en DOM diferente\n`;
    response += `28. **Suspense Pattern** - Manejo de componentes async\n\n`;

    response += `### 🔄 Additional Patterns\n`;
    response += `29. **Ref vs Reactive** - Uso adecuado de ref vs reactive\n`;
    response += `30. **Watch vs WatchEffect** - Uso correcto de watchers\n\n`;

    response += `### 📋 Cómo Usar\n\n`;
    response += `**Validar código Vue:**\n`;
    response += `\`\`\`\nvalidate_vue_code con tu código Vue SFC\n\`\`\`\n\n`;
    response += `**Validar archivo:**\n`;
    response += `\`\`\`\nvalidate_vue_file con filepath: "./components/MyComponent.vue"\n\`\`\`\n\n`;
    response += `El validador analiza componentes Vue 3 con Composition API, detecta patrones\n`;
    response += `recomendados, identifica anti-patrones, y sugiere mejoras basadas en best practices.\n`;

    return {
      content: [{ type: "text", text: response }],
    };
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Pattern Police MCP Server ejecutándose en stdio");
  }
}

const server = new PatternPoliceServer();
server.run().catch((error) => {
  console.error("Error fatal:", error);
  process.exit(1);
});
