import { z } from "zod";
import type { GitLabClient } from "../gitlab-client.js";
import type { ToolRegistrar } from "../types.js";

export function registerDeploymentTools(register: ToolRegistrar, client: GitLabClient) {
  register(
    "list_deployments",
    "プロジェクトのデプロイメント一覧を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      environment: z.string().optional().describe("環境名でフィルタ"),
      status: z.enum(["created", "running", "success", "failed", "canceled", "blocked"]).optional(),
      order_by: z.enum(["id", "iid", "created_at", "updated_at", "finished_at", "ref"]).optional(),
      sort: z.enum(["asc", "desc"]).optional(),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ project_id, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/deployments`,
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "list_environments",
    "プロジェクトの環境一覧を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      name: z.string().optional().describe("環境名で検索"),
      search: z.string().optional().describe("環境名で部分一致検索"),
      states: z.enum(["available", "stopped", "stopping"]).optional(),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ project_id, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/environments`,
        params as Record<string, string | number | boolean>,
      );
    },
  );
}
