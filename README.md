# Pattern Police MCP Server 🚓

Servidor MCP (Model Context Protocol) que valida patrones de diseño en código TypeScript/JavaScript/Java. Detecta 50+ patrones GoF, Enterprise J2EE, y Modernos en Java, además de validar SOLID, naming conventions y code smells en TypeScript/JavaScript.

## 🎯 Características

- **Naming Conventions**: Valida PascalCase para clases, camelCase para funciones, UPPER_CASE para constantes
- **Principios SOLID**: Detecta funciones muy largas, demasiados parámetros, y "God Classes"
- **Code Smells**: Identifica código duplicado, variables no usadas, falta de comentarios
- **Severidad Configurable**: Trabaja principalmente con advertencias para no bloquear el desarrollo

## 🚀 Instalación

```bash
npm install
npm run build
```

## 📖 Uso

### Como servidor MCP

Ejecuta el servidor:

```bash
npm run dev
```

O después de compilar:

```bash
npm start
```

### Herramientas Disponibles

El servidor MCP expone las siguientes herramientas:

#### 1. `validate_code`
Valida código TypeScript/JavaScript contra patrones establecidos.

**Parámetros:**
- `code` (string): El código a validar
- `filename` (string, opcional): Nombre del archivo para mejor contexto

**Ejemplo:**
```json
{
  "code": "class myClass { ... }",
  "filename": "example.ts"
}
```

#### 2. `validate_file`
Valida un archivo específico del sistema de archivos.

**Parámetros:**
- `filepath` (string): Ruta al archivo a validar

#### 3. `list_patterns`
Lista todos los patrones y reglas configurados.

#### 4. `get_violations`
Obtiene un resumen de violaciones comunes y sugerencias.

**Parámetros:**
- `severity` (string, opcional): Filtrar por "warning", "error", o "info"

### Herramientas Java (NUEVO ⭐)

#### 5. `validate_java_code`
Detecta 50+ patrones de diseño en código Java (GoF, Enterprise, Modernos).

**Parámetros:**
- `code` (string): Código Java a analizar
- `filename` (string, opcional): Nombre del archivo

**Ejemplo:**
```json
{
  "code": "public class DatabaseConnection { private static final DatabaseConnection INSTANCE = new DatabaseConnection(); ... }",
  "filename": "DatabaseConnection.java"
}
```

#### 6. `validate_java_file`
Detecta patrones en archivos Java del sistema.

**Parámetros:**
- `filepath` (string): Ruta al archivo Java (.java)

#### 7. `list_java_patterns`
Lista todos los 50+ patrones Java configurados: GoF (23), Enterprise (15+), Modern (6+).

**Ver [JAVA_PATTERNS.md](./JAVA_PATTERNS.md) para lista completa de patrones detectados.**

## ⚙️ Configuración

Por defecto, Pattern Police viene con una configuración estándar:

- **Naming**: PascalCase (clases), camelCase (funciones/variables), UPPER_CASE (constantes)
- **SOLID**: Máx 50 líneas/función, 10 métodos/clase, 5 parámetros/función
- **Code Smells**: Detecta duplicación, métodos largos, God Classes, código muerto

## 📋 Ejemplos de Validaciones

### ✅ Código Correcto
```typescript
class UserService {
  getUserData(userId: string): User {
    return this.repository.find(userId);
  }
}

const MAX_RETRIES = 3;
```

### ⚠️ Advertencias
```typescript
// ⚠️ Naming: clase debe usar PascalCase
class userService { }

// ⚠️ SOLID: demasiados parámetros
function createUser(name, email, age, address, phone, country) { }

// ⚠️ Code Smell: variable no usada
const unusedVar = 42;
```

## 🧪 Testing con MCP Inspector

Puedes probar el servidor interactivamente usando el MCP Inspector oficial:

```bash
# Opción 1: Servidor compilado (recomendado)
npm run inspect

# Opción 2: Servidor en desarrollo
npm run inspect:dev
```

Esto abrirá el inspector en tu navegador (`http://localhost:6274`) donde podrás:

- ✅ **Probar las 4 herramientas MCP** con diferentes parámetros
- ✅ **Ver logs en tiempo real** del servidor
- ✅ **Validar código de ejemplo** incluido en `inspector-test-example.ts`
- ✅ **Experimentar con diferentes severidades** y configuraciones

### Ejemplo rápido en el inspector

1. Ve a la pestaña "Tools"
2. Selecciona `validate_file`
3. Usa estos parámetros:
   ```json
   {
     "filepath": "./inspector-test-example.ts"
   }
   ```
4. Haz clic en "Call Tool" y verás todas las violaciones detectadas

Ver [TESTING.md](./TESTING.md) para más detalles y ejemplos.

## 🔗 Integración con Git

Para usar Pattern Police antes de commits, puedes integrarlo con git hooks:

```bash
# .git/hooks/pre-commit
#!/bin/bash
# Aquí puedes llamar al servidor MCP para validar archivos staged
```

## 🛠️ Desarrollo

```bash
# Desarrollo con recarga automática
npm run dev

# Compilar
npm run build

# Ejecutar compilado
npm start
```

## 📝 Licencia

ISC
