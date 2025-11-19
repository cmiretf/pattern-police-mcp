# Pattern Police MCP Server 🚓

A Model Context Protocol (MCP) server that validates design patterns in TypeScript/JavaScript, Java, and Vue.js code. Detects 50+ GoF, Enterprise J2EE, and Modern patterns in Java, plus validates SOLID principles, naming conventions, and code smells across all supported languages.

## 🚀 Quick Start

### Installation

Install globally via npm:

```bash
npm install -g @cmiretf/pattern-police-mcp
```

Or add to your project:

```bash
npm install @cmiretf/pattern-police-mcp
```

### Usage

#### With MCP Inspector

Test the server interactively:

```bash
npm install -g pattern-police-mcp
npx @modelcontextprotocol/inspector pattern-police
```

Or if installed locally:

```bash
npx @modelcontextprotocol/inspector node node_modules/pattern-police-mcp/dist/index.js
```

#### With Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "pattern-police": {
      "command": "npx",
      "args": ["-y", "@cmiretf/pattern-police-mcp"]
    }
  }
}
```

Or with a local installation:

```json
{
  "mcpServers": {
    "pattern-police": {
      "command": "node",
      "args": ["/path/to/node_modules/pattern-police-mcp/dist/index.js"]
    }
  }
}
```

#### With Visual Studio Code / Cursor

Add to your `mcp.json`:

```json
{
  "servers": {
    "pattern-police": {
      "command": "npx",
      "args": ["-y", "@cmiretf/pattern-police-mcp"]
    }
  }
}
```

Or with a local installation:

```json
{
  "mcpServers": {
    "pattern-police": {
      "command": "node",
      "args": ["/path/to/node_modules/pattern-police-mcp/dist/index.js"]
    }
  }
}
```

## 🎯 Features

### TypeScript/JavaScript Validation

- **Naming Conventions**: PascalCase for classes, camelCase for functions, UPPER_CASE for constants
- **SOLID Principles**: Detects long functions, too many parameters, and God Classes
- **Code Smells**: Identifies duplicate code, unused variables, missing comments

### Java Pattern Detection (50+ Patterns)

- **GoF Patterns (23)**: Singleton, Factory, Observer, Strategy, and more
- **Enterprise J2EE (15+)**: DAO, DTO, Service Locator, MVC, and more
- **Modern Patterns (6+)**: Repository, CQRS, Event Sourcing, and more

### Vue.js Pattern Detection (30+ Patterns)

- **Vue 3 Composables**: useCounter, useAuth, composable patterns
- **Component Patterns**: Provide/Inject, Teleport, Suspense
- **Anti-patterns**: Improper reactivity, incorrect lifecycle usage
- **Best Practices**: Composition API, proper typing, performance patterns

## 📖 Available MCP Tools

### TypeScript/JavaScript Tools

#### `validate_code`

Validates TypeScript/JavaScript code against configured patterns.

**Parameters:**

- `code` (string): The code to validate
- `filename` (string, optional): Filename for better context

**Example:**

```json
{
  "code": "class myClass { ... }",
  "filename": "example.ts"
}
```

#### `validate_file`

Validates a specific file from the filesystem.

**Parameters:**

- `filepath` (string): Path to the file to validate

#### `list_patterns`

Lists all configured patterns and rules.

#### `get_violations`

Gets a summary of common violations and suggestions.

**Parameters:**

- `severity` (string, optional): Filter by "warning", "error", or "info"

### Java Tools

#### `validate_java_code`

Detects 50+ design patterns in Java code.

**Parameters:**

- `code` (string): Java code to analyze
- `filename` (string, optional): Filename

**Example:**

```json
{
  "code": "public class DatabaseConnection { private static final DatabaseConnection INSTANCE = new DatabaseConnection(); ... }",
  "filename": "DatabaseConnection.java"
}
```

#### `validate_java_file`

Detects patterns in Java files from the filesystem.

**Parameters:**

- `filepath` (string): Path to the Java file (.java)

#### `list_java_patterns`

Lists all 50+ configured Java patterns (GoF, Enterprise, Modern).

See [JAVA_PATTERNS.md](./JAVA_PATTERNS.md) for complete list of detected patterns.

### Vue.js Tools

#### `validate_vue_code`

Detects 30+ Vue.js patterns and best practices.

**Parameters:**

- `code` (string): Vue SFC code to analyze
- `filename` (string, optional): Filename

#### `validate_vue_file`

Detects patterns in Vue files from the filesystem.

**Parameters:**

- `filepath` (string): Path to the Vue file (.vue)

#### `list_vue_patterns`

Lists all 30+ configured Vue.js patterns.

See [VUE_PATTERNS.md](./VUE_PATTERNS.md) for complete list of detected patterns.

## ⚙️ Configuration

Pattern Police uses configuration files for customization:

- `pattern-police.config.json` - TypeScript/JavaScript rules
- `java-patterns.config.json` - Java pattern definitions
- `vue-patterns.config.json` - Vue.js pattern definitions

### Default Configuration

**TypeScript/JavaScript:**

- **Naming**: PascalCase (classes), camelCase (functions/variables), UPPER_CASE (constants)
- **SOLID**: Max 50 lines/function, 10 methods/class, 5 parameters/function
- **Code Smells**: Detects duplication, long methods, God Classes, dead code

**Java:**

- Detects all 23 GoF patterns
- Detects 15+ Enterprise J2EE patterns
- Detects 6+ Modern architectural patterns

**Vue.js:**

- Detects Composition API patterns
- Validates component best practices
- Identifies anti-patterns and code smells

## 📋 Example Validations

### ✅ Good Code

```typescript
class UserService {
  getUserData(userId: string): User {
    return this.repository.find(userId);
  }
}

