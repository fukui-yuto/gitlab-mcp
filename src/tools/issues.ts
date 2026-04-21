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
}
