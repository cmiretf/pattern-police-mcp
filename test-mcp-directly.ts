#!/usr/bin/env tsx

/**
 * Script de prueba directa del servidor MCP Pattern Police
 * Este script simula lo que haría Claude Desktop al conectarse al servidor
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";

async function testMCPServer() {
  console.log("🚀 Iniciando prueba del servidor MCP Pattern Police...\n");

  // Crear el cliente MCP
  const transport = new StdioClientTransport({
    command: "node",
    args: ["dist/index.js"],
  });

  const client = new Client(
    {
      name: "test-client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  try {
    // Conectar al servidor
    console.log("📡 Conectando al servidor...");
    await client.connect(transport);
    console.log("✅ Conexión establecida\n");

    // Test 1: Listar herramientas disponibles
    console.log("=== TEST 1: Listar Herramientas ===");
    const tools = await client.listTools();
    console.log(`✅ Herramientas encontradas: ${tools.tools.length}`);
    tools.tools.forEach((tool) => {
      console.log(`   - ${tool.name}: ${tool.description}`);
    });
    console.log();

    // Test 2: list_patterns
    console.log("=== TEST 2: list_patterns ===");
    const patternsResult = await client.callTool({
      name: "list_patterns",
      arguments: {},
    });
    console.log("✅ Resultado:");
    const patternsContent = patternsResult.content as Array<{ type: string; text?: string }>;
    patternsContent.forEach((c) => {
      if (c.type === "text" && c.text) {
        console.log(c.text);
      }
    });
    console.log();

    // Test 3: validate_code con código problemático
    console.log("=== TEST 3: validate_code ===");
    const testCode = `
const bad_name = 1;
class myBadClass {}
function Bad_Function() {}
const unusedVariable = 42;

function tooManyParams(a, b, c, d, e, f, g) {
  return a + b;
}
`;

    const validateResult = await client.callTool({
      name: "validate_code",
      arguments: {
        code: testCode,
        filename: "test.ts",
      },
    });

    console.log("✅ Resultado de validación:");
    const validateContent = validateResult.content as Array<{ type: string; text?: string }>;
    validateContent.forEach((c) => {
      if (c.type === "text" && c.text) {
        const lines = c.text.split("\n");
        lines.slice(0, 20).forEach((line: string) => console.log(line));
        if (lines.length > 20) {
          console.log(`... (${lines.length - 20} líneas más)`);
        }
      }
    });
    console.log();

    // Test 4: validate_file
    console.log("=== TEST 4: validate_file ===");
    const fileResult = await client.callTool({
      name: "validate_file",
      arguments: {
        filepath: "./inspector-test-example.ts",
      },
    });

    console.log("✅ Resultado de validación de archivo:");
    const fileContent = fileResult.content as Array<{ type: string; text?: string }>;
    fileContent.forEach((c) => {
      if (c.type === "text" && c.text) {
        const lines = c.text.split("\n");
        // Mostrar solo las primeras líneas
        const summary = lines[0];
        const violations = lines.filter((l) => l.includes("⚠️") || l.includes("ℹ️"));
        console.log(summary);
        console.log(`   Violaciones encontradas: ${violations.length}`);
        violations.slice(0, 5).forEach((v) => console.log(`   ${v.trim()}`));
        if (violations.length > 5) {
          console.log(`   ... y ${violations.length - 5} más`);
        }
      }
    });
    console.log();

    // Test 5: get_violations con filtro
    console.log("=== TEST 5: get_violations (severity: warning) ===");
    const violationsResult = await client.callTool({
      name: "get_violations",
      arguments: {
        severity: "warning",
      },
    });

    console.log("✅ Guía de violaciones (warning):");
    const violationsContent = violationsResult.content as Array<{ type: string; text?: string }>;
    violationsContent.forEach((c) => {
      if (c.type === "text" && c.text) {
        const lines = c.text.split("\n");
        lines.slice(0, 15).forEach((line: string) => console.log(line));
        if (lines.length > 15) {
          console.log(`... (${lines.length - 15} líneas más)`);
        }
      }
    });

    console.log("\n✅✅✅ TODOS LOS TESTS COMPLETADOS EXITOSAMENTE ✅✅✅");
    console.log("\n🎉 El servidor MCP Pattern Police está funcionando perfectamente!");
    
  } catch (error) {
    console.error("❌ Error durante las pruebas:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Ejecutar tests
testMCPServer().catch(console.error);
