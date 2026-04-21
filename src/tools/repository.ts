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
      if (ref) params.ref = ref;

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
      return await client.put(
        `/projects/${encodeURIComponent(project_id)}/repository/files/${encodedPath}`,
        body as Record<string, unknown>,
      );
    },
  );
}
