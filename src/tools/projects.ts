import { z } from "zod";
import type { GitLabClient } from "../gitlab-client.js";
import type { ToolRegistrar } from "../types.js";

export function registerProjectTools(register: ToolRegistrar, client: GitLabClient) {
  register(
    "list_projects",
    "プロジェクト一覧を取得します。検索やフィルタが可能です。",
    {
      search: z.string().optional().describe("検索キーワード"),
      owned: z.boolean().optional().describe("自分がオーナーのプロジェクトのみ"),
      membership: z.boolean().optional().describe("自分がメンバーのプロジェクトのみ"),
      visibility: z.enum(["public", "internal", "private"]).optional(),
      order_by: z.enum(["id", "name", "path", "created_at", "updated_at", "last_activity_at"]).optional(),
      sort: z.enum(["asc", "desc"]).optional(),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async (params) => {
      return await client.get("/projects", params as Record<string, string | number | boolean>);
    },
  );

  register(
    "get_project",
    "プロジェクトの詳細情報を取得します。",
    {
      project_id: z.string().describe("プロジェクトID（数値またはURLエンコードされたパス）"),
    },
    async ({ project_id }) => {
      return await client.get(`/projects/${encodeURIComponent(project_id)}`);
    },
  );
}
