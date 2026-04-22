import { z } from "zod";
import type { GitLabClient } from "../gitlab-client.js";
import type { ToolRegistrar } from "../types.js";

// --- 検出ルール定義 ---

interface FormatIssue {
  rule: string;
  severity: "error" | "warning" | "info";
  line: number;
  column?: number;
  match: string;
  suggestion?: string;
}

interface CheckResult {
  source: string;
  url?: string;
  issues: FormatIssue[];
}

interface CheckRule {
  name: string;
  pattern: RegExp;
  severity: "error" | "warning" | "info";
  suggestion?: string;
}

// Textile記法の残留検出ルール
const textileRemnantRules: CheckRule[] = [
  {
    name: "textile_heading",
    pattern: /^h[1-6]\.\s/m,
    severity: "error",
    suggestion: "Markdown見出し（# ～ ######）に変換してください",
  },
  {
    name: "textile_link",
    pattern: /"([^"]+)":(https?:\/\/[^\s,)]+)/,
    severity: "error",
    suggestion: "[テキスト](URL) 形式に変換してください",
  },
  {
    name: "textile_image",
    pattern: /(?<![[\(])!(?![[\s!])([^!\n]+)!(?![\])])/,
    severity: "error",
    suggestion: "![alt](画像パス) 形式に変換してください",
  },
  {
    name: "textile_bold",
    pattern: /(?<!\*)\*(?!\*|\s)([^*\n]+?)(?<!\s)\*(?!\*)/,
    severity: "warning",
    suggestion: "Markdownの太字は **text** です（Textileの *text* と混同の可能性）",
  },
  {
    name: "textile_table_header",
    pattern: /\|_\.\s/,
    severity: "error",
    suggestion: "Markdownテーブルヘッダー（| header | + |---|）に変換してください",
  },
  {
    name: "textile_strikethrough",
    pattern: /(?<!\w)-(?!\s|-)([\w][^-\n]*?)(?<!\s)-(?!\w|-)/,
    severity: "warning",
    suggestion: "Markdownの取り消し線は ~~text~~ です",
  },
  {
    name: "textile_numbered_list",
    pattern: /^#\s+(?!#)/m,
    severity: "warning",
    suggestion: "Markdownの番号付きリストは 1. item です（Textile # item の残留の可能性）",
  },
  {
    name: "textile_blockquote",
    pattern: /^bq\.\s/m,
    severity: "error",
    suggestion: "Markdownの引用は > text です",
  },
  {
    name: "textile_preformatted",
    pattern: /<pre>|<\/pre>/,
    severity: "error",
    suggestion: "Markdownのコードブロック（```）に変換してください",
  },
  {
    name: "textile_code_inline",
    pattern: /@([^@\n]+?)@/,
    severity: "warning",
    suggestion: "Markdownのインラインコードは `code` です（Textile @code@ の残留の可能性）",
  },
];

// Markdown構文バリデーションルール
const markdownValidationRules: CheckRule[] = [
  {
    name: "unclosed_code_block",
    pattern: /```[\s\S]*?(?!```)/,
    severity: "error",
    suggestion: "コードブロック（```）が閉じられていません",
  },
  {
    name: "broken_link",
    pattern: /\[[^\]]*\]\([^)]*$/m,
    severity: "error",
    suggestion: "リンクの括弧が閉じられていません",
  },
  {
    name: "broken_image",
    pattern: /!\[[^\]]*\]\([^)]*$/m,
    severity: "error",
    suggestion: "画像リンクの括弧が閉じられていません",
  },
  {
    name: "html_tag_remnant",
    pattern: /<\/?(?:br|p|div|span|font|center|table|tr|td|th|b|i|u|s|strike|em|strong|code|blockquote|ul|ol|li|dl|dt|dd|hr|h[1-6])(?:\s[^>]*)?\s*\/?>/i,
    severity: "warning",
    suggestion: "HTML タグが残っています。Markdown記法に変換してください",
  },
];

