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

## 実装済み MCP Tools（全109ツール）

### プロジェクト（7ツール） — `src/tools/projects.ts`

| # | ツール名 | 説明 | GitLab API |
|---|---------|------|-----------|
| 1 | `list_projects` | プロジェクト一覧取得 | `GET /projects` |
| 2 | `get_project` | プロジェクト詳細取得 | `GET /projects/:id` |
| 3 | `update_project` | プロジェクト設定更新 | `PUT /projects/:id` |
| 4 | `list_protected_branches` | プロテクトブランチ一覧 | `GET /projects/:id/protected_branches` |
| 5 | `protect_branch` | ブランチ保護 | `POST /projects/:id/protected_branches` |
| 6 | `unprotect_branch` | ブランチ保護解除 | `DELETE /projects/:id/protected_branches/:name` |
| 7 | `delete_project` | プロジェクト削除 | `DELETE /projects/:id` |

### Issue（12ツール） — `src/tools/issues.ts`

| # | ツール名 | 説明 | GitLab API |
|---|---------|------|-----------|
| 8 | `list_issues` | Issue一覧取得 | `GET /projects/:id/issues` |
| 9 | `get_issue` | Issue詳細取得 | `GET /projects/:id/issues/:iid` |
| 10 | `create_issue` | Issue作成 | `POST /projects/:id/issues` |
| 11 | `update_issue` | Issue更新 | `PUT /projects/:id/issues/:iid` |
| 12 | `list_issue_notes` | Issueコメント一覧 | `GET /projects/:id/issues/:iid/notes` |
| 13 | `create_issue_note` | Issueにコメント | `POST /projects/:id/issues/:iid/notes` |
| 14 | `list_issue_links` | Issueリンク一覧 | `GET /projects/:id/issues/:iid/links` |
| 15 | `create_issue_link` | Issueリンク作成 | `POST /projects/:id/issues/:iid/links` |
| 16 | `list_related_merge_requests` | 関連MR一覧 | `GET /projects/:id/issues/:iid/related_merge_requests` |
| 17 | `delete_issue` | Issue削除 | `DELETE /projects/:id/issues/:iid` |
| 18 | `delete_issue_note` | Issueコメント削除 | `DELETE /projects/:id/issues/:iid/notes/:note_id` |
| 19 | `delete_issue_link` | Issueリンク削除 | `DELETE /projects/:id/issues/:iid/links/:link_id` |

### Merge Request（13ツール） — `src/tools/merge-requests.ts`

| # | ツール名 | 説明 | GitLab API |
|---|---------|------|-----------|
| 20 | `list_merge_requests` | MR一覧取得 | `GET /projects/:id/merge_requests` |
| 21 | `get_merge_request` | MR詳細取得 | `GET /projects/:id/merge_requests/:iid` |
| 22 | `create_merge_request` | MR作成 | `POST /projects/:id/merge_requests` |
| 23 | `get_merge_request_diffs` | MR差分取得 | `GET /projects/:id/merge_requests/:iid/diffs` |
| 24 | `create_merge_request_note` | MRにコメント | `POST /projects/:id/merge_requests/:iid/notes` |
| 25 | `merge_merge_request` | MRをマージ | `PUT /projects/:id/merge_requests/:iid/merge` |
| 26 | `approve_merge_request` | MR承認 | `POST /projects/:id/merge_requests/:iid/approve` |
| 27 | `list_merge_request_notes` | MRコメント一覧 | `GET /projects/:id/merge_requests/:iid/notes` |
| 28 | `list_merge_request_commits` | MRコミット一覧 | `GET /projects/:id/merge_requests/:iid/commits` |
| 29 | `create_merge_request_discussion` | MRディスカッション作成 | `POST /projects/:id/merge_requests/:iid/discussions` |
| 30 | `resolve_discussion` | ディスカッション解決/未解決切替 | `PUT /projects/:id/merge_requests/:iid/discussions/:id` |
| 31 | `delete_merge_request` | MR削除 | `DELETE /projects/:id/merge_requests/:iid` |
| 32 | `delete_merge_request_note` | MRコメント削除 | `DELETE /projects/:id/merge_requests/:iid/notes/:note_id` |

