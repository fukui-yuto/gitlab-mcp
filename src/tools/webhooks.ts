import { z } from "zod";
import type { GitLabClient } from "../gitlab-client.js";
import type { ToolRegistrar } from "../types.js";

export function registerWebhookTools(register: ToolRegistrar, client: GitLabClient) {
  register(
    "list_webhooks",
    "プロジェクトのWebhook一覧を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ project_id, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/hooks`,
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "create_webhook",
    "プロジェクトにWebhookを作成します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      url: z.string().describe("Webhook URL"),
      push_events: z.boolean().optional().describe("プッシュイベント"),
      issues_events: z.boolean().optional().describe("Issueイベント"),
      merge_requests_events: z.boolean().optional().describe("MRイベント"),
      tag_push_events: z.boolean().optional().describe("タグプッシュイベント"),
      note_events: z.boolean().optional().describe("コメントイベント"),
      pipeline_events: z.boolean().optional().describe("パイプラインイベント"),
      job_events: z.boolean().optional().describe("ジョブイベント"),
      deployment_events: z.boolean().optional().describe("デプロイメントイベント"),
      releases_events: z.boolean().optional().describe("リリースイベント"),
      wiki_page_events: z.boolean().optional().describe("Wikiページイベント"),
      token: z.string().optional().describe("シークレットトークン"),
      enable_ssl_verification: z.boolean().optional().default(true).describe("SSL検証を有効化"),
    },
    async ({ project_id, ...body }) => {
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/hooks`,
        body as Record<string, unknown>,
      );
    },
  );

  register(
    "delete_webhook",
    "プロジェクトのWebhookを削除します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      hook_id: z.number().int().describe("WebhookID"),
    },
    async ({ project_id, hook_id }) => {
      await client.delete(
        `/projects/${encodeURIComponent(project_id)}/hooks/${hook_id}`,
      );
      return { message: "Webhook deleted successfully" };
    },
  );
}