// Redmine固有パターン検出ルール
const redmineRemnantRules: CheckRule[] = [
  {
    name: "redmine_issue_link",
    pattern: /(?<!\w)#(\d+)(?!\w)/,
    severity: "info",
    suggestion: "Redmine形式のIssue参照の可能性があります。GitLabでは #IID 形式ですが、番号が異なる場合があります",
  },
  {
    name: "redmine_wiki_link",
    pattern: /\[\[([^\]]+)\]\]/,
    severity: "warning",
    suggestion: "Redmine形式のWikiリンク [[page]] です。GitLabでは [text](wiki/page) に変換してください",
  },
  {
    name: "redmine_url_pattern",
    pattern: /\/(?:issues|projects|wiki|attachments|versions)\/\d+/,
    severity: "warning",
    suggestion: "Redmine形式のURL参照が残っている可能性があります",
  },
  {
    name: "redmine_macro",
    pattern: /\{\{([\w]+)(?:\([^)]*\))?\}\}/,
    severity: "error",
    suggestion: "Redmineマクロ（{{macro}}）が残っています",
  },
  {
    name: "redmine_collapse",
    pattern: /\{\{collapse\b|\{\{\/collapse\}\}/,
    severity: "error",
    suggestion: "Redmineのcollapseマクロが残っています。<details>タグに変換してください",
  },
];

function checkContent(text: string): FormatIssue[] {
  const issues: FormatIssue[] = [];
  const lines = text.split("\n");

  // コードブロック内を除外するための状態管理
  let inCodeBlock = false;
  const codeBlockLines = new Set<number>();

  for (let i = 0; i < lines.length; i++) {
    if (/^```/.test(lines[i])) {
      inCodeBlock = !inCodeBlock;
      codeBlockLines.add(i);
      continue;
    }
    if (inCodeBlock) {
      codeBlockLines.add(i);
    }
  }

  // コードブロックが閉じていない場合
  if (inCodeBlock) {
    issues.push({
      rule: "unclosed_code_block",
      severity: "error",
      line: lines.length,
      match: "```",
      suggestion: "コードブロック（```）が閉じられていません",
    });
  }

  // テーブルのセパレータ行チェック
  for (let i = 0; i < lines.length; i++) {
    if (codeBlockLines.has(i)) continue;
    const line = lines[i];

    // テーブル行を検出（| で始まり | で終わる）
    if (/^\s*\|.*\|\s*$/.test(line)) {
      const nextLine = lines[i + 1];
      const prevLine = lines[i - 1];
      // ヘッダー行の次にセパレータ行がない場合
      const isSeparator = /^\s*\|[\s-:|]+\|\s*$/.test(line);
      const nextIsSeparator = nextLine && /^\s*\|[\s-:|]+\|\s*$/.test(nextLine);
      const prevIsTable = prevLine && /^\s*\|.*\|\s*$/.test(prevLine);

      if (!isSeparator && !nextIsSeparator && !prevIsTable) {
        // テーブルの最初の行なのにセパレータがない
        issues.push({
          rule: "table_missing_separator",
          severity: "error",
          line: i + 1,
          match: line.trim(),
          suggestion: "テーブルヘッダーの次にセパレータ行（|---|---|）が必要です",
        });
      }
    }
  }

  // 各ルールセットでチェック
  const allRules = [...textileRemnantRules, ...markdownValidationRules.filter(r => r.name !== "unclosed_code_block"), ...redmineRemnantRules];

  for (let i = 0; i < lines.length; i++) {
    if (codeBlockLines.has(i)) continue;
    const line = lines[i];

    for (const rule of allRules) {
      const match = line.match(rule.pattern);
      if (match) {
        issues.push({
          rule: rule.name,
          severity: rule.severity,
          line: i + 1,
          column: match.index !== undefined ? match.index + 1 : undefined,
          match: match[0].length > 80 ? match[0].substring(0, 80) + "..." : match[0],
          suggestion: rule.suggestion,
        });
      }
    }
  }

  return issues;
}

function formatReport(results: CheckResult[]): {
  summary: { total_checked: number; with_issues: number; errors: number; warnings: number; info: number };
  results: CheckResult[];
} {
  let errors = 0;
  let warnings = 0;
  let info = 0;
  let withIssues = 0;

  for (const result of results) {
    if (result.issues.length > 0) withIssues++;
    for (const issue of result.issues) {
      if (issue.severity === "error") errors++;
      else if (issue.severity === "warning") warnings++;
      else info++;
    }
  }

  return {
    summary: {
      total_checked: results.length,
      with_issues: withIssues,
      errors,
      warnings,
      info,
    },
    results: results.filter((r) => r.issues.length > 0),
  };
}

// --- ツール登録 ---