### リポジトリ（15ツール） — `src/tools/repository.ts`

| # | ツール名 | 説明 | GitLab API |
|---|---------|------|-----------|
| 33 | `list_branches` | ブランチ一覧 | `GET /projects/:id/repository/branches` |
| 34 | `get_file_contents` | ファイル内容取得（Base64自動デコード） | `GET /projects/:id/repository/files/:path` |
| 35 | `create_branch` | ブランチ作成 | `POST /projects/:id/repository/branches` |
| 36 | `create_or_update_file` | ファイル作成/更新 | `PUT /projects/:id/repository/files/:path` |
| 37 | `delete_branch` | ブランチ削除 | `DELETE /projects/:id/repository/branches/:branch` |
| 38 | `list_repository_tree` | ディレクトリ構造取得 | `GET /projects/:id/repository/tree` |
| 39 | `list_commits` | コミット一覧 | `GET /projects/:id/repository/commits` |
| 40 | `get_commit` | コミット詳細 | `GET /projects/:id/repository/commits/:sha` |
| 41 | `compare_branches` | ブランチ/タグ/コミット間比較 | `GET /projects/:id/repository/compare` |
| 42 | `list_tags` | タグ一覧 | `GET /projects/:id/repository/tags` |
| 43 | `create_tag` | タグ作成 | `POST /projects/:id/repository/tags` |
| 44 | `delete_tag` | タグ削除 | `DELETE /projects/:id/repository/tags/:tag_name` |
| 45 | `cherry_pick_commit` | チェリーピック | `POST /projects/:id/repository/commits/:sha/cherry_pick` |
| 46 | `revert_commit` | リバート | `POST /projects/:id/repository/commits/:sha/revert` |
| 47 | `delete_file` | ファイル削除 | `DELETE /projects/:id/repository/files/:path` |

### パイプライン / ジョブ（11ツール） — `src/tools/pipelines.ts`

| # | ツール名 | 説明 | GitLab API |
|---|---------|------|-----------|
| 48 | `list_pipelines` | パイプライン一覧 | `GET /projects/:id/pipelines` |
| 49 | `get_pipeline` | パイプライン詳細 | `GET /projects/:id/pipelines/:id` |
| 50 | `list_pipeline_jobs` | パイプラインジョブ一覧 | `GET /projects/:id/pipelines/:id/jobs` |
| 51 | `get_job_log` | ジョブログ取得 | `GET /projects/:id/jobs/:id/trace` |
| 52 | `retry_pipeline` | パイプライン再実行 | `POST /projects/:id/pipelines/:id/retry` |
| 53 | `cancel_pipeline` | パイプラインキャンセル | `POST /projects/:id/pipelines/:id/cancel` |
| 54 | `create_pipeline` | パイプライン手動トリガー | `POST /projects/:id/pipeline` |
| 55 | `play_job` | 手動ジョブ実行 | `POST /projects/:id/jobs/:id/play` |
| 56 | `list_pipeline_schedules` | スケジュール一覧 | `GET /projects/:id/pipeline_schedules` |
| 57 | `get_job_artifacts` | アーティファクト情報 | `GET /projects/:id/jobs/:id/artifacts` |
| 58 | `delete_pipeline` | パイプライン削除 | `DELETE /projects/:id/pipelines/:id` |

### ラベル（4ツール） — `src/tools/labels.ts`

| # | ツール名 | 説明 | GitLab API |
|---|---------|------|-----------|
| 59 | `list_labels` | ラベル一覧 | `GET /projects/:id/labels` |
| 60 | `create_label` | ラベル作成 | `POST /projects/:id/labels` |
| 61 | `update_label` | ラベル更新 | `PUT /projects/:id/labels/:id` |
| 62 | `delete_label` | ラベル削除 | `DELETE /projects/:id/labels/:id` |

