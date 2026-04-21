import { z } from "zod";
import type { GitLabClient } from "../gitlab-client.js";
import type { ToolRegistrar } from "../types.js";

export function registerLabelTools(register: ToolRegistrar, client: GitLabClient) {
  register(
    "list_labels",
    "プロジェクトのラベル一覧を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      search: z.string().optional().describe("ラベル名で検索"),
      with_counts: z.boolean().optional().describe("Issue/MRの件数を含める"),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ project_id, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/labels`,
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "create_label",
    "プロジェクトに新しいラベルを作成します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      name: z.string().describe("ラベル名"),
      color: z.string().describe("ラベルの色（例: #FF0000）"),
      description: z.string().optional().describe("ラベルの説明"),
      priority: z.number().int().optional().describe("ラベルの優先度（数値が小さいほど優先）"),
    },
    async ({ project_id, ...body }) => {
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/labels`,
        body as Record<string, unknown>,
      );
    },
  );

  register(
    "update_label",
    "既存のラベルを更新します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      label_id: z.number().int().describe("ラベルID"),
      new_name: z.string().optional().describe("新しいラベル名"),
      color: z.string().optional().describe("新しい色（例: #00FF00）"),
      description: z.string().optional().describe("新しい説明"),
      priority: z.number().int().optional().describe("新しい優先度"),
    },
    async ({ project_id, label_id, ...body }) => {
      return await client.put(
        `/projects/${encodeURIComponent(project_id)}/labels/${label_id}`,
        body as Record<string, unknown>,
      );
    },
  );

  register(
    "delete_label",
    "ラベルを削除します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      label_id: z.number().int().describe("ラベルID"),
    },
    async ({ project_id, label_id }) => {
      await client.delete(
        `/projects/${encodeURIComponent(project_id)}/labels/${label_id}`,
      );
      return { message: "Label deleted successfully" };
    },
  );
}
