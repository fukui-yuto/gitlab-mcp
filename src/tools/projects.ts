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

  register(
    "update_project",
    "プロジェクトの設定を更新します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      name: z.string().optional().describe("プロジェクト名"),
      description: z.string().optional().describe("プロジェクトの説明"),
      default_branch: z.string().optional().describe("デフォルトブランチ"),
      visibility: z.enum(["public", "internal", "private"]).optional(),
      merge_method: z.enum(["merge", "rebase_merge", "ff"]).optional().describe("マージ方法"),
      squash_option: z.enum(["never", "always", "default_on", "default_off"]).optional(),
      only_allow_merge_if_pipeline_succeeds: z.boolean().optional().describe("パイプライン成功時のみマージ可能"),
      only_allow_merge_if_all_discussions_are_resolved: z.boolean().optional().describe("全ディスカッション解決時のみマージ可能"),
      remove_source_branch_after_merge: z.boolean().optional().describe("マージ後にソースブランチを自動削除"),
      issues_enabled: z.boolean().optional(),
      merge_requests_enabled: z.boolean().optional(),
      wiki_enabled: z.boolean().optional(),
      snippets_enabled: z.boolean().optional(),
    },
    async ({ project_id, ...body }) => {
      return await client.put(
        `/projects/${encodeURIComponent(project_id)}`,
        body as Record<string, unknown>,
      );
    },
  );

  register(
    "list_protected_branches",
    "プロジェクトのプロテクトブランチ一覧を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      search: z.string().optional().describe("ブランチ名で検索"),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ project_id, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/protected_branches`,
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "protect_branch",
    "ブランチを保護します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      name: z.string().describe("保護するブランチ名（ワイルドカード可: feature-*）"),
      push_access_level: z.number().int().optional().describe("プッシュ権限レベル（0=No access, 30=Developer, 40=Maintainer）"),
      merge_access_level: z.number().int().optional().describe("マージ権限レベル（0=No access, 30=Developer, 40=Maintainer）"),
      allow_force_push: z.boolean().optional().describe("フォースプッシュを許可"),
    },
    async ({ project_id, ...body }) => {
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/protected_branches`,
        body as Record<string, unknown>,
      );
    },
  );

  register(
    "unprotect_branch",
    "ブランチの保護を解除します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      name: z.string().describe("保護を解除するブランチ名"),
    },
    async ({ project_id, name }) => {
      await client.delete(
        `/projects/${encodeURIComponent(project_id)}/protected_branches/${encodeURIComponent(name)}`,
      );
      return { message: "Branch unprotected successfully" };
    },
  );
}
