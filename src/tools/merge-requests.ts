import { z } from "zod";
import type { GitLabClient } from "../gitlab-client.js";
import type { ToolRegistrar } from "../types.js";

export function registerMergeRequestTools(register: ToolRegistrar, client: GitLabClient) {
  register(
    "list_merge_requests",
    "プロジェクトのMerge Request一覧を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      state: z.enum(["opened", "closed", "merged", "locked", "all"]).optional().default("opened"),
      labels: z.string().optional().describe("カンマ区切りのラベル名"),
      milestone: z.string().optional(),
      author_id: z.number().optional(),
      assignee_id: z.number().optional(),
      reviewer_id: z.number().optional(),
      search: z.string().optional().describe("タイトルまたは説明で検索"),
      source_branch: z.string().optional(),
      target_branch: z.string().optional(),
      order_by: z.enum(["created_at", "updated_at"]).optional(),
      sort: z.enum(["asc", "desc"]).optional(),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ project_id, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/merge_requests`,
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "get_merge_request",
    "Merge Requestの詳細情報を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      merge_request_iid: z.number().int().describe("MRのIID"),
    },
    async ({ project_id, merge_request_iid }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/merge_requests/${merge_request_iid}`,
      );
    },
  );

  register(
    "create_merge_request",
    "新しいMerge Requestを作成します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      title: z.string().describe("MRタイトル"),
      source_branch: z.string().describe("ソースブランチ"),
      target_branch: z.string().describe("ターゲットブランチ"),
      description: z.string().optional().describe("MR説明（Markdown）"),
      assignee_ids: z.array(z.number()).optional(),
      reviewer_ids: z.array(z.number()).optional(),
      labels: z.string().optional(),
      milestone_id: z.number().optional(),
      remove_source_branch: z.boolean().optional().describe("マージ後にソースブランチを削除"),
      squash: z.boolean().optional().describe("スカッシュマージを有効化"),
    },
    async ({ project_id, ...body }) => {
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/merge_requests`,
        body as Record<string, unknown>,
      );
    },
  );

  register(
    "get_merge_request_diffs",
    "Merge Requestの変更差分を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      merge_request_iid: z.number().int().describe("MRのIID"),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ project_id, merge_request_iid, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/merge_requests/${merge_request_iid}/diffs`,
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "create_merge_request_note",
    "Merge Requestにコメントを投稿します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      merge_request_iid: z.number().int().describe("MRのIID"),
      body: z.string().describe("コメント本文（Markdown）"),
    },
    async ({ project_id, merge_request_iid, body }) => {
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/merge_requests/${merge_request_iid}/notes`,
        { body },
      );
    },
  );

  // --- Phase 2 ---

  register(
    "merge_merge_request",
    "Merge Requestをマージします。",
    {
      project_id: z.string().describe("プロジェクトID"),
      merge_request_iid: z.number().int().describe("MRのIID"),
      merge_commit_message: z.string().optional().describe("マージコミットメッセージ"),
      squash_commit_message: z.string().optional().describe("スカッシュコミットメッセージ"),
      squash: z.boolean().optional().describe("スカッシュマージを使用"),
      should_remove_source_branch: z.boolean().optional().describe("ソースブランチを削除"),
      merge_when_pipeline_succeeds: z.boolean().optional().describe("パイプライン成功時に自動マージ"),
      sha: z.string().optional().describe("HEADコミットSHA（楽観的ロック用）"),
    },
    async ({ project_id, merge_request_iid, ...body }) => {
      return await client.put(
        `/projects/${encodeURIComponent(project_id)}/merge_requests/${merge_request_iid}/merge`,
        body as Record<string, unknown>,
      );
    },
  );

  register(
    "approve_merge_request",
    "Merge Requestを承認します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      merge_request_iid: z.number().int().describe("MRのIID"),
      sha: z.string().optional().describe("HEADコミットSHA（楽観的ロック用）"),
    },
    async ({ project_id, merge_request_iid, sha }) => {
      const body: Record<string, unknown> = {};
      if (sha) body.sha = sha;
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/merge_requests/${merge_request_iid}/approve`,
        body,
      );
    },
  );

  register(
    "list_merge_request_notes",
    "Merge Requestのコメント（ノート）一覧を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      merge_request_iid: z.number().int().describe("MRのIID"),
      sort: z.enum(["asc", "desc"]).optional().describe("ソート順"),
      order_by: z.enum(["created_at", "updated_at"]).optional(),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ project_id, merge_request_iid, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/merge_requests/${merge_request_iid}/notes`,
        params as Record<string, string | number | boolean>,
      );
    },
  );
}
