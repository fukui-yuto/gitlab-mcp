import { z } from "zod";
import type { GitLabClient } from "../gitlab-client.js";
import type { ToolRegistrar } from "../types.js";

export function registerEventTools(register: ToolRegistrar, client: GitLabClient) {
  register(
    "list_project_events",
    "プロジェクトのアクティビティイベント一覧を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      action: z.enum(["created", "updated", "closed", "reopened", "pushed", "commented", "merged", "joined", "left", "destroyed", "expired"]).optional().describe("アクションでフィルタ"),
      target_type: z.enum(["issue", "milestone", "merge_request", "note", "project", "snippet", "user"]).optional().describe("ターゲットタイプでフィルタ"),
      after: z.string().optional().describe("この日付以降のイベント（YYYY-MM-DD）"),
      before: z.string().optional().describe("この日付以前のイベント（YYYY-MM-DD）"),
      sort: z.enum(["asc", "desc"]).optional(),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ project_id, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/events`,
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "list_user_events",
    "ユーザーのアクティビティイベント一覧を取得します。",
    {
      user_id: z.number().int().describe("ユーザーID"),
      action: z.enum(["created", "updated", "closed", "reopened", "pushed", "commented", "merged", "joined", "left", "destroyed", "expired"]).optional().describe("アクションでフィルタ"),
      target_type: z.enum(["issue", "milestone", "merge_request", "note", "project", "snippet", "user"]).optional().describe("ターゲットタイプでフィルタ"),
      after: z.string().optional().describe("この日付以降のイベント（YYYY-MM-DD）"),
      before: z.string().optional().describe("この日付以前のイベント（YYYY-MM-DD）"),
      sort: z.enum(["asc", "desc"]).optional(),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ user_id, ...params }) => {
      return await client.get(
        `/users/${user_id}/events`,
        params as Record<string, string | number | boolean>,
      );
    },
  );
}
