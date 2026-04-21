import { z } from "zod";
import type { GitLabClient } from "../gitlab-client.js";
import type { ToolRegistrar } from "../types.js";

export function registerRepositoryTools(register: ToolRegistrar, client: GitLabClient) {
  register(
    "list_branches",
    "リポジトリのブランチ一覧を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      search: z.string().optional().describe("ブランチ名で検索"),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ project_id, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/repository/branches`,
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "get_file_contents",
    "リポジトリ内のファイル内容を取得します。Base64デコード済みの内容を返します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      file_path: z.string().describe("ファイルパス（例: src/index.ts）"),
      ref: z.string().optional().describe("ブランチ名、タグ名、コミットSHA（デフォルト: デフォルトブランチ）"),
    },
    async ({ project_id, file_path, ref }) => {
      const encodedPath = encodeURIComponent(file_path);
      const params: Record<string, string> = {};
      if (ref) {
        params.ref = ref;
      } else {
        // ref未指定時はデフォルトブランチを取得
        const project = await client.get<{ default_branch: string }>(
          `/projects/${encodeURIComponent(project_id)}`,
        );
        params.ref = project.default_branch;
      }

      const result = await client.get<{ content: string; encoding: string; file_name: string; file_path: string; size: number }>(
        `/projects/${encodeURIComponent(project_id)}/repository/files/${encodedPath}`,
        params,
      );

      // Base64デコードして返す
      if (result.encoding === "base64") {
        return {
          ...result,
          content: Buffer.from(result.content, "base64").toString("utf-8"),
          encoding: "text",
        };
      }
      return result;
    },
  );

  // --- Phase 2 ---

  register(
    "create_branch",
    "新しいブランチを作成します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      branch: z.string().describe("新しいブランチ名"),
      ref: z.string().describe("派生元のブランチ名、タグ名、またはコミットSHA"),
    },
    async ({ project_id, ...body }) => {
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/repository/branches`,
        body as Record<string, unknown>,
      );
    },
  );

  register(
    "create_or_update_file",
    "リポジトリ内のファイルを作成または更新します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      file_path: z.string().describe("ファイルパス（例: src/index.ts）"),
      branch: z.string().describe("コミット先ブランチ"),
      content: z.string().describe("ファイル内容"),
      commit_message: z.string().describe("コミットメッセージ"),
      encoding: z.enum(["text", "base64"]).optional().default("text").describe("内容のエンコーディング"),
      author_email: z.string().optional().describe("コミット作者のメールアドレス"),
      author_name: z.string().optional().describe("コミット作者の名前"),
    },
    async ({ project_id, file_path, ...body }) => {
      const encodedPath = encodeURIComponent(file_path);
      const url = `/projects/${encodeURIComponent(project_id)}/repository/files/${encodedPath}`;

      // ファイルが存在するかチェックして、POST(新規作成)かPUT(更新)を選択
      try {
        await client.get(url, { ref: body.branch as string });
        // ファイルが存在する → PUT で更新
        return await client.put(url, body as Record<string, unknown>);
      } catch {
        // ファイルが存在しない → POST で作成
        return await client.post(url, body as Record<string, unknown>);
      }
    },
  );

  register(
    "delete_branch",
    "ブランチを削除します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      branch: z.string().describe("削除するブランチ名"),
    },
    async ({ project_id, branch }) => {
      await client.delete(
        `/projects/${encodeURIComponent(project_id)}/repository/branches/${encodeURIComponent(branch)}`,
      );
      return { message: "Branch deleted successfully" };
    },
  );

  register(
    "list_repository_tree",
    "リポジトリのディレクトリ構造（ファイルツリー）を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      path: z.string().optional().describe("サブディレクトリパス"),
      ref: z.string().optional().describe("ブランチ名、タグ名、コミットSHA"),
      recursive: z.boolean().optional().describe("再帰的に取得"),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ project_id, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/repository/tree`,
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "list_commits",
    "リポジトリのコミット一覧を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      ref_name: z.string().optional().describe("ブランチ名、タグ名"),
      since: z.string().optional().describe("この日時以降のコミット（ISO 8601形式）"),
      until: z.string().optional().describe("この日時以前のコミット（ISO 8601形式）"),
      path: z.string().optional().describe("ファイルパスでフィルタ"),
      author: z.string().optional().describe("コミット作者でフィルタ"),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ project_id, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/repository/commits`,
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "get_commit",
    "コミットの詳細情報を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      sha: z.string().describe("コミットSHA"),
    },
    async ({ project_id, sha }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/repository/commits/${sha}`,
      );
    },
  );

  register(
    "compare_branches",
    "2つのブランチ、タグ、またはコミット間の差分を比較します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      from: z.string().describe("比較元（ブランチ名、タグ名、コミットSHA）"),
      to: z.string().describe("比較先（ブランチ名、タグ名、コミットSHA）"),
      straight: z.boolean().optional().describe("直接比較（trueの場合、fromからtoへの直接diff）"),
    },
    async ({ project_id, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/repository/compare`,
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "list_tags",
    "リポジトリのタグ一覧を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      search: z.string().optional().describe("タグ名で検索"),
      order_by: z.enum(["name", "updated", "version"]).optional(),
      sort: z.enum(["asc", "desc"]).optional(),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ project_id, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/repository/tags`,
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "create_tag",
    "新しいタグを作成します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      tag_name: z.string().describe("タグ名"),
      ref: z.string().describe("タグを作成するブランチ名、コミットSHA"),
      message: z.string().optional().describe("注釈付きタグのメッセージ"),
    },
    async ({ project_id, ...body }) => {
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/repository/tags`,
        body as Record<string, unknown>,
      );
    },
  );
}
