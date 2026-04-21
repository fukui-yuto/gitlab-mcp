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
}
