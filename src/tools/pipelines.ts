import { z } from "zod";
import type { GitLabClient } from "../gitlab-client.js";
import type { ToolRegistrar } from "../types.js";

export function registerPipelineTools(register: ToolRegistrar, client: GitLabClient) {
  register(
    "list_pipelines",
    "プロジェクトのパイプライン一覧を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      status: z.enum(["created", "waiting_for_resource", "preparing", "pending", "running", "success", "failed", "canceled", "skipped", "manual", "scheduled"]).optional(),
      ref: z.string().optional().describe("ブランチ名またはタグ名"),
      source: z.enum(["push", "web", "trigger", "schedule", "api", "external", "pipeline", "chat", "webide", "merge_request_event", "external_pull_request_event", "parent_pipeline", "ondemand_dast_scan", "ondemand_dast_validation"]).optional(),
      order_by: z.enum(["id", "status", "ref", "updated_at", "user_id"]).optional(),
      sort: z.enum(["asc", "desc"]).optional(),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ project_id, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/pipelines`,
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "get_pipeline",
    "パイプラインの詳細情報を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      pipeline_id: z.number().int().describe("パイプラインID"),
    },
    async ({ project_id, pipeline_id }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/pipelines/${pipeline_id}`,
      );
    },
  );

  // --- Phase 2 ---

  register(
    "list_pipeline_jobs",
    "パイプラインに含まれるジョブ一覧を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      pipeline_id: z.number().int().describe("パイプラインID"),
      scope: z.enum(["created", "pending", "running", "failed", "success", "canceled", "skipped", "waiting_for_resource", "manual"]).optional(),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ project_id, pipeline_id, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/pipelines/${pipeline_id}/jobs`,
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "get_job_log",
    "ジョブのログ（トレース）を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      job_id: z.number().int().describe("ジョブID"),
    },
    async ({ project_id, job_id }) => {
      return await client.get<string>(
        `/projects/${encodeURIComponent(project_id)}/jobs/${job_id}/trace`,
      );
    },
  );

  register(
    "retry_pipeline",
    "失敗したパイプラインを再実行します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      pipeline_id: z.number().int().describe("パイプラインID"),
    },
    async ({ project_id, pipeline_id }) => {
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/pipelines/${pipeline_id}/retry`,
      );
    },
  );

  register(
    "cancel_pipeline",
    "実行中のパイプラインをキャンセルします。",
    {
      project_id: z.string().describe("プロジェクトID"),
      pipeline_id: z.number().int().describe("パイプラインID"),
    },
    async ({ project_id, pipeline_id }) => {
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/pipelines/${pipeline_id}/cancel`,
      );
    },
  );

  register(
    "create_pipeline",
    "パイプラインを手動でトリガーします。",
    {
      project_id: z.string().describe("プロジェクトID"),
      ref: z.string().describe("ブランチ名またはタグ名"),
      variables: z.array(z.object({
        key: z.string().describe("変数名"),
        value: z.string().describe("変数値"),
        variable_type: z.enum(["env_var", "file"]).optional().default("env_var"),
      })).optional().describe("パイプライン変数"),
    },
    async ({ project_id, ...body }) => {
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/pipeline`,
        body as Record<string, unknown>,
      );
    },
  );

  register(
    "play_job",
    "手動ジョブを実行します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      job_id: z.number().int().describe("ジョブID"),
      job_variables_attributes: z.array(z.object({
        key: z.string().describe("変数名"),
        value: z.string().describe("変数値"),
      })).optional().describe("ジョブ変数"),
    },
    async ({ project_id, job_id, ...body }) => {
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/jobs/${job_id}/play`,
        body as Record<string, unknown>,
      );
    },
  );

  register(
    "list_pipeline_schedules",
    "パイプラインスケジュール一覧を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ project_id, ...params }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/pipeline_schedules`,
        params as Record<string, string | number | boolean>,
      );
    },
  );

  register(
    "get_job_artifacts",
    "ジョブのアーティファクト情報を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      job_id: z.number().int().describe("ジョブID"),
    },
    async ({ project_id, job_id }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/jobs/${job_id}/artifacts`,
      );
    },
  );

  register(
    "delete_pipeline",
    "パイプラインとそれに関連するすべてのジョブを削除します。この操作は取り消せません。",
    {
      project_id: z.string().describe("プロジェクトID"),
      pipeline_id: z.number().int().describe("パイプラインID"),
    },
    async ({ project_id, pipeline_id }) => {
      await client.delete(
        `/projects/${encodeURIComponent(project_id)}/pipelines/${pipeline_id}`,
      );
      return { message: "Pipeline deleted successfully" };
    },
  );

  register(
    "get_pipeline_schedule",
    "パイプラインスケジュールの詳細情報を取得します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      pipeline_schedule_id: z.number().int().describe("パイプラインスケジュールID"),
    },
    async ({ project_id, pipeline_schedule_id }) => {
      return await client.get(
        `/projects/${encodeURIComponent(project_id)}/pipeline_schedules/${pipeline_schedule_id}`,
      );
    },
  );

  register(
    "create_pipeline_schedule",
    "パイプラインスケジュールを作成します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      description: z.string().describe("スケジュールの説明"),
      ref: z.string().describe("ブランチ名またはタグ名"),
      cron: z.string().describe("Cron式（例: '0 1 * * *'）"),
      cron_timezone: z.string().optional().describe("タイムゾーン（例: 'Asia/Tokyo'）"),
      active: z.boolean().optional().describe("有効化するか"),
    },
    async ({ project_id, ...body }) => {
      return await client.post(
        `/projects/${encodeURIComponent(project_id)}/pipeline_schedules`,
        body as Record<string, unknown>,
      );
    },
  );

  register(
    "update_pipeline_schedule",
    "パイプラインスケジュールを更新します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      pipeline_schedule_id: z.number().int().describe("パイプラインスケジュールID"),
      description: z.string().optional().describe("スケジュールの説明"),
      ref: z.string().optional().describe("ブランチ名またはタグ名"),
      cron: z.string().optional().describe("Cron式"),
      cron_timezone: z.string().optional().describe("タイムゾーン"),
      active: z.boolean().optional().describe("有効/無効"),
    },
    async ({ project_id, pipeline_schedule_id, ...body }) => {
      return await client.put(
        `/projects/${encodeURIComponent(project_id)}/pipeline_schedules/${pipeline_schedule_id}`,
        body as Record<string, unknown>,
      );
    },
  );

  register(
    "delete_pipeline_schedule",
    "パイプラインスケジュールを削除します。",
    {
      project_id: z.string().describe("プロジェクトID"),
      pipeline_schedule_id: z.number().int().describe("パイプラインスケジュールID"),
    },
    async ({ project_id, pipeline_schedule_id }) => {
      await client.delete(
        `/projects/${encodeURIComponent(project_id)}/pipeline_schedules/${pipeline_schedule_id}`,
      );
      return { message: "Pipeline schedule deleted successfully" };
    },
  );
}
