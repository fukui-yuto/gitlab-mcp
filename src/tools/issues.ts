import { z } from "zod";
import type { GitLabClient } from "../gitlab-client.js";
import type { ToolRegistrar } from "../types.js";

export function registerIssueTools(register: ToolRegistrar, client: GitLabClient) {
  register(
    "list_issues",
    "プロジェクトのIssue一覧を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      state: z.enum(["opened", "closed", "all"]).optional().default("opened"),
      labels: z.string().optional().describe("カンマ区切りのラベル名"),
      milestone: z.string().optional().describe("マイルストーン名"),
      assignee_id: z.number().optional().describe("アサインされたユーザーID"),
      search: z.string().optional().describe("タイトルまたは説明で検索"),
      order_by: z.enum(["created_at", "updated_at", "priority", "due_date", "relative_position", "label_priority", "milestone_due", "popularity", "weight"]).optional(),
      sort: z.enum(["asc", "desc"]).optional(),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ project_id, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/issues`,
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "get_issue",
    "Issueの詳細情報を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      issue_iid: z.number().int().describe("IssueのIID（プロジェクト内番号）"),
    },
    async ({ project_id, issue_iid }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/issues/${issue_iid}`,
      );
    },
  );

  register(
    "create_issue",
    "新しいIssueを作成します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      title: z.string().describe("Issueタイトル"),
      description: z.string().optional().describe("Issue本文（Markdown）"),
      assignee_ids: z.array(z.number()).optional().describe("アサインするユーザーIDの配列"),
      labels: z.string().optional().describe("カンマ区切りのラベル名"),
      milestone_id: z.number().optional().describe("マイルストーンID"),
      confidential: z.boolean().optional(),
      due_date: z.string().optional().describe("期限（YYYY-MM-DD）"),
    },
    async ({ project_id, ...body }) => {
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/issues`,
        body as Record<string, unknown>,
      );
    },
  );

  register(
    "update_issue",
    "既存のIssueを更新します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      issue_iid: z.number().int().describe("IssueのIID"),
      title: z.string().optional().describe("新しいタイトル"),
      description: z.string().optional().describe("新しい説明"),
      state_event: z.enum(["close", "reopen"]).optional().describe("状態変更"),
      assignee_ids: z.array(z.number()).optional(),
      labels: z.string().optional(),
      milestone_id: z.number().optional(),
      confidential: z.boolean().optional(),
      due_date: z.string().optional(),
    },
    async ({ project_id, issue_iid, ...body }) => {
      return await client.put(
        `/projects/${encodeURIComponent(project_id)}/issues/${issue_iid}`,
        body as Record<string, unknown>,
      );
    },
  );

  register(
    "list_issue_notes",
    "Issueのコメント（ノート）一覧を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      issue_iid: z.number().int().describe("IssueのIID"),
      sort: z.enum(["asc", "desc"]).optional().describe("ソート順"),
      order_by: z.enum(["created_at", "updated_at"]).optional(),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ project_id, issue_iid, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/issues/${issue_iid}/notes`,
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "create_issue_note",
    "Issueにコメントを投稿します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      issue_iid: z.number().int().describe("IssueのIID"),
      body: z.string().describe("コメント本文（Markdown）"),
      confidential: z.boolean().optional().describe("内部コメントにする"),
    },
    async ({ project_id, issue_iid, ...body }) => {
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/issues/${issue_iid}/notes`,
        body as Record<string, unknown>,
      );
    },
  );

  register(
    "list_issue_links",
    "Issue間のリンク一覧を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      issue_iid: z.number().int().describe("IssueのIID"),
    },
    async ({ project_id, issue_iid }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/issues/${issue_iid}/links`,
      );
    },
  );

  register(
    "create_issue_link",
    "Issue同士をリンクします。",
    {
      project_id: z.string().describe("プロジェクトID"),
      issue_iid: z.number().int().describe("リンク元IssueのIID"),
      target_project_id: z.string().describe("リンク先のプロジェクトID"),
      target_issue_iid: z.number().int().describe("リンク先IssueのIID"),
      link_type: z.enum(["relates_to", "blocks", "is_blocked_by"]).optional().default("relates_to").describe("リンクの種類"),
    },
    async ({ project_id, issue_iid, ...body }) => {
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/issues/${issue_iid}/links`,
        body as Record<string, unknown>,
      );
    },
  );

  register(
    "list_related_merge_requests",
    "Issueに関連するMerge Request一覧を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      issue_iid: z.number().int().describe("IssueのIID"),
    },
    async ({ project_id, issue_iid }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/issues/${issue_iid}/related_merge_requests`,
      );
    },
  );

  register(
    "update_issue_note",
    "Issueのコメント（ノート）を更新します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      issue_iid: z.number().int().describe("IssueのIID"),
      note_id: z.number().int().describe("ノートID"),
      body: z.string().describe("新しいコメント本文（Markdown）"),
    },
    async ({ project_id, issue_iid, note_id, body }) => {
      return await client.put(
        `/projects/${encodeURIComponent(project_id)}/issues/${issue_iid}/notes/${note_id}`,
        { body },
      );
    },
  );

  register(
    "list_issue_discussions",
    "Issueのディスカッション一覧を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      issue_iid: z.number().int().describe("IssueのIID"),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ project_id, issue_iid, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/issues/${issue_iid}/discussions`,
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "create_issue_discussion",
    "Issueにディスカッションスレッドを作成します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      issue_iid: z.number().int().describe("IssueのIID"),
      body: z.string().describe("ディスカッション本文（Markdown）"),
    },
    async ({ project_id, issue_iid, body }) => {
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/issues/${issue_iid}/discussions`,
        { body },
      );
    },
  );

  register(
    "subscribe_to_issue",
    "Issueの通知を購読します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      issue_iid: z.number().int().describe("IssueのIID"),
    },
    async ({ project_id, issue_iid }) => {
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/issues/${issue_iid}/subscribe`,
      );
    },
  );

  register(
    "unsubscribe_from_issue",
    "Issueの通知購読を解除します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      issue_iid: z.number().int().describe("IssueのIID"),
    },
    async ({ project_id, issue_iid }) => {
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/issues/${issue_iid}/unsubscribe`,
      );
    },
  );

  register(
    "set_issue_time_estimate",
    "Issueの時間見積もりを設定します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      issue_iid: z.number().int().describe("IssueのIID"),
      duration: z.string().describe("見積もり時間（例: '3h30m', '1d', '2w'）"),
    },
    async ({ project_id, issue_iid, duration }) => {
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/issues/${issue_iid}/time_estimate`,
        { duration },
      );
    },
  );

  register(
    "add_issue_time_spent",
    "Issueに作業時間を追加します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      issue_iid: z.number().int().describe("IssueのIID"),
      duration: z.string().describe("作業時間（例: '1h30m', '2h'）"),
      summary: z.string().optional().describe("作業内容の説明"),
    },
    async ({ project_id, issue_iid, ...body }) => {
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/issues/${issue_iid}/add_spent_time`,
        body as Record<string, unknown>,
      );
    },
  );

  register(
    "get_issue_time_tracking_stats",
    "Issueの時間トラッキング統計を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      issue_iid: z.number().int().describe("IssueのIID"),
    },
    async ({ project_id, issue_iid }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/issues/${issue_iid}/time_stats`,
      );
    },
  );

  register(
    "list_issue_label_events",
    "Issueのラベル変更履歴を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      issue_iid: z.number().int().describe("IssueのIID"),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ project_id, issue_iid, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/issues/${issue_iid}/resource_label_events`,
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "delete_issue",
    "Issueを削除します。この操作は取り消せません。",
    {
      project_id: z.string().describe("プロジェクトID"),
      issue_iid: z.number().int().describe("IssueのIID（プロジェクト内番号）"),
    },
    async ({ project_id, issue_iid }) => {
      await client.delete(
        `/projects/${encodeURIComponent(project_id)}/issues/${issue_iid}`,
      );
      return { message: "Issue deleted successfully" };
    },
  );

  register(
    "delete_issue_note",
    "Issueのコメント（ノート）を削除します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      issue_iid: z.number().int().describe("IssueのIID"),
      note_id: z.number().int().describe("ノートID"),
    },
    async ({ project_id, issue_iid, note_id }) => {
      await client.delete(
        `/projects/${encodeURIComponent(project_id)}/issues/${issue_iid}/notes/${note_id}`,
      );
      return { message: "Issue note deleted successfully" };
    },
  );

  register(
    "delete_issue_link",
    "Issue間のリンクを削除します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      issue_iid: z.number().int().describe("IssueのIID"),
      issue_link_id: z.number().int().describe("IssueリンクID"),
    },
    async ({ project_id, issue_iid, issue_link_id }) => {
      await client.delete(
        `/projects/${encodeURIComponent(project_id)}/issues/${issue_iid}/links/${issue_link_id}`,
      );
      return { message: "Issue link deleted successfully" };
    },
  );
}
