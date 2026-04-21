import { z } from "zod";
import type { GitLabClient } from "../gitlab-client.js";
import type { ToolRegistrar } from "../types.js";

export function registerSearchTools(register: ToolRegistrar, client: GitLabClient) {
  register(
    "search",
    "GitLab内をグローバル検索します。プロジェクトやグループを絞り込むことも可能です。",
    {
      scope: z.enum(["projects", "issues", "merge_requests", "milestones", "snippet_titles", "wiki_blobs", "commits", "blobs", "notes", "users"]).describe("検索対象のスコープ"),
      search: z.string().describe("検索キーワード"),
      project_id: z.string().optional().describe("プロジェクトIDで絞り込み"),
      group_id: z.string().optional().describe("グループIDで絞り込み"),
      confidential: z.boolean().optional().describe("機密Issueのみ（scope=issuesの場合）"),
      state: z.enum(["opened", "closed"]).optional().describe("状態フィルタ（issues/merge_requestsの場合）"),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ project_id, group_id, ...params }) => {
      let path: string;
      if (project_id) {
        path = `/projects/${encodeURIComponent(project_id)}/search`;
      } else if (group_id) {
        path = `/groups/${encodeURIComponent(group_id)}/search`;
      } else {
        path = "/search";
      }
      return await client.get(path, params as Record<string, string | number | boolean>);
    },
  );
}