const MAX_RETRIES = 3;
```

### ⚠️ Warnings

```typescript
// ⚠️ Naming: class should use PascalCase
class userService {}

// ⚠️ SOLID: too many parameters
function createUser(name, email, age, address, phone, country) {}

// ⚠️ Code Smell: unused variable
const unusedVar = 42;
```

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd pattern-police-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

### Development Commands

```bash
# Development with auto-reload
npm run dev

# Build TypeScript
npm run build

# Run built version
npm start

# Test with MCP Inspector (built version)
npm run inspect

# Test with MCP Inspector (dev version)
npm run inspect:dev
```

### Project Structure

```
├── src/
│   ├── index.ts                         # Main MCP server
│   ├── types.ts                         # TypeScript/JavaScript types
│   ├── types-java.ts                    # Java types
│   ├── types-vue.ts                     # Vue.js types
│   └── validators/
│       ├── PatternValidator.ts          # TS/JS validator (AST)
│       ├── JavaPatternValidator.ts      # Java validator (CST)
│       └── VuePatternValidator.ts       # Vue.js validator (SFC)
├── examples/
│   ├── JavaPatterns/                    # Java pattern examples
│   └── VuePatterns/                     # Vue.js pattern examples
├── dist/                                # Compiled output
└── *.config.json                        # Configuration files
```

## 🧪 Testing

Test the server interactively with the MCP Inspector:

```bash
npm run inspect
```

This opens the inspector at `http://localhost:6274` where you can:

- Test all MCP tools with different parameters
- View real-time server logs
- Validate example code from `examples/` directory
- Experiment with different severities and configurations

## 🔗 Integration Examples

### Git Hooks

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Validate staged files before commit
npx pattern-police-mcp validate-files $(git diff --cached --name-only)
```

### CI/CD

```yaml
# GitHub Actions example
- name: Validate Code Patterns
  run: |
    npm install -g @cmiretf/pattern-police-mcp
    pattern-police validate-all
```

## 📚 Documentation

- [TypeScript/JavaScript Validation](./README.md#typescriptjavascript-validation)
- [Java Pattern Detection](./JAVA_PATTERNS.md)
- [Vue.js Pattern Detection](./VUE_PATTERNS.md)
- [Testing Guide](./TESTING.md)

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the **MIT License** - an open source license that allows you to use, modify, and distribute this software freely.

### What this means:

- ✅ **Free to use**: You can use this software in any project, commercial or personal
- ✅ **Open source**: The source code is publicly available and can be inspected, modified, and improved
- ✅ **Modify freely**: You can adapt the code to fit your specific needs
- ✅ **Distribute**: You can share the original or modified versions
- ✅ **Private use**: You can use it in proprietary projects without disclosing your source code

### License Text

Copyright (c) 2025 Carlos Miret Fiuza

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 🔍 Severity Levels

- **error**: Critical issues that should block commits
- **warning**: Important pattern violations (naming, SOLID)
- **info**: Suggestions for improvement (duplication, comments)

## 💡 Use Cases

- **Pre-commit validation**: Catch pattern violations before they reach the repo
- **Code reviews**: Automated pattern detection in PRs
- **Learning tool**: Understand design patterns through detection
- **Refactoring aid**: Identify areas needing improvement
- **Team standards**: Enforce consistent coding patterns across teams

## 🌟 Supported Languages

- TypeScript/JavaScript (ES6+)
- Java (8+)
- Vue.js (2.x and 3.x)

---

## 👤 Author

This project is developed and maintained by [Carlos Miret Fiuza](https://www.linkedin.com/in/carlos-miret-fiuza-87026a52/).  
Feel free to connect on LinkedIn for collaborations, suggestions, or any questions related to **Pattern Police MCP Server**!
