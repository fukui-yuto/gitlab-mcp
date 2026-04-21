/**
 * 結合テスト: Docker上のGitLabインスタンスに対して実行
 *
 * 実行前に以下が必要:
 *   1. docker compose up -d (docker/ ディレクトリ)
 *   2. bash docker/setup.sh
 *   3. .env.test が生成されていること
 *
 * 実行: npm run test:integration
 */
import { describe, it, expect, beforeAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../../src/server.js";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv(): { url: string; token: string } {
  try {
    const envPath = resolve(import.meta.dirname, "../../.env.test");
    const content = readFileSync(envPath, "utf-8");
    const vars: Record<string, string> = {};
    for (const line of content.split("\n")) {
      const [key, ...rest] = line.split("=");
      if (key && rest.length > 0) {
        vars[key.trim()] = rest.join("=").trim();
      }
    }
    return {
      url: vars.GITLAB_URL || "http://localhost:8929",
      token: vars.GITLAB_PERSONAL_ACCESS_TOKEN || "",
    };
  } catch {
    return {
      url: process.env.GITLAB_URL || "http://localhost:8929",
      token: process.env.GITLAB_PERSONAL_ACCESS_TOKEN || "",
    };
  }
}

describe("Integration: GitLab MCP Server", () => {
  let client: Client;
  const env = loadEnv();

  beforeAll(async () => {
    if (!env.token) {
      console.warn("No token found. Run docker/setup.sh first. Skipping integration tests.");
      return;
    }

    const server = createServer({ baseUrl: env.url, token: env.token });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    client = new Client({ name: "integration-test", version: "1.0.0" });
    await Promise.all([
      client.connect(clientTransport),
      server.connect(serverTransport),
    ]);
  });

  it("list_projects returns projects", async () => {
    if (!env.token) return;

    const result = await client.callTool({
      name: "list_projects",
      arguments: { per_page: 5 },
    });

    const content = result.content as Array<{ type: string; text: string }>;
    const projects = JSON.parse(content[0].text);
    expect(Array.isArray(projects)).toBe(true);
  });

  it("get_project returns test project", async () => {
    if (!env.token) return;

    const result = await client.callTool({
      name: "get_project",
      arguments: { project_id: "root/test-project" },
    });

    const content = result.content as Array<{ type: string; text: string }>;
    const project = JSON.parse(content[0].text);
    expect(project.name).toBe("test-project");
  });

  it("list_issues returns issues", async () => {
    if (!env.token) return;

    const result = await client.callTool({
      name: "list_issues",
      arguments: { project_id: "1", state: "opened" },
    });

    const content = result.content as Array<{ type: string; text: string }>;
    const issues = JSON.parse(content[0].text);
    expect(Array.isArray(issues)).toBe(true);
  });

  it("create and update issue lifecycle", async () => {
    if (!env.token) return;

    // Create
    const createResult = await client.callTool({
      name: "create_issue",
      arguments: {
        project_id: "1",
        title: "Integration Test Issue",
        description: "Created by integration test",
      },
    });

    const content = createResult.content as Array<{ type: string; text: string }>;
    const created = JSON.parse(content[0].text);
    expect(created.title).toBe("Integration Test Issue");
    expect(created.iid).toBeGreaterThan(0);

    // Update (close)
    const updateResult = await client.callTool({
      name: "update_issue",
      arguments: {
        project_id: "1",
        issue_iid: created.iid,
        state_event: "close",
      },
    });

    const updateContent = updateResult.content as Array<{ type: string; text: string }>;
    const updated = JSON.parse(updateContent[0].text);
    expect(updated.state).toBe("closed");
  });

  it("list_branches returns branches", async () => {
    if (!env.token) return;

    const result = await client.callTool({
      name: "list_branches",
      arguments: { project_id: "1" },
    });

    const content = result.content as Array<{ type: string; text: string }>;
    const branches = JSON.parse(content[0].text);
    expect(Array.isArray(branches)).toBe(true);
    expect(branches.length).toBeGreaterThan(0);
  });

  it("get_file_contents returns README", async () => {
    if (!env.token) return;

    const result = await client.callTool({
      name: "get_file_contents",
      arguments: { project_id: "1", file_path: "README.md" },
    });

    const content = result.content as Array<{ type: string; text: string }>;
    const file = JSON.parse(content[0].text);
    expect(file.file_name).toBe("README.md");
    expect(file.encoding).toBe("text");
    expect(file.content).toBeTruthy();
  });
});
