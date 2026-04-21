import { describe, it, expect, vi, beforeEach } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../../src/server.js";

describe("MCP Server", () => {
  let client: Client;

  beforeEach(async () => {
    const server = createServer({
      baseUrl: "http://gitlab.test",
      token: "test-token",
    });

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    client = new Client({ name: "test-client", version: "1.0.0" });

    await Promise.all([
      client.connect(clientTransport),
      server.connect(serverTransport),
    ]);
  });

  describe("tool listing", () => {
    it("lists all tools", async () => {
      const { tools } = await client.listTools();
      const toolNames = tools.map((t) => t.name).sort();

      expect(toolNames).toEqual([
        "approve_merge_request",
        "cancel_pipeline",
        "create_branch",
        "create_issue",
        "create_merge_request",
        "create_merge_request_note",
        "create_or_update_file",
        "create_wiki_page",
        "fork_project",
        "get_file_contents",
        "get_issue",
        "get_job_log",
        "get_merge_request",
        "get_merge_request_diffs",
        "get_pipeline",
        "get_project",
        "list_branches",
        "list_deployments",
        "list_environments",
        "list_group_projects",
        "list_issues",
        "list_labels",
        "list_merge_requests",
        "list_milestones",
        "list_pipeline_jobs",
        "list_pipelines",
        "list_projects",
        "list_wiki_pages",
        "merge_merge_request",
        "retry_pipeline",
        "search",
        "update_issue",
      ]);
    });

    it("has 32 tools total", async () => {
      const { tools } = await client.listTools();
      expect(tools).toHaveLength(32);
    });
  });

  describe("tool execution with mocked fetch", () => {
    it("list_projects calls GitLab API", async () => {
      const mockProjects = [{ id: 1, name: "test-project" }];
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockProjects), { status: 200 }),
      );

      const result = await client.callTool({
        name: "list_projects",
        arguments: { page: 1, per_page: 10 },
      });

      expect(result.content).toHaveLength(1);
      const content = result.content as Array<{ type: string; text: string }>;
      expect(JSON.parse(content[0].text)).toEqual(mockProjects);
    });

    it("get_project calls correct endpoint", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 1 }), { status: 200 }),
      );

      await client.callTool({
        name: "get_project",
        arguments: { project_id: "my-group/my-project" },
      });

      const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(calledUrl).toContain("/projects/my-group%2Fmy-project");
    });

    it("create_issue sends correct body", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 1, iid: 1 }), { status: 201 }),
      );

      await client.callTool({
        name: "create_issue",
        arguments: {
          project_id: "1",
          title: "Test Issue",
          description: "Description",
          labels: "bug,urgent",
        },
      });

      const fetchCall = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.title).toBe("Test Issue");
      expect(body.labels).toBe("bug,urgent");
    });

    it("handles API errors gracefully", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response('{"message":"401 Unauthorized"}', {
          status: 401,
          statusText: "Unauthorized",
        }),
      );

      const result = await client.callTool({
        name: "list_projects",
        arguments: {},
      });

      expect(result.isError).toBe(true);
      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain("401");
    });

    it("get_file_contents decodes base64", async () => {
      const fileContent = "console.log('hello');";
      const base64Content = Buffer.from(fileContent).toString("base64");

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            file_name: "index.ts",
            file_path: "src/index.ts",
            size: fileContent.length,
            encoding: "base64",
            content: base64Content,
          }),
          { status: 200 },
        ),
      );

      const result = await client.callTool({
        name: "get_file_contents",
        arguments: { project_id: "1", file_path: "src/index.ts" },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      const parsed = JSON.parse(content[0].text);
      expect(parsed.content).toBe(fileContent);
      expect(parsed.encoding).toBe("text");
    });
  });
});
