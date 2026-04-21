# GitLab MCP Server - 要件定義

## 背景

GitLab公式MCPサーバーはOAuth 2.0 Dynamic Client Registration (RFC 7591) のみをサポートしており、以下の問題がある:

- ブラウザベースのOAuthフローが必須（ヘッドレス/CI環境で使用不可）
- GitLab Premium/Ultimate が必要（Free/Communityでは利用不可）
- Docker/コンテナ環境での利用が困難

**本プロジェクトの目的**: Personal Access Token (PAT) で認証するMCPサーバーを自作し、どのGitLabエディションでも利用可能にする。

---

## 技術スタック

| 項目 | 選定 | 理由 |
|------|------|------|
| ランタイム | Node.js (TypeScript) | MCP SDKの公式サポートが充実 |
| MCP SDK | `@modelcontextprotocol/sdk` | 公式SDK |
| トランスポート | stdio | Claude Code等のCLIツールとの統合に最適 |
| HTTPクライアント | fetch (Node.js built-in) | 依存を最小化 |
| テスト | Vitest | 高速・TypeScript native |
| 検証環境 | Docker Compose (GitLab CE) | ローカルで完全なGitLabインスタンス |

---

## 認証方式

### Personal Access Token (PAT)

```
環境変数: GITLAB_PERSONAL_ACCESS_TOKEN
         GITLAB_URL (デフォルト: http://localhost:8929)
```

- GitLab API v4 の `PRIVATE-TOKEN` ヘッダーで認証
- 必要なスコープ: `api`, `read_repository`, `write_repository`

---

## 実装済み MCP Tools（全32ツール）

### プロジェクト（2ツール） — `src/tools/projects.ts`

| # | ツール名 | 説明 | GitLab API |
|---|---------|------|-----------|
| 1 | `list_projects` | プロジェクト一覧取得 | `GET /projects` |
| 2 | `get_project` | プロジェクト詳細取得 | `GET /projects/:id` |

### Issue（4ツール） — `src/tools/issues.ts`

| # | ツール名 | 説明 | GitLab API |
|---|---------|------|-----------|
| 3 | `list_issues` | Issue一覧取得 | `GET /projects/:id/issues` |
| 4 | `get_issue` | Issue詳細取得 | `GET /projects/:id/issues/:iid` |
| 5 | `create_issue` | Issue作成 | `POST /projects/:id/issues` |
| 6 | `update_issue` | Issue更新 | `PUT /projects/:id/issues/:iid` |

### Merge Request（7ツール） — `src/tools/merge-requests.ts`

| # | ツール名 | 説明 | GitLab API |
|---|---------|------|-----------|
| 7 | `list_merge_requests` | MR一覧取得 | `GET /projects/:id/merge_requests` |
| 8 | `get_merge_request` | MR詳細取得 | `GET /projects/:id/merge_requests/:iid` |
| 9 | `create_merge_request` | MR作成 | `POST /projects/:id/merge_requests` |
| 10 | `get_merge_request_diffs` | MR差分取得 | `GET /projects/:id/merge_requests/:iid/diffs` |
| 11 | `create_merge_request_note` | MRにコメント | `POST /projects/:id/merge_requests/:iid/notes` |
| 12 | `merge_merge_request` | MRをマージ | `PUT /projects/:id/merge_requests/:iid/merge` |
| 13 | `approve_merge_request` | MR承認 | `POST /projects/:id/merge_requests/:iid/approve` |

### リポジトリ（4ツール） — `src/tools/repository.ts`

| # | ツール名 | 説明 | GitLab API |
|---|---------|------|-----------|
| 14 | `list_branches` | ブランチ一覧 | `GET /projects/:id/repository/branches` |
| 15 | `get_file_contents` | ファイル内容取得（Base64自動デコード） | `GET /projects/:id/repository/files/:path` |
| 16 | `create_branch` | ブランチ作成 | `POST /projects/:id/repository/branches` |
| 17 | `create_or_update_file` | ファイル作成/更新 | `PUT /projects/:id/repository/files/:path` |

### パイプライン / ジョブ（6ツール） — `src/tools/pipelines.ts`

