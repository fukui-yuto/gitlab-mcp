import { z } from "zod";
import type { GitLabClient } from "../gitlab-client.js";
import type { ToolRegistrar } from "../types.js";

export function registerRunnerTools(register: ToolRegistrar, client: GitLabClient) {
  register(
    "list_project_runners",
    "プロジェクトで利用可能なランナー一覧を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      status: z.enum(["online", "offline", "stale", "never_contacted", "active", "paused"]).optional(),
      type: z.enum(["instance_type", "group_type", "project_type"]).optional(),
      tag_list: z.string().optional().describe("カンマ区切りのタグ"),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ project_id, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/runners`,
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "get_runner",
    "ランナーの詳細情報を取得します。",
    {
      runner_id: z.number().int().describe("ランナーID"),
    },
    async ({ runner_id }) => {
      return await client.get(`/runners/${runner_id}`);
    },
  );

  register(
    "list_runners",
    "現在のユーザーが利用可能な全ランナー一覧を取得します。",
    {
      status: z.enum(["online", "offline", "stale", "never_contacted", "active", "paused"]).optional(),
      type: z.enum(["instance_type", "group_type", "project_type"]).optional(),
      tag_list: z.string().optional().describe("カンマ区切りのタグ"),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async (params) => {
      return await client.get(
        "/runners",
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "list_runner_jobs",
    "ランナーが実行したジョブ一覧を取得します。",
    {
      runner_id: z.number().int().describe("ランナーID"),
      status: z.enum(["running", "success", "failed", "canceled"]).optional(),
      order_by: z.enum(["id"]).optional(),
      sort: z.enum(["asc", "desc"]).optional(),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ runner_id, ...params }) => {
      return await client.get(
        `/runners/${runner_id}/jobs`,
        params as Record<string, string | number | boolean>,
      );
    },
  );
}
