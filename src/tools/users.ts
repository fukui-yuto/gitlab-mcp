import { z } from "zod";
import type { GitLabClient } from "../gitlab-client.js";
import type { ToolRegistrar } from "../types.js";

export function registerUserTools(register: ToolRegistrar, client: GitLabClient) {
  register(
    "list_users",
    "ユーザー一覧を取得します。",
    {
      search: z.string().optional().describe("ユーザー名またはメールで検索"),
      active: z.boolean().optional().describe("アクティブなユーザーのみ"),
      blocked: z.boolean().optional().describe("ブロックされたユーザーのみ"),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async (params) => {
      return await client.get(
        "/users",
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "get_user",
    "ユーザーの詳細情報を取得します。",
    {
      user_id: z.number().int().describe("ユーザーID"),
    },
    async ({ user_id }) => {
      return await client.get(`/users/${user_id}`);
    },
  );

  register(
    "get_current_user",
    "現在の認証ユーザー（自分自身）の情報を取得します。",
    {},
    async () => {
      return await client.get("/user");
    },
  );
}
