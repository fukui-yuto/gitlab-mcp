import { z } from "zod";
import type { GitLabClient } from "../gitlab-client.js";
import type { ToolRegistrar } from "../types.js";

export function registerMilestoneTools(register: ToolRegistrar, client: GitLabClient) {
  register(
    "list_milestones",
    "プロジェクトのマイルストーン一覧を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      state: z.enum(["active", "closed"]).optional(),
      search: z.string().optional().describe("タイトルで検索"),
      include_parent_milestones: z.boolean().optional().describe("親グループのマイルストーンを含める"),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ project_id, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/milestones`,
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "create_milestone",
    "プロジェクトに新しいマイルストーンを作成します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      title: z.string().describe("マイルストーンタイトル"),
      description: z.string().optional().describe("マイルストーンの説明"),
      due_date: z.string().optional().describe("期限（YYYY-MM-DD）"),
      start_date: z.string().optional().describe("開始日（YYYY-MM-DD）"),
    },
    async ({ project_id, ...body }) => {
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/milestones`,
        body as Record<string, unknown>,
      );
    },
  );

  register(
    "update_milestone",
    "既存のマイルストーンを更新します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      milestone_id: z.number().int().describe("マイルストーンID"),
      title: z.string().optional().describe("新しいタイトル"),
      description: z.string().optional().describe("新しい説明"),
      due_date: z.string().optional().describe("新しい期限（YYYY-MM-DD）"),
      start_date: z.string().optional().describe("新しい開始日（YYYY-MM-DD）"),
      state_event: z.enum(["close", "activate"]).optional().describe("状態変更"),
    },
    async ({ project_id, milestone_id, ...body }) => {
      return await client.put(
        `/projects/${encodeURIComponent(project_id)}/milestones/${milestone_id}`,
        body as Record<string, unknown>,
      );
    },
  );

  register(
    "delete_milestone",
    "マイルストーンを削除します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      milestone_id: z.number().int().describe("マイルストーンID"),
    },
    async ({ project_id, milestone_id }) => {
      await client.delete(
        `/projects/${encodeURIComponent(project_id)}/milestones/${milestone_id}`,
      );
      return { message: "Milestone deleted successfully" };
    },
  );
}
