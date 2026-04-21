import type { z } from "zod";

/**
 * ツール登録用のヘルパー型
 * 各ツールモジュールはこの関数を使ってツールを登録する
 */
export type ToolRegistrar = <T extends Record<string, z.ZodTypeAny>>(
  name: string,
  description: string,
  schema: T,
  handler: (params: z.infer<z.ZodObject<T>>) => Promise<unknown>,
) => void;
