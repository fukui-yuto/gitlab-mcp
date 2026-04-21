import { z } from "zod";
import type { GitLabClient } from "../gitlab-client.js";
import type { ToolRegistrar } from "../types.js";

export function registerMemberTools(register: ToolRegistrar, client: GitLabClient) {
  register(
    "list_project_members",
    "プロジェクトのメンバー一覧を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      query: z.string().optional().describe("ユーザー名またはメールで検索"),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ project_id, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/members`,
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "add_project_member",
    "プロジェクトにメンバーを追加します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      user_id: z.number().int().describe("追加するユーザーID"),
      access_level: z.number().int().describe("アクセスレベル（10=Guest, 20=Reporter, 30=Developer, 40=Maintainer, 50=Owner）"),
      expires_at: z.string().optional().describe("有効期限（YYYY-MM-DD）"),
    },
    async ({ project_id, ...body }) => {
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/members`,
        body as Record<string, unknown>,
      );
    },
  );

  register(
    "remove_project_member",
    "プロジェクトからメンバーを削除します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      user_id: z.number().int().describe("削除するユーザーID"),
    },
    async ({ project_id, user_id }) => {
      await client.delete(
        `/projects/${encodeURIComponent(project_id)}/members/${user_id}`,
      );
      return { message: "Member removed successfully" };
    },
  );
}
