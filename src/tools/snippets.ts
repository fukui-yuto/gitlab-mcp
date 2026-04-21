import { z } from "zod";
import type { GitLabClient } from "../gitlab-client.js";
import type { ToolRegistrar } from "../types.js";

export function registerSnippetTools(register: ToolRegistrar, client: GitLabClient) {
  register(
    "list_snippets",
    "プロジェクトのスニペット一覧を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ project_id, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/snippets`,
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "get_snippet",
    "スニペットの詳細情報を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      snippet_id: z.number().int().describe("スニペットID"),
    },
    async ({ project_id, snippet_id }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/snippets/${snippet_id}`,
      );
    },
  );

  register(
    "create_snippet",
    "新しいスニペットを作成します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      title: z.string().describe("スニペットタイトル"),
      file_name: z.string().describe("ファイル名（例: example.py）"),
      content: z.string().describe("スニペットの内容"),
      description: z.string().optional().describe("スニペットの説明"),
      visibility: z.enum(["private", "internal", "public"]).optional().describe("公開範囲"),
    },
    async ({ project_id, ...body }) => {
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/snippets`,
        body as Record<string, unknown>,
      );
    },
  );
}
