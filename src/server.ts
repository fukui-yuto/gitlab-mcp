import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GitLabClient } from "./gitlab-client.js";
import type { ToolRegistrar } from "./types.js";
import { registerProjectTools } from "./tools/projects.js";
import { registerIssueTools } from "./tools/issues.js";
import { registerMergeRequestTools } from "./tools/merge-requests.js";
import { registerRepositoryTools } from "./tools/repository.js";
import { registerPipelineTools } from "./tools/pipelines.js";
import { registerLabelTools } from "./tools/labels.js";
import { registerSearchTools } from "./tools/search.js";
import { registerMilestoneTools } from "./tools/milestones.js";
import { registerDeploymentTools } from "./tools/deployments.js";
import { registerWikiTools } from "./tools/wiki.js";
import { registerGroupTools } from "./tools/groups.js";
import { registerUserTools } from "./tools/users.js";
import { registerMemberTools } from "./tools/members.js";
import { registerReleaseTools } from "./tools/releases.js";
import { registerSnippetTools } from "./tools/snippets.js";
import type { z } from "zod";
import { GitLabApiError } from "./gitlab-client.js";

export function createServer(config: { baseUrl: string; token: string }): McpServer {
  const client = new GitLabClient(config);

  const server = new McpServer({
    name: "gitlab-mcp",
    version: "0.1.0",
  });

  // ツール登録のラッパー: エラーハンドリングを共通化
  const register: ToolRegistrar = (name, description, schema, handler) => {
    server.tool(
      name,
      description,
      schema as Record<string, z.ZodTypeAny>,
      async (params) => {
        try {
          const result = await handler(params as never);
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (error) {
          if (error instanceof GitLabApiError) {
            return {
              content: [
                {
                  type: "text" as const,
                  text: `GitLab API Error (${error.status}): ${error.body}`,
                },
              ],
              isError: true,
            };
          }
          const message = error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: ${message}`,
              },
            ],
            isError: true,
          };
        }
      },
    );
  };

  // 各ツールモジュールを登録
  registerProjectTools(register, client);
  registerIssueTools(register, client);
  registerMergeRequestTools(register, client);
  registerRepositoryTools(register, client);
  registerPipelineTools(register, client);
  registerLabelTools(register, client);
  registerSearchTools(register, client);
  registerMilestoneTools(register, client);
  registerDeploymentTools(register, client);
  registerWikiTools(register, client);
  registerGroupTools(register, client);
  registerUserTools(register, client);
  registerMemberTools(register, client);
  registerReleaseTools(register, client);
  registerSnippetTools(register, client);

  return server;
}
