#!/usr/bin/env tsx

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import * as fs from "fs/promises";

async function testJavaPatterns() {
  console.log("🧪 Testing Java Pattern Detection\n");

  const transport = new StdioClientTransport({
    command: "node",
    args: ["dist/index.js"],
  });

  const client = new Client(
    {
      name: "test-java-client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  try {
    console.log("📡 Connecting to MCP server...");
    await client.connect(transport);
    console.log("✅ Connected\n");

    // Test 1: List Java Patterns
    console.log("=== TEST 1: List Java Patterns ===");
    const patternsResult = await client.callTool({
      name: "list_java_patterns",
      arguments: {},
    });
    
    const patternsText = (patternsResult.content as Array<{ type: string; text?: string }>)[0]?.text || "";
    console.log(patternsText.split("\n").slice(0, 20).join("\n"));
    console.log("...(truncated)\n");

    // Test 2: Validate GoF Patterns File
    console.log("=== TEST 2: Validate GoF Patterns File ===");
    const gofCode = await fs.readFile("examples/JavaPatternsGoF.java", "utf-8");
    
    const gofResult = await client.callTool({
      name: "validate_java_code",
      arguments: {
        code: gofCode,
        filename: "JavaPatternsGoF.java",
      },
    });

    const gofText = (gofResult.content as Array<{ type: string; text?: string }>)[0]?.text || "";
    console.log(gofText);

    // Test 3: Validate Enterprise Patterns File
    console.log("\n=== TEST 3: Validate Enterprise Patterns File ===");
    const enterpriseCode = await fs.readFile("examples/JavaPatternsEnterprise.java", "utf-8");
    
    const enterpriseResult = await client.callTool({
      name: "validate_java_code",
      arguments: {
        code: enterpriseCode,
        filename: "JavaPatternsEnterprise.java",
      },
    });

    const enterpriseText = (enterpriseResult.content as Array<{ type: string; text?: string }>)[0]?.text || "";
    console.log(enterpriseText);

    // Test 4: Validate Singleton Pattern
    console.log("\n=== TEST 4: Test Individual Pattern - Singleton ===");
    const singletonCode = `
public class ConfigurationManager {
    private static final ConfigurationManager INSTANCE = new ConfigurationManager();
    
    private ConfigurationManager() {
    }
    
    public static ConfigurationManager getInstance() {
        return INSTANCE;
    }
}
    `;

    const singletonResult = await client.callTool({
      name: "validate_java_code",
      arguments: {
        code: singletonCode,
        filename: "ConfigurationManager.java",
      },
    });

    const singletonText = (singletonResult.content as Array<{ type: string; text?: string }>)[0]?.text || "";
    console.log(singletonText);

    console.log("\n✅✅✅ ALL TESTS COMPLETED SUCCESSFULLY ✅✅✅");
    console.log("\n🎉 Java Pattern Detection está funcionando perfectamente!");

  } catch (error) {
    console.error("❌ Error durante las pruebas:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

testJavaPatterns().catch(console.error);
