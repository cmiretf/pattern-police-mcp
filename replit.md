# Pattern Police MCP Server

## Descripción General
Pattern Police es un servidor MCP (Model Context Protocol) diseñado para validar patrones de diseño en código TypeScript/JavaScript/Java/Vue.js. 

### TypeScript/JavaScript
Funciona a nivel de advertencias para guiar el desarrollo sin bloquear el flujo de trabajo.

### Java
Detecta 50+ patrones de diseño incluyendo GoF (23), Enterprise J2EE (15+), y Modernos (6+).

### Vue.js (NUEVO)
Detecta 30+ patrones de diseño específicos de Vue.js 3 incluyendo Composables, Components, Anti-patterns, y Best Practices.

## Tecnología
- **Lenguaje**: TypeScript
- **Framework**: MCP SDK (@modelcontextprotocol/sdk)
- **Parsers**: 
  - TypeScript/JavaScript: @typescript-eslint/typescript-estree (AST)
  - Java: java-parser (CST)
  - Vue.js: @vue/compiler-sfc (SFC parsing)
- **Runtime**: Node.js con tsx para desarrollo

## Estructura del Proyecto
```
├── src/
│   ├── index.ts                         # Servidor MCP principal (v3.0.0)
│   ├── types.ts                         # Tipos TypeScript/JavaScript
│   ├── types-java.ts                    # Tipos Java
│   ├── types-vue.ts                     # Tipos Vue.js
│   └── validators/
│       ├── PatternValidator.ts          # Validador TS/JS (AST)
│       ├── JavaPatternValidator.ts      # Validador Java (CST)
│       └── VuePatternValidator.ts       # Validador Vue.js (SFC)
├── examples/
│   ├── JavaPatterns/                    # Ejemplos Java (GoF, Enterprise)
│   └── VuePatterns/                     # Ejemplos Vue.js (Composables, Components)
├── dist/                                # Código compilado
├── pattern-police.config.json           # Config TypeScript/JavaScript
├── java-patterns.config.json            # Config Java (50+ patterns)
├── vue-patterns.config.json             # Config Vue.js (30+ patterns)
├── test-java-patterns.ts                # Tests Java
├── test-vue-patterns.ts                 # Tests Vue.js
├── JAVA_PATTERNS.md                     # Documentación Java
├── VUE_PATTERNS.md                      # Documentación Vue.js
└── README.md                            # Documentación principal

## Características Implementadas

### 1. Validadores de Patrones
- **Naming Conventions**: PascalCase (clases), camelCase (funciones/métodos), UPPER_CASE (constantes)
- **Principios SOLID**: 
  - Máximo 5 parámetros por función/método
  - Máximo 50 líneas por función/método
  - Máximo 10 métodos por clase (detección de God Classes)
- **Code Smells**:
  - Variables no usadas
  - Código duplicado
  - Falta de comentarios (>50 líneas)

### 2. Herramientas MCP
- `validate_code`: Valida código en memoria
- `validate_file`: Valida archivos del sistema
- `list_patterns`: Lista reglas configuradas
- `get_violations`: Guía de violaciones con filtro por severidad

### 3. Análisis AST
Usa @typescript-eslint/typescript-estree para analizar correctamente:
- Clases y métodos (incluye constructores)
- Funciones (declaradas, expresiones, arrow functions)
- Parámetros en métodos multi-línea
- Variables y constantes
- Alcance y uso de variables

## Configuración

### Configuración por Defecto
```json
{
  "rules": {
    "naming": {
      "enabled": true,
      "severity": "warning"
    },
    "solid": {
      "enabled": true,
      "severity": "warning",
      "maxFunctionLines": 50,
      "maxClassMethods": 10,
      "maxParameters": 5
    },
    "codeSmells": {
      "enabled": true,
      "severity": "warning",
      "detectDuplication": true,
      "detectLongMethods": true,
      "detectGodClasses": true,
      "detectDeadCode": true
    }
  }
}
```

## Uso con Claude Desktop

Agregar a `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "pattern-police": {
      "command": "npx",
      "args": ["-y", "tsx", "/ruta/completa/al/proyecto/src/index.ts"]
    }
  }
}
```

O en producción:
```json
{
  "mcpServers": {
    "pattern-police": {
      "command": "node",
      "args": ["/ruta/completa/al/proyecto/dist/index.js"]
    }
  }
}
```

## Comandos de Desarrollo

```bash
npm run dev          # Ejecutar con tsx (desarrollo)
npm run build        # Compilar TypeScript
npm start            # Ejecutar compilado
npm run inspect      # Lanzar MCP Inspector (compilado)
npm run inspect:dev  # Lanzar MCP Inspector (desarrollo)
```

## Testing con MCP Inspector

El inspector MCP permite probar el servidor de forma interactiva:

```bash
npm run inspect
```

Esto abre el navegador en `http://localhost:6274` donde puedes:
- Probar las 4 herramientas MCP (validate_code, validate_file, list_patterns, get_violations)
- Ver logs en tiempo real
- Validar el archivo de ejemplo `inspector-test-example.ts`
- Experimentar con diferentes parámetros y severidades

Ver `TESTING.md` para guía completa de testing.

## Ejemplo de Uso

Claude puede usar Pattern Police para validar código antes de commits:

```
Usuario: "Valida este código con pattern police antes de hacer commit"

Claude: (usa validate_code tool)
```

## Severidad de Reglas
- **warning**: Violaciones importantes de patrones (naming, SOLID)
- **info**: Sugerencias de mejora (duplicación, comentarios)
- **error**: Errores de parseo (raramente ocurre)

## Estado Actual
✅ Servidor MCP funcional
✅ Validación con AST parser
✅ 4 herramientas MCP implementadas
✅ Configuración flexible
✅ Documentación completa
✅ Ejemplos de uso
✅ Workflow configurado

## Próximas Mejoras Potenciales
- Integración con git hooks (pre-commit)
- Configuración personalizable por proyecto
- Reglas adicionales (complejidad ciclomática, etc.)
- Soporte para más lenguajes
- Cache de validaciones
