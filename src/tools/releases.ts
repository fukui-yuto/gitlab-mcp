import { z } from "zod";
import type { GitLabClient } from "../gitlab-client.js";
import type { ToolRegistrar } from "../types.js";

export function registerReleaseTools(register: ToolRegistrar, client: GitLabClient) {
  register(
    "list_releases",
    "プロジェクトのリリース一覧を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      order_by: z.enum(["released_at", "created_at"]).optional(),
      sort: z.enum(["asc", "desc"]).optional(),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ project_id, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/releases`,
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "create_release",
    "新しいリリースを作成します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      tag_name: z.string().describe("リリースに紐づくタグ名"),
      name: z.string().optional().describe("リリース名"),
      description: z.string().optional().describe("リリースノート（Markdown）"),
      ref: z.string().optional().describe("タグが存在しない場合に作成元となるブランチやコミットSHA"),
      released_at: z.string().optional().describe("リリース日時（ISO 8601形式）"),
    },
    async ({ project_id, ...body }) => {
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/releases`,
        body as Record<string, unknown>,
      );
    },
  );
}
