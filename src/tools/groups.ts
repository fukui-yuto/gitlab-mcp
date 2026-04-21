import { z } from "zod";
import type { GitLabClient } from "../gitlab-client.js";
import type { ToolRegistrar } from "../types.js";

export function registerGroupTools(register: ToolRegistrar, client: GitLabClient) {
  register(
    "list_groups",
    "グループ一覧を取得します。",
    {
      search: z.string().optional().describe("グループ名で検索"),
      owned: z.boolean().optional().describe("自分がオーナーのグループのみ"),
      min_access_level: z.number().int().optional().describe("最小アクセスレベル"),
      order_by: z.enum(["name", "path", "id", "similarity"]).optional(),
      sort: z.enum(["asc", "desc"]).optional(),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async (params) => {
      return await client.get(
        "/groups",
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "get_group",
    "グループの詳細情報を取得します。",
    {
      group_id: z.string().describe("グループID（数値またはURLエンコードされたパス）"),
    },
    async ({ group_id }) => {
      return await client.get(
        `/groups/${encodeURIComponent(group_id)}`,
      );
    },
  );

  register(
    "fork_project",
    "プロジェクトをフォークします。",
    {
      project_id: z.string().describe("フォーク元のプロジェクトID"),
      namespace_id: z.number().optional().describe("フォーク先のネームスペースID"),
      namespace_path: z.string().optional().describe("フォーク先のネームスペースパス"),
      name: z.string().optional().describe("フォーク後のプロジェクト名"),
      path: z.string().optional().describe("フォーク後のプロジェクトパス"),
      visibility: z.enum(["public", "internal", "private"]).optional(),
    },
    async ({ project_id, ...body }) => {
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/fork`,
        body as Record<string, unknown>,
      );
    },
  );

  register(
    "list_group_projects",
    "グループに属するプロジェクト一覧を取得します。",
    {
      group_id: z.string().describe("グループID（数値またはURLエンコードされたパス）"),
      search: z.string().optional().describe("プロジェクト名で検索"),
      visibility: z.enum(["public", "internal", "private"]).optional(),
      archived: z.boolean().optional().describe("アーカイブ済みのみ"),
      with_shared: z.boolean().optional().describe("共有プロジェクトを含める"),
      include_subgroups: z.boolean().optional().describe("サブグループのプロジェクトを含める"),
      order_by: z.enum(["id", "name", "path", "created_at", "updated_at", "last_activity_at", "similarity"]).optional(),
      sort: z.enum(["asc", "desc"]).optional(),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ group_id, ...params }) => {
      return await client.get(
        `/groups/${encodeURIComponent(group_id)}/projects`,
        params as Record<string, string | number | boolean>,
      );
    },
  );
}