### 検索（1ツール） — `src/tools/search.ts`

| # | ツール名 | 説明 | GitLab API |
|---|---------|------|-----------|
| 63 | `search` | グローバル/プロジェクト/グループ検索 | `GET /search` |

### マイルストーン（4ツール） — `src/tools/milestones.ts`

| # | ツール名 | 説明 | GitLab API |
|---|---------|------|-----------|
| 64 | `list_milestones` | マイルストーン一覧 | `GET /projects/:id/milestones` |
| 65 | `create_milestone` | マイルストーン作成 | `POST /projects/:id/milestones` |
| 66 | `update_milestone` | マイルストーン更新 | `PUT /projects/:id/milestones/:id` |
| 67 | `delete_milestone` | マイルストーン削除 | `DELETE /projects/:id/milestones/:id` |

### デプロイメント / 環境（3ツール） — `src/tools/deployments.ts`

| # | ツール名 | 説明 | GitLab API |
|---|---------|------|-----------|
| 68 | `list_deployments` | デプロイメント一覧 | `GET /projects/:id/deployments` |
| 69 | `list_environments` | 環境一覧 | `GET /projects/:id/environments` |
| 70 | `delete_environment` | 環境削除 | `DELETE /projects/:id/environments/:id` |

### Wiki（5ツール） — `src/tools/wiki.ts`

| # | ツール名 | 説明 | GitLab API |
|---|---------|------|-----------|
| 71 | `list_wiki_pages` | Wikiページ一覧 | `GET /projects/:id/wikis` |
| 72 | `create_wiki_page` | Wikiページ作成 | `POST /projects/:id/wikis` |
| 73 | `get_wiki_page` | Wikiページ取得 | `GET /projects/:id/wikis/:slug` |
| 74 | `update_wiki_page` | Wikiページ更新 | `PUT /projects/:id/wikis/:slug` |
| 75 | `delete_wiki_page` | Wikiページ削除 | `DELETE /projects/:id/wikis/:slug` |

### グループ / フォーク（10ツール） — `src/tools/groups.ts`

| # | ツール名 | 説明 | GitLab API |
|---|---------|------|-----------|
| 76 | `list_groups` | グループ一覧 | `GET /groups` |
| 77 | `get_group` | グループ詳細 | `GET /groups/:id` |
| 78 | `create_group` | グループ作成 | `POST /groups` |
| 79 | `update_group` | グループ更新 | `PUT /groups/:id` |
| 80 | `fork_project` | プロジェクトフォーク | `POST /projects/:id/fork` |
| 81 | `list_group_projects` | グループ内プロジェクト一覧 | `GET /groups/:id/projects` |
| 82 | `list_group_members` | グループメンバー一覧 | `GET /groups/:id/members` |
| 83 | `add_group_member` | グループメンバー追加 | `POST /groups/:id/members` |
| 84 | `delete_group` | グループ削除 | `DELETE /groups/:id` |
| 85 | `remove_group_member` | グループメンバー削除 | `DELETE /groups/:id/members/:user_id` |

### ユーザー（3ツール） — `src/tools/users.ts`

| # | ツール名 | 説明 | GitLab API |
|---|---------|------|-----------|
| 86 | `list_users` | ユーザー一覧 | `GET /users` |
| 87 | `get_user` | ユーザー詳細 | `GET /users/:id` |
| 88 | `get_current_user` | 現在の認証ユーザー | `GET /user` |

### プロジェクトメンバー（3ツール） — `src/tools/members.ts`

| # | ツール名 | 説明 | GitLab API |
|---|---------|------|-----------|
| 89 | `list_project_members` | メンバー一覧 | `GET /projects/:id/members` |
| 90 | `add_project_member` | メンバー追加 | `POST /projects/:id/members` |
| 91 | `remove_project_member` | メンバー削除 | `DELETE /projects/:id/members/:user_id` |

