import { z } from "zod";
import type { GitLabClient } from "../gitlab-client.js";
import type { ToolRegistrar } from "../types.js";

export function registerWikiTools(register: ToolRegistrar, client: GitLabClient) {
  register(
    "list_wiki_pages",
    "プロジェクトのWikiページ一覧を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      with_content: z.boolean().optional().describe("ページ内容を含める（デフォルト: false）"),
    },
    async ({ project_id, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/wikis`,
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "create_wiki_page",
    "Wikiページを新規作成します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      title: z.string().describe("ページタイトル"),
      content: z.string().describe("ページ内容（Markdown）"),
      format: z.enum(["markdown", "rdoc", "asciidoc", "org"]).optional().default("markdown"),
    },
    async ({ project_id, ...body }) => {
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/wikis`,
        body as Record<string, unknown>,
      );
    },
  );

  register(
    "get_wiki_page",
    "Wikiページの内容を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      slug: z.string().describe("ページのスラッグ（URLパス）"),
      render_html: z.boolean().optional().describe("HTMLレンダリング済みの内容を含める"),
    },
    async ({ project_id, slug, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/wikis/${encodeURIComponent(slug)}`,
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "update_wiki_page",
    "既存のWikiページを更新します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      slug: z.string().describe("ページのスラッグ（URLパス）"),
      title: z.string().optional().describe("新しいタイトル"),
      content: z.string().optional().describe("新しい内容（Markdown）"),
      format: z.enum(["markdown", "rdoc", "asciidoc", "org"]).optional(),
    },
    async ({ project_id, slug, ...body }) => {
      return await client.put(
        `/projects/${encodeURIComponent(project_id)}/wikis/${encodeURIComponent(slug)}`,
        body as Record<string, unknown>,
      );
    },
  );

  register(
    "delete_wiki_page",
    "Wikiページを削除します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      slug: z.string().describe("ページのスラッグ（URLパス）"),
    },
    async ({ project_id, slug }) => {
      await client.delete(
        `/projects/${encodeURIComponent(project_id)}/wikis/${encodeURIComponent(slug)}`,
      );
      return { message: "Wiki page deleted successfully" };
    },
  );
}
