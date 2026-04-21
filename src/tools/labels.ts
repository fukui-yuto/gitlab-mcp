import { z } from "zod";
import type { GitLabClient } from "../gitlab-client.js";
import type { ToolRegistrar } from "../types.js";

export function registerLabelTools(register: ToolRegistrar, client: GitLabClient) {
  register(
    "list_labels",
    "プロジェクトのラベル一覧を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      search: z.string().optional().describe("ラベル名で検索"),
      with_counts: z.boolean().optional().describe("Issue/MRの件数を含める"),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ project_id, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/labels`,
        params as Record<string, string | number | boolean>,
      );
    },
  );
}
