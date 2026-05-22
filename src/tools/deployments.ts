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

  register(
    "delete_environment",
    "プロジェクトの環境を削除します。停止済みの環境のみ削除できます。",
    {
      project_id: z.string().describe("プロジェクトID"),
      environment_id: z.number().int().describe("環境ID"),
    },
    async ({ project_id, environment_id }) => {
      await client.delete(
        `/projects/${encodeURIComponent(project_id)}/environments/${environment_id}`,
      );
      return { message: "Environment deleted successfully" };
    },
  );

  register(
    "get_environment",
    "環境の詳細情報を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      environment_id: z.number().int().describe("環境ID"),
    },
    async ({ project_id, environment_id }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/environments/${environment_id}`,
      );
    },
  );

  register(
    "create_environment",
    "プロジェクトに新しい環境を作成します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      name: z.string().describe("環境名（例: production, staging）"),
      external_url: z.string().optional().describe("外部URL"),
      tier: z.enum(["production", "staging", "testing", "development", "other"]).optional().describe("環境のティア"),
    },
    async ({ project_id, ...body }) => {
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/environments`,
        body as Record<string, unknown>,
      );
    },
  );

  register(
    "update_environment",
    "環境を更新します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      environment_id: z.number().int().describe("環境ID"),
      name: z.string().optional().describe("新しい環境名"),
      external_url: z.string().optional().describe("新しい外部URL"),
      tier: z.enum(["production", "staging", "testing", "development", "other"]).optional(),
    },
    async ({ project_id, environment_id, ...body }) => {
      return await client.put(
        `/projects/${encodeURIComponent(project_id)}/environments/${environment_id}`,
        body as Record<string, unknown>,
      );
    },
  );

  register(
    "stop_environment",
    "環境を停止します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      environment_id: z.number().int().describe("環境ID"),
    },
    async ({ project_id, environment_id }) => {
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/environments/${environment_id}/stop`,
      );
    },
  );
}
