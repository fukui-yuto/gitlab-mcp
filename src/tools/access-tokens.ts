import { z } from "zod";
import type { GitLabClient } from "../gitlab-client.js";
import type { ToolRegistrar } from "../types.js";

export function registerAccessTokenTools(register: ToolRegistrar, client: GitLabClient) {
  register(
    "list_project_access_tokens",
    "プロジェクトのアクセストークン一覧を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ project_id, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/access_tokens`,
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "create_project_access_token",
    "プロジェクトのアクセストークンを作成します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      name: z.string().describe("トークン名"),
      scopes: z.array(z.string()).describe("スコープ（例: api, read_api, read_repository, write_repository）"),
      access_level: z.number().int().optional().default(30).describe("アクセスレベル（10=Guest, 20=Reporter, 30=Developer, 40=Maintainer）"),
      expires_at: z.string().describe("有効期限（YYYY-MM-DD）"),
    },
    async ({ project_id, ...body }) => {
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/access_tokens`,
        body as Record<string, unknown>,
      );
    },
  );
}
