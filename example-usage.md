# Ejemplos de Uso - Pattern Police

## Configuración en Claude Desktop

Para usar Pattern Police con Claude Desktop, agrega esta configuración a tu archivo `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "pattern-police": {
      "command": "node",
      "args": ["/ruta/a/pattern-police-mcp/dist/index.js"]
    }
  }
}
```

O para desarrollo:

```json
{
  "mcpServers": {
    "pattern-police": {
      "command": "npx",
      "args": ["-y", "tsx", "/ruta/a/pattern-police-mcp/src/index.ts"]
    }
  }
}
```

## Ejemplos de Conversación

### Ejemplo 1: Validar código antes de commit

**Usuario:**
```
Antes de hacer commit, valida este código:

class myService {
  processData(a, b, c, d, e, f, g) {
    const temp = a + b;
    // ... mucho código ...
  }
}
```

**Claude (usando Pattern Police):**
```
He validado tu código y encontré las siguientes advertencias:

⚠️ Naming Convention: La clase 'myService' debe usar PascalCase
   💡 Sugerencia: Renombrar a 'MyService'

⚠️ SOLID: La función 'processData' tiene 7 parámetros (máx: 5)
   💡 Sugerencia: Considera usar un objeto de opciones

Deberías corregir estos problemas antes del commit.
```

### Ejemplo 2: Revisar un archivo

**Usuario:**
```
Revisa el archivo src/utils/helper.ts con pattern police
```

**Claude:**
```
Analizando src/utils/helper.ts...

✅ ¡Excelente! No se encontraron violaciones de patrones.
Tu código sigue las mejores prácticas.
```

### Ejemplo 3: Consultar patrones

**Usuario:**
```
¿Qué patrones está validando pattern police?
```

**Claude:**
```
Pattern Police está validando:

1. Naming Conventions
   - Clases: PascalCase
   - Funciones: camelCase
   - Constantes: UPPER_CASE

2. Principios SOLID
   - Máx. 50 líneas por función
   - Máx. 10 métodos por clase
   - Máx. 5 parámetros por función

3. Code Smells
   - Código duplicado
   - Variables no usadas
   - Métodos muy largos
   - God Classes
```

## Casos de Uso Comunes

### 1. Pre-commit Hook
Validar archivos antes de commit:
```
"Valida todos los archivos .ts modificados con pattern police"
```

### 2. Code Review
Durante revisión de código:
```
"Usa pattern police para revisar este pull request"
```

### 3. Refactoring
Al refactorizar código:
```
"Valida este código refactorizado para asegurar que sigue los patrones"
```

### 4. Aprendizaje
Para aprender mejores prácticas:
```
"¿Por qué pattern police marca esto como advertencia?"
```

## Integración con Workflow

### Git Pre-commit Hook

Crea `.git/hooks/pre-commit`:

```bash
#!/bin/bash

echo "🚓 Pattern Police verificando código..."

# Obtener archivos staged .ts y .js
FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|js)$')

if [ -z "$FILES" ]; then
  echo "✅ No hay archivos TypeScript/JavaScript para validar"
  exit 0
fi

# Aquí puedes integrar la validación
# Por ahora, es un recordatorio
echo "⚠️  Recuerda validar con Pattern Police antes del commit"
echo "   Pregunta a Claude: 'Valida estos archivos con pattern police'"

exit 0
```

### CI/CD Integration

En tu pipeline CI/CD:

```yaml
# .github/workflows/pattern-check.yml
name: Pattern Police Check

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
      - name: Install Pattern Police
        run: npm install
      - name: Run Validation
        run: |
          # Integra aquí la validación automática
          echo "Pattern validation placeholder"
```

## Tips de Uso

1. **Desarrollo Incremental**: Valida código frecuentemente, no solo antes de commits grandes
2. **Aprendizaje**: Usa las sugerencias para mejorar tu estilo de código
3. **Configuración**: Ajusta el archivo `pattern-police.config.json` según tu equipo
4. **Severidad**: Por defecto usa "warning" - no bloquea el desarrollo pero te guía
5. **Feedback Loop**: Las advertencias son oportunidades de mejora, no errores críticos