| # | ツール名 | 説明 | GitLab API |
|---|---------|------|-----------|
| 18 | `list_pipelines` | パイプライン一覧 | `GET /projects/:id/pipelines` |
| 19 | `get_pipeline` | パイプライン詳細 | `GET /projects/:id/pipelines/:id` |
| 20 | `list_pipeline_jobs` | パイプラインジョブ一覧 | `GET /projects/:id/pipelines/:id/jobs` |
| 21 | `get_job_log` | ジョブログ取得 | `GET /projects/:id/jobs/:id/trace` |
| 22 | `retry_pipeline` | パイプライン再実行 | `POST /projects/:id/pipelines/:id/retry` |
| 23 | `cancel_pipeline` | パイプラインキャンセル | `POST /projects/:id/pipelines/:id/cancel` |

### ラベル（1ツール） — `src/tools/labels.ts`

| # | ツール名 | 説明 | GitLab API |
|---|---------|------|-----------|
| 24 | `list_labels` | ラベル一覧 | `GET /projects/:id/labels` |

### 検索（1ツール） — `src/tools/search.ts`

| # | ツール名 | 説明 | GitLab API |
|---|---------|------|-----------|
| 25 | `search` | グローバル/プロジェクト/グループ検索 | `GET /search` |

### マイルストーン（1ツール） — `src/tools/milestones.ts`

| # | ツール名 | 説明 | GitLab API |
|---|---------|------|-----------|
| 26 | `list_milestones` | マイルストーン一覧 | `GET /projects/:id/milestones` |

### デプロイメント / 環境（2ツール） — `src/tools/deployments.ts`

| # | ツール名 | 説明 | GitLab API |
|---|---------|------|-----------|
| 27 | `list_deployments` | デプロイメント一覧 | `GET /projects/:id/deployments` |
| 28 | `list_environments` | 環境一覧 | `GET /projects/:id/environments` |

### Wiki（2ツール） — `src/tools/wiki.ts`

| # | ツール名 | 説明 | GitLab API |
|---|---------|------|-----------|
| 29 | `list_wiki_pages` | Wikiページ一覧 | `GET /projects/:id/wikis` |
| 30 | `create_wiki_page` | Wikiページ作成 | `POST /projects/:id/wikis` |

### グループ / フォーク（2ツール） — `src/tools/groups.ts`

| # | ツール名 | 説明 | GitLab API |
|---|---------|------|-----------|
| 31 | `fork_project` | プロジェクトフォーク | `POST /projects/:id/fork` |
| 32 | `list_group_projects` | グループ内プロジェクト一覧 | `GET /groups/:id/projects` |

---

## 非機能要件

### エラーハンドリング
- GitLab API のエラーレスポンスをMCPエラーとして適切に変換
- 認証エラー（401）は明確なメッセージで返す
- レート制限（429）はレスポンスヘッダを含めて返す

### ページネーション
- デフォルトで `per_page=20`
- `page` パラメータによるページ指定をサポート

### 入力バリデーション
- Zod によるスキーマバリデーション（MCP SDK標準）

### ロギング
- MCP SDK の標準ロギング機構を使用
- stderr への出力（stdioトランスポートのため）

---

## プロジェクト構成

```
gitlab-mcp/
├── src/
│   ├── index.ts              # エントリポイント
│   ├── server.ts             # MCPサーバー定義
│   ├── gitlab-client.ts      # GitLab API クライアント
│   ├── types.ts              # 共通型定義
│   └── tools/
│       ├── projects.ts       # プロジェクト (2)
│       ├── issues.ts         # Issue (4)
│       ├── merge-requests.ts # Merge Request (7)
│       ├── repository.ts     # リポジトリ (4)
│       ├── pipelines.ts      # パイプライン / ジョブ (6)
│       ├── labels.ts         # ラベル (1)
│       ├── search.ts         # 検索 (1)
│       ├── milestones.ts     # マイルストーン (1)
│       ├── deployments.ts    # デプロイメント / 環境 (2)
│       ├── wiki.ts           # Wiki (2)
│       └── groups.ts         # グループ / フォーク (2)
├── tests/
│   ├── unit/                 # ユニットテスト
│   └── integration/          # 結合テスト（Docker GitLab使用）
├── docker/
│   ├── docker-compose.yml    # 検証用GitLab環境
│   └── setup.sh              # 初期セットアップスクリプト
├── package.json
├── tsconfig.json
└── REQUIREMENTS.md
```

---

## MCP設定例（Claude Code）

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "GITLAB_URL": "https://gitlab.example.com",
        "GITLAB_PERSONAL_ACCESS_TOKEN": "glpat-xxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```
