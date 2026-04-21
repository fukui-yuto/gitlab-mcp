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
}
