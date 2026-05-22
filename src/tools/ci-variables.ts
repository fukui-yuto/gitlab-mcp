import { z } from "zod";
import type { GitLabClient } from "../gitlab-client.js";
import type { ToolRegistrar } from "../types.js";

export function registerCiVariableTools(register: ToolRegistrar, client: GitLabClient) {
  register(
    "list_project_variables",
    "プロジェクトのCI/CD変数一覧を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ project_id, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/variables`,
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "get_project_variable",
    "プロジェクトのCI/CD変数の詳細を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      key: z.string().describe("変数キー名"),
      filter: z.object({
        environment_scope: z.string().optional().describe("環境スコープ"),
      }).optional(),
    },
    async ({ project_id, key, filter }) => {
      const params: Record<string, string> = {};
      if (filter?.environment_scope) {
        params["filter[environment_scope]"] = filter.environment_scope;
      }
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/variables/${encodeURIComponent(key)}`,
        params,
      );
    },
  );

  register(
    "create_project_variable",
    "プロジェクトにCI/CD変数を作成します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      key: z.string().describe("変数キー名"),
      value: z.string().describe("変数の値"),
      variable_type: z.enum(["env_var", "file"]).optional().default("env_var"),
      protected: z.boolean().optional().describe("保護されたブランチ/タグでのみ利用可能"),
      masked: z.boolean().optional().describe("ジョブログでマスクする"),
      raw: z.boolean().optional().describe("変数を展開せずそのまま使用"),
      environment_scope: z.string().optional().describe("環境スコープ（例: production, *）"),
    },
    async ({ project_id, ...body }) => {
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/variables`,
        body as Record<string, unknown>,
      );
    },
  );

  register(
    "update_project_variable",
    "プロジェクトのCI/CD変数を更新します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      key: z.string().describe("変数キー名"),
      value: z.string().describe("新しい値"),
      variable_type: z.enum(["env_var", "file"]).optional(),
      protected: z.boolean().optional(),
      masked: z.boolean().optional(),
      raw: z.boolean().optional(),
      environment_scope: z.string().optional(),
    },
    async ({ project_id, key, ...body }) => {
      return await client.put(
        `/projects/${encodeURIComponent(project_id)}/variables/${encodeURIComponent(key)}`,
        body as Record<string, unknown>,
      );
    },
  );

  register(
    "delete_project_variable",
    "プロジェクトのCI/CD変数を削除します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      key: z.string().describe("変数キー名"),
    },
    async ({ project_id, key }) => {
      await client.delete(
        `/projects/${encodeURIComponent(project_id)}/variables/${encodeURIComponent(key)}`,
      );
      return { message: "Variable deleted successfully" };
    },
  );

  register(
    "list_group_variables",
    "グループのCI/CD変数一覧を取得します。",
    {
      group_id: z.string().describe("グループID"),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ group_id, ...params }) => {
      return await client.get(
        `/groups/${encodeURIComponent(group_id)}/variables`,
        params as Record<string, string | number | boolean>,
      );
    },
  );
}