export function registerMigrationCheckTools(register: ToolRegistrar, client: GitLabClient) {
  register(
    "check_issues_formatting",
    "プロジェクトのIssueをスキャンし、Redmine→GitLab移行時のMarkdownフォーマット崩れを検出します。Textile記法の残留、壊れたMarkdown構文、Redmine固有パターンをチェックします。",
    {
      project_id: z.string().describe("プロジェクトID（数値またはURLエンコードされたパス）"),
      issue_iid: z.number().int().optional().describe("特定のIssue IIDのみチェック（省略時は全Issue）"),
      state: z.enum(["opened", "closed", "all"]).optional().default("all").describe("チェック対象のIssue状態"),
      include_comments: z.boolean().optional().default(false).describe("コメント（ノート）もチェックする"),
      page: z.number().int().positive().optional().default(1),
      per_page: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ project_id, issue_iid, state, include_comments, page, per_page }) => {
      const results: CheckResult[] = [];
      const projectPath = encodeURIComponent(project_id);

      if (issue_iid) {
        // 特定のIssueのみ
        const issue = await client.get<{ iid: number; title: string; description: string | null; web_url: string }>(
          `/projects/${projectPath}/issues/${issue_iid}`,
        );
        const issueIssues: FormatIssue[] = [];

        if (issue.title) {
          const titleIssues = checkContent(issue.title);
          for (const ti of titleIssues) {
            ti.rule = `title: ${ti.rule}`;
            issueIssues.push(ti);
          }
        }
        if (issue.description) {
          issueIssues.push(...checkContent(issue.description));
        }

        results.push({
          source: `Issue #${issue.iid}: ${issue.title}`,
          url: issue.web_url,
          issues: issueIssues,
        });

        if (include_comments) {
          const notes = await client.get<Array<{ id: number; body: string; author: { username: string } }>>(
            `/projects/${projectPath}/issues/${issue_iid}/notes`,
            { per_page: 100 },
          );
          for (const note of notes) {
            const noteIssues = checkContent(note.body);
            if (noteIssues.length > 0) {
              results.push({
                source: `Issue #${issue.iid} コメント (by ${note.author.username}, id:${note.id})`,
                url: issue.web_url,
                issues: noteIssues,
              });
            }
          }
        }
      } else {
        // 全Issue
        const issues = await client.get<Array<{ iid: number; title: string; description: string | null; web_url: string }>>(
          `/projects/${projectPath}/issues`,
          { state: state as string, page, per_page },
        );

        for (const issue of issues) {
          const issueIssues: FormatIssue[] = [];
          if (issue.title) {
            const titleIssues = checkContent(issue.title);
            for (const ti of titleIssues) {
              ti.rule = `title: ${ti.rule}`;
              issueIssues.push(ti);
            }
          }
          if (issue.description) {
            issueIssues.push(...checkContent(issue.description));
          }

          if (issueIssues.length > 0) {
            results.push({
              source: `Issue #${issue.iid}: ${issue.title}`,
              url: issue.web_url,
              issues: issueIssues,
            });
          }

          if (include_comments) {
            const notes = await client.get<Array<{ id: number; body: string; author: { username: string } }>>(
              `/projects/${projectPath}/issues/${issue.iid}/notes`,
              { per_page: 100 },
            );
            for (const note of notes) {
              const noteIssues = checkContent(note.body);
              if (noteIssues.length > 0) {
                results.push({
                  source: `Issue #${issue.iid} コメント (by ${note.author.username}, id:${note.id})`,
                  url: issue.web_url,
                  issues: noteIssues,
                });
              }
            }
          }
        }
      }

      return formatReport(results);
    },
  );

  register(
    "check_wiki_formatting",
    "プロジェクトのWikiページをスキャンし、Redmine→GitLab移行時のMarkdownフォーマット崩れを検出します。",
    {
      project_id: z.string().describe("プロジェクトID（数値またはURLエンコードされたパス）"),
      slug: z.string().optional().describe("特定のWikiページスラッグのみチェック（省略時は全ページ）"),
    },
    async ({ project_id, slug }) => {
      const results: CheckResult[] = [];
      const projectPath = encodeURIComponent(project_id);

      if (slug) {
        const page = await client.get<{ slug: string; title: string; content: string }>(
          `/projects/${projectPath}/wikis/${encodeURIComponent(slug)}`,
        );
        const pageIssues: FormatIssue[] = [];
        if (page.title) {
          const titleIssues = checkContent(page.title);
          for (const ti of titleIssues) {
            ti.rule = `title: ${ti.rule}`;
            pageIssues.push(ti);
          }
        }
        if (page.content) {
          pageIssues.push(...checkContent(page.content));
        }
        results.push({
          source: `Wiki: ${page.title} (${page.slug})`,
          issues: pageIssues,
        });
      } else {
        // with_content=trueで一覧取得し本文もチェック
        const pages = await client.get<Array<{ slug: string; title: string; content?: string }>>(
          `/projects/${projectPath}/wikis`,
          { with_content: true },
        );

        for (const page of pages) {
          const pageIssues: FormatIssue[] = [];
          if (page.title) {
            const titleIssues = checkContent(page.title);
            for (const ti of titleIssues) {
              ti.rule = `title: ${ti.rule}`;
              pageIssues.push(ti);
            }
          }
          if (page.content) {
            pageIssues.push(...checkContent(page.content));
          }
          if (pageIssues.length > 0) {
            results.push({
              source: `Wiki: ${page.title} (${page.slug})`,
              issues: pageIssues,
            });
          }
        }
      }

      return formatReport(results);
    },
  );

  register(
    "check_repository_formatting",
    "リポジトリ内のMarkdownファイルをスキャンし、Redmine→GitLab移行時のフォーマット崩れを検出します。",
    {
      project_id: z.string().describe("プロジェクトID（数値またはURLエンコードされたパス）"),
      ref: z.string().optional().describe("ブランチ名、タグ名、コミットSHA（デフォルト: デフォルトブランチ）"),
      path: z.string().optional().describe("スキャン対象のディレクトリパス（デフォルト: ルート）"),
      file_path: z.string().optional().describe("特定ファイルのみチェック（例: docs/guide.md）"),
    },
    async ({ project_id, ref, path, file_path }) => {
      const results: CheckResult[] = [];
      const projectPath = encodeURIComponent(project_id);

      // ref未指定時はデフォルトブランチを取得
      let targetRef = ref;
      if (!targetRef) {
        const project = await client.get<{ default_branch: string }>(
          `/projects/${projectPath}`,
        );
        targetRef = project.default_branch;
      }

      if (file_path) {
        // 特定ファイルのみ
        const encodedFilePath = encodeURIComponent(file_path);
        const file = await client.get<{ content: string; encoding: string; file_path: string }>(
          `/projects/${projectPath}/repository/files/${encodedFilePath}`,
          { ref: targetRef },
        );
        const content = file.encoding === "base64"
          ? Buffer.from(file.content, "base64").toString("utf-8")
          : file.content;

        const fileIssues = checkContent(content);
        results.push({
          source: `File: ${file.file_path}`,
          issues: fileIssues,
        });
      } else {
        // ディレクトリを再帰的に走査してMarkdownファイルを見つける
        const treeParams: Record<string, string | number | boolean> = {
          ref: targetRef,
          recursive: true,
          per_page: 100,
        };
        if (path) {
          treeParams.path = path;
        }

        const tree = await client.get<Array<{ path: string; type: string; name: string }>>(
          `/projects/${projectPath}/repository/tree`,
          treeParams,
        );

        // Markdownファイルのみ抽出
        const mdFiles = tree.filter(
          (item) => item.type === "blob" && /\.(md|markdown|mdown|mkd|textile|txt)$/i.test(item.name),
        );

        for (const mdFile of mdFiles) {
          try {
            const encodedFilePath = encodeURIComponent(mdFile.path);
            const file = await client.get<{ content: string; encoding: string; file_path: string }>(
              `/projects/${projectPath}/repository/files/${encodedFilePath}`,
              { ref: targetRef },
            );
            const content = file.encoding === "base64"
              ? Buffer.from(file.content, "base64").toString("utf-8")
              : file.content;

            const fileIssues = checkContent(content);
            if (fileIssues.length > 0) {
              results.push({
                source: `File: ${mdFile.path}`,
                issues: fileIssues,
              });
            }
          } catch {
            // ファイル読み取りエラーはスキップ
            results.push({
              source: `File: ${mdFile.path}`,
              issues: [{
                rule: "file_read_error",
                severity: "warning",
                line: 0,
                match: mdFile.path,
                suggestion: "ファイルの読み取りに失敗しました",
              }],
            });
          }
        }
      }

      return formatReport(results);
    },
  );
}
