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
        "add_group_member",
        "add_issue_time_spent",
        "add_project_member",
        "approve_merge_request",
        "cancel_pipeline",
        "check_issues_formatting",
        "check_repository_formatting",
        "check_wiki_formatting",
        "cherry_pick_commit",
        "compare_branches",
        "create_branch",
        "create_environment",
        "create_group",
        "create_issue",
        "create_issue_discussion",
        "create_issue_link",
        "create_issue_note",
        "create_label",
        "create_merge_request",
        "create_merge_request_discussion",
        "create_merge_request_note",
        "create_milestone",
        "create_or_update_file",
        "create_pipeline",
        "create_pipeline_schedule",
        "create_project",
        "create_project_access_token",
        "create_project_variable",
        "create_release",
        "create_snippet",
        "create_tag",
        "create_webhook",
        "create_wiki_page",
        "delete_branch",
        "delete_environment",
        "delete_file",
        "delete_group",
        "delete_issue",
        "delete_issue_link",
        "delete_issue_note",
        "delete_label",
        "delete_merge_request",
        "delete_merge_request_note",
        "delete_milestone",
        "delete_pipeline",
        "delete_pipeline_schedule",
        "delete_project",
        "delete_project_variable",
        "delete_release",
        "delete_snippet",
        "delete_tag",
        "delete_webhook",
        "delete_wiki_page",
        "fork_project",
        "get_commit",
        "get_current_user",
        "get_environment",
        "get_file_contents",
        "get_group",
        "get_issue",
        "get_issue_time_tracking_stats",
        "get_job_artifacts",
        "get_job_log",
        "get_merge_request",
        "get_merge_request_diffs",
        "get_pipeline",
        "get_pipeline_schedule",
        "get_project",
        "get_project_variable",
        "get_release",
        "get_repository_blame",
        "get_runner",
        "get_snippet",
        "get_user",
        "get_webhook",
        "get_wiki_page",
        "list_branches",
        "list_commits",
        "list_deployments",
        "list_environments",
        "list_group_members",
        "list_group_projects",
        "list_group_variables",
        "list_groups",
        "list_issue_discussions",
        "list_issue_label_events",
        "list_issue_links",
        "list_issue_notes",
        "list_issues",
        "list_labels",
        "list_merge_request_commits",
        "list_merge_request_discussions",
        "list_merge_request_notes",
        "list_merge_requests",
        "list_milestones",
        "list_pipeline_jobs",
        "list_pipeline_schedules",
        "list_pipelines",
        "list_project_access_tokens",
        "list_project_events",
        "list_project_members",
        "list_project_runners",
        "list_project_variables",
        "list_projects",
        "list_protected_branches",
        "list_related_merge_requests",
        "list_releases",
        "list_repository_contributors",
        "list_repository_tree",
        "list_runner_jobs",
        "list_runners",
        "list_snippets",
        "list_tags",
        "list_user_events",
        "list_users",
        "list_webhooks",
        "list_wiki_pages",
        "merge_merge_request",
        "play_job",
        "protect_branch",
        "remove_group_member",
        "remove_project_member",
        "resolve_discussion",
        "retry_pipeline",
        "revert_commit",
        "revoke_project_access_token",
        "search",
        "set_issue_time_estimate",
        "stop_environment",
        "subscribe_to_issue",
        "unprotect_branch",
        "unsubscribe_from_issue",
        "update_environment",
        "update_group",
        "update_issue",
        "update_issue_note",
        "update_label",
        "update_merge_request",
        "update_merge_request_note",
        "update_milestone",
        "update_pipeline_schedule",
        "update_project",
        "update_project_variable",
        "update_release",
        "update_snippet",
        "update_webhook",
        "update_wiki_page",
      ]);
    });

    it("has 147 tools total", async () => {
      const { tools } = await client.listTools();
      expect(tools).toHaveLength(147);
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

      const fetchSpy = vi.spyOn(globalThis, "fetch");
      // 1st call: get project default_branch (ref未指定時)
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ default_branch: "main" }), { status: 200 }),
      );
      // 2nd call: get file contents
      fetchSpy.mockResolvedValueOnce(
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