### リリース（3ツール） — `src/tools/releases.ts`

| # | ツール名 | 説明 | GitLab API |
|---|---------|------|-----------|
| 92 | `list_releases` | リリース一覧 | `GET /projects/:id/releases` |
| 93 | `create_release` | リリース作成 | `POST /projects/:id/releases` |
| 94 | `delete_release` | リリース削除 | `DELETE /projects/:id/releases/:tag_name` |

### スニペット（4ツール） — `src/tools/snippets.ts`

| # | ツール名 | 説明 | GitLab API |
|---|---------|------|-----------|
| 95 | `list_snippets` | スニペット一覧 | `GET /projects/:id/snippets` |
| 96 | `get_snippet` | スニペット詳細 | `GET /projects/:id/snippets/:id` |
| 97 | `create_snippet` | スニペット作成 | `POST /projects/:id/snippets` |
| 98 | `delete_snippet` | スニペット削除 | `DELETE /projects/:id/snippets/:id` |

### Webhook（3ツール） — `src/tools/webhooks.ts`

| # | ツール名 | 説明 | GitLab API |
|---|---------|------|-----------|
| 99 | `list_webhooks` | Webhook一覧 | `GET /projects/:id/hooks` |
| 100 | `create_webhook` | Webhook作成 | `POST /projects/:id/hooks` |
| 101 | `delete_webhook` | Webhook削除 | `DELETE /projects/:id/hooks/:id` |

### アクセストークン（3ツール） — `src/tools/access-tokens.ts`

| # | ツール名 | 説明 | GitLab API |
|---|---------|------|-----------|
| 102 | `list_project_access_tokens` | トークン一覧 | `GET /projects/:id/access_tokens` |
| 103 | `create_project_access_token` | トークン作成 | `POST /projects/:id/access_tokens` |
| 104 | `revoke_project_access_token` | トークン無効化 | `DELETE /projects/:id/access_tokens/:id` |

### イベント / アクティビティ（2ツール） — `src/tools/events.ts`

| # | ツール名 | 説明 | GitLab API |
|---|---------|------|-----------|
| 105 | `list_project_events` | プロジェクトイベント | `GET /projects/:id/events` |
| 106 | `list_user_events` | ユーザーイベント | `GET /users/:id/events` |

### 移行チェック（3ツール） — `src/tools/migration-check.ts`

| # | ツール名 | 説明 | GitLab API |
|---|---------|------|-----------|
| 107 | `check_issues_formatting` | Issue の Redmine→GitLab 移行フォーマット崩れ検出 | Issue API + パターンマッチ |
| 108 | `check_wiki_formatting` | Wiki の移行フォーマット崩れ検出 | Wiki API + パターンマッチ |
| 109 | `check_repository_formatting` | MD ファイルの移行フォーマット崩れ検出 | Repository API + パターンマッチ |

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
│       ├── projects.ts       # プロジェクト (7)
│       ├── issues.ts         # Issue (12)
│       ├── merge-requests.ts # Merge Request (13)
│       ├── repository.ts     # リポジトリ (15)
│       ├── pipelines.ts      # パイプライン / ジョブ (11)
│       ├── labels.ts         # ラベル (4)
│       ├── search.ts         # 検索 (1)
│       ├── milestones.ts     # マイルストーン (4)
│       ├── deployments.ts    # デプロイメント / 環境 (3)
│       ├── wiki.ts           # Wiki (5)
│       ├── groups.ts         # グループ / フォーク (10)
│       ├── users.ts          # ユーザー (3)
│       ├── members.ts        # プロジェクトメンバー (3)
│       ├── releases.ts       # リリース (3)
│       ├── snippets.ts       # スニペット (4)
│       ├── webhooks.ts       # Webhook (3)
│       ├── access-tokens.ts  # アクセストークン (3)
│       ├── events.ts         # イベント / アクティビティ (2)
│       └── migration-check.ts # 移行チェック (3)
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
