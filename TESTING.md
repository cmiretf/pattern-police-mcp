# Testing Pattern Police con MCP Inspector

## Iniciar el Inspector

Ejecuta uno de estos comandos:

### Opción 1: Servidor compilado (recomendado)
```bash
npm run inspect
```

### Opción 2: Servidor en desarrollo (con tsx)
```bash
npm run inspect:dev
```

### Opción 3: Comando directo
```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

El inspector abrirá automáticamente tu navegador en `http://localhost:6274`

## Cómo Usar el Inspector

Una vez abierto el inspector, verás una interfaz web con varias pestañas:

### 1. Connect Panel
- El servidor debería conectarse automáticamente vía stdio
- Status: 🟢 Connected

### 2. Tools Tab
Aquí puedes probar las 4 herramientas MCP:

#### **validate_code** - Validar código en memoria
Argumentos:
```json
{
  "code": "const bad_name = 1;\nfunction BadFunction() {}\nclass myClass {}",
  "filename": "test.ts"
}
```

#### **validate_file** - Validar un archivo del sistema
Argumentos:
```json
{
  "filepath": "./test-example.ts"
}
```

#### **list_patterns** - Listar todas las reglas
Sin argumentos necesarios - solo haz clic en "Call Tool"

#### **get_violations** - Guía de violaciones por severidad
Argumentos opcionales:
```json
{
  "severity": "warning"
}
```
O para ver info:
```json
{
  "severity": "info"
}
```

### 3. Logs Panel
Verás todos los logs del servidor MCP en tiempo real

## Ejemplos de Código para Probar

### Ejemplo 1: Problemas de Naming
```javascript
const bad_name = 1;           // ❌ debería ser camelCase
const GOOD_CONSTANT = 42;     // ✅ correcto
function Bad_Function() {}    // ❌ debería ser camelCase
class myBadClass {}           // ❌ debería ser PascalCase
class GoodClass {}            // ✅ correcto
```

### Ejemplo 2: Violaciones SOLID
```javascript
// ❌ Demasiados parámetros (>5)
function tooManyParams(a, b, c, d, e, f, g) {
  return a + b + c + d + e + f + g;
}

// ❌ Función muy larga (>50 líneas)
function veryLongFunction() {
  let x = 1;
  // ... muchas líneas de código ...
}

// ❌ God Class (>10 métodos)
class GodClass {
  method1() {}
  method2() {}
  // ... más de 10 métodos ...
}
```

### Ejemplo 3: Code Smells
```javascript
const unused = 1;              // ❌ Variable no usada
const used = 2;                // ✅ Usada abajo
console.log(used);

const duplicated = "same";     // ⚠️ Posible duplicación
const duplicated2 = "same";    // ⚠️ Posible duplicación

// ⚠️ Archivo largo sin comentarios
```

## Qué Esperar

### Severidades
- **warning**: Violaciones importantes (naming, SOLID)
- **info**: Sugerencias de mejora (duplicación, comentarios)

### Formato de Respuesta
```json
{
  "content": [
    {
      "type": "text",
      "text": "✅ Validación completada - Se encontraron X violaciones\n\n..."
    }
  ]
}
```

## Verificar que Todo Funciona

1. ✅ **Connect**: El servidor se conecta automáticamente
2. ✅ **Tools**: Las 4 herramientas aparecen listadas
3. ✅ **validate_code**: Prueba con el Ejemplo 1 - debe detectar naming violations
4. ✅ **validate_file**: Valida `test-example.ts` - debe encontrar múltiples violaciones
5. ✅ **list_patterns**: Debe listar todas las reglas configuradas
6. ✅ **get_violations**: Filtra por severity correctamente

## Troubleshooting

### El inspector no se conecta
- Asegúrate de haber compilado: `npm run build`
- Verifica que Node.js esté instalado (v22+)

### No aparecen las herramientas
- Revisa los logs en la pestaña "Logs"
- Reinicia el inspector

### Los resultados no son los esperados
- Verifica el formato JSON de los argumentos
- Revisa `pattern-police.config.json` para la configuración de reglas
