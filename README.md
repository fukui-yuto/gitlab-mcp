# gitlab-mcp

Personal Access Token (PAT) で認証する GitLab MCP サーバー。

GitLab 公式 MCP サーバーは OAuth 2.0 のみ対応・Premium 以上が必要ですが、本サーバーは **どのエディション (CE/EE/Free) でも** PAT だけで利用できます。

## 実装済みツール一覧（全147ツール）

### プロジェクト（8） — `projects.ts`

| ツール名 | 説明 |
|---------|------|
| `list_projects` | プロジェクト一覧を取得（検索・フィルタ対応） |
| `get_project` | プロジェクトの詳細情報を取得 |
| `create_project` | 新しいプロジェクトを作成 |
| `update_project` | プロジェクト設定を更新（マージ方法、CI設定等） |
| `list_protected_branches` | プロテクトブランチ一覧を取得 |
| `protect_branch` | ブランチを保護 |
| `unprotect_branch` | ブランチの保護を解除 |
| `delete_project` | プロジェクトを削除（取り消し不可） |

### Issue（21） — `issues.ts`

| ツール名 | 説明 |
|---------|------|
| `list_issues` | Issue 一覧を取得（状態・ラベル等でフィルタ） |
| `get_issue` | Issue の詳細情報を取得 |
| `create_issue` | 新しい Issue を作成 |
| `update_issue` | Issue を更新（タイトル変更・クローズ等） |
| `list_issue_notes` | Issue のコメント（ノート）一覧を取得 |
| `create_issue_note` | Issue にコメントを投稿 |
| `update_issue_note` | Issue のコメントを更新 |
| `list_issue_links` | Issue 間のリンク一覧を取得 |
| `create_issue_link` | Issue 同士をリンク（関連・ブロック等） |
| `list_related_merge_requests` | Issue に関連する MR 一覧を取得 |
| `list_issue_discussions` | Issue のディスカッション一覧を取得 |
| `create_issue_discussion` | Issue にディスカッションスレッドを作成 |
| `subscribe_to_issue` | Issue の通知を購読 |
| `unsubscribe_from_issue` | Issue の通知購読を解除 |
| `set_issue_time_estimate` | Issue の時間見積もりを設定 |
| `add_issue_time_spent` | Issue に作業時間を追加 |
| `get_issue_time_tracking_stats` | Issue の時間トラッキング統計を取得 |
| `list_issue_label_events` | Issue のラベル変更履歴を取得 |
| `delete_issue` | Issue を削除（取り消し不可） |
| `delete_issue_note` | Issue のコメント（ノート）を削除 |
| `delete_issue_link` | Issue 間のリンクを削除 |

### Merge Request（16） — `merge-requests.ts`

| ツール名 | 説明 |
|---------|------|
| `list_merge_requests` | MR 一覧を取得（状態・ブランチ等でフィルタ） |
| `get_merge_request` | MR の詳細情報を取得 |
| `create_merge_request` | 新しい MR を作成 |
| `update_merge_request` | MR を更新（タイトル・説明・状態変更等） |
| `get_merge_request_diffs` | MR の変更差分を取得 |
| `create_merge_request_note` | MR にコメントを投稿 |
| `update_merge_request_note` | MR のコメントを更新 |
| `merge_merge_request` | MR をマージ（スカッシュ・自動マージ対応） |
| `approve_merge_request` | MR を承認 |
| `list_merge_request_notes` | MR のコメント（ノート）一覧を取得 |
| `list_merge_request_commits` | MR に含まれるコミット一覧を取得 |
| `list_merge_request_discussions` | MR のディスカッション一覧を取得 |
| `create_merge_request_discussion` | MR にディスカッションスレッドを作成（行コメント対応） |
| `resolve_discussion` | ディスカッションを解決 / 未解決に切り替え |
| `delete_merge_request` | MR を削除（取り消し不可） |
| `delete_merge_request_note` | MR のコメント（ノート）を削除 |

### リポジトリ（17） — `repository.ts`

| ツール名 | 説明 |
|---------|------|
| `list_branches` | ブランチ一覧を取得 |
| `get_file_contents` | ファイル内容を取得（Base64 自動デコード） |
| `create_branch` | 新しいブランチを作成 |
| `create_or_update_file` | ファイルを作成または更新してコミット |
| `delete_branch` | ブランチを削除 |
| `list_repository_tree` | リポジトリのディレクトリ構造を取得 |
| `list_commits` | コミット一覧を取得 |
| `get_commit` | コミットの詳細情報を取得 |
| `compare_branches` | ブランチ / タグ / コミット間の差分を比較 |
| `list_tags` | タグ一覧を取得 |
| `create_tag` | 新しいタグを作成 |
| `delete_tag` | タグを削除 |
| `cherry_pick_commit` | コミットをチェリーピック |
| `revert_commit` | コミットをリバート |
| `list_repository_contributors` | コントリビューター一覧を取得 |
| `get_repository_blame` | ファイルの blame 情報を取得 |
| `delete_file` | リポジトリ内のファイルを削除 |

### パイプライン / ジョブ（15） — `pipelines.ts`

| ツール名 | 説明 |
|---------|------|
| `list_pipelines` | パイプライン一覧を取得 |
| `get_pipeline` | パイプラインの詳細情報を取得 |
| `list_pipeline_jobs` | パイプライン内のジョブ一覧を取得 |
| `get_job_log` | ジョブのログ（トレース）を取得 |
| `retry_pipeline` | 失敗したパイプラインを再実行 |
| `cancel_pipeline` | 実行中のパイプラインをキャンセル |
| `create_pipeline` | パイプラインを手動トリガー（変数指定可） |
| `play_job` | 手動ジョブを実行 |
| `list_pipeline_schedules` | パイプラインスケジュール一覧を取得 |
| `get_pipeline_schedule` | パイプラインスケジュールの詳細を取得 |
| `create_pipeline_schedule` | パイプラインスケジュールを作成 |
| `update_pipeline_schedule` | パイプラインスケジュールを更新 |
| `delete_pipeline_schedule` | パイプラインスケジュールを削除 |
| `get_job_artifacts` | ジョブアーティファクト情報を取得 |
| `delete_pipeline` | パイプラインと関連ジョブを削除（取り消し不可） |

### CI/CD 変数（6） — `ci-variables.ts`

| ツール名 | 説明 |
|---------|------|
| `list_project_variables` | プロジェクトの CI/CD 変数一覧を取得 |
| `get_project_variable` | CI/CD 変数の詳細を取得 |
| `create_project_variable` | CI/CD 変数を作成 |
| `update_project_variable` | CI/CD 変数を更新 |
| `delete_project_variable` | CI/CD 変数を削除 |
| `list_group_variables` | グループの CI/CD 変数一覧を取得 |

### ランナー（4） — `runners.ts`

| ツール名 | 説明 |
|---------|------|
| `list_runners` | 利用可能な全ランナー一覧を取得 |
| `list_project_runners` | プロジェクトのランナー一覧を取得 |
| `get_runner` | ランナーの詳細情報を取得 |
| `list_runner_jobs` | ランナーが実行したジョブ一覧を取得 |

### ラベル（4） — `labels.ts`

| ツール名 | 説明 |
|---------|------|
| `list_labels` | プロジェクトのラベル一覧を取得 |
| `create_label` | 新しいラベルを作成 |
| `update_label` | ラベルを更新 |
| `delete_label` | ラベルを削除 |

### 検索（1） — `search.ts`

| ツール名 | 説明 |
|---------|------|
| `search` | グローバル / プロジェクト / グループ横断検索 |

### マイルストーン（4） — `milestones.ts`

| ツール名 | 説明 |
|---------|------|
| `list_milestones` | マイルストーン一覧を取得 |
| `create_milestone` | 新しいマイルストーンを作成 |
| `update_milestone` | マイルストーンを更新 |
| `delete_milestone` | マイルストーンを削除 |

### デプロイメント / 環境（7） — `deployments.ts`

| ツール名 | 説明 |
|---------|------|
| `list_deployments` | デプロイメント一覧を取得 |
| `list_environments` | 環境一覧を取得 |
| `get_environment` | 環境の詳細情報を取得 |
| `create_environment` | 環境を作成 |
| `update_environment` | 環境を更新 |
| `stop_environment` | 環境を停止 |
| `delete_environment` | 環境を削除（停止済みの環境のみ） |

### Wiki（5） — `wiki.ts`

| ツール名 | 説明 |
|---------|------|
| `list_wiki_pages` | Wiki ページ一覧を取得 |
| `create_wiki_page` | Wiki ページを新規作成 |
| `get_wiki_page` | Wiki ページの内容を取得 |
| `update_wiki_page` | Wiki ページを更新 |
| `delete_wiki_page` | Wiki ページを削除 |

### グループ / フォーク（10） — `groups.ts`

| ツール名 | 説明 |
|---------|------|
| `list_groups` | グループ一覧を取得 |
| `get_group` | グループの詳細情報を取得 |
| `create_group` | 新しいグループを作成 |
| `update_group` | グループを更新 |
| `fork_project` | プロジェクトをフォーク |
| `list_group_projects` | グループ内のプロジェクト一覧を取得 |
| `list_group_members` | グループのメンバー一覧を取得 |
| `add_group_member` | グループにメンバーを追加 |
| `delete_group` | グループを削除（取り消し不可） |
| `remove_group_member` | グループからメンバーを削除 |

### ユーザー（3） — `users.ts`

| ツール名 | 説明 |
|---------|------|
| `list_users` | ユーザー一覧を取得 |
| `get_user` | ユーザーの詳細情報を取得 |
| `get_current_user` | 現在の認証ユーザー情報を取得 |

### プロジェクトメンバー（3） — `members.ts`

| ツール名 | 説明 |
|---------|------|
| `list_project_members` | プロジェクトのメンバー一覧を取得 |
| `add_project_member` | プロジェクトにメンバーを追加 |
| `remove_project_member` | プロジェクトからメンバーを削除 |

### リリース（5） — `releases.ts`

| ツール名 | 説明 |
|---------|------|
| `list_releases` | リリース一覧を取得 |
| `get_release` | リリースの詳細情報を取得 |
| `create_release` | 新しいリリースを作成 |
| `update_release` | リリースを更新 |
| `delete_release` | リリースを削除（関連タグは削除されない） |

### スニペット（5） — `snippets.ts`

| ツール名 | 説明 |
|---------|------|
| `list_snippets` | スニペット一覧を取得 |
| `get_snippet` | スニペットの詳細情報を取得 |
| `create_snippet` | 新しいスニペットを作成 |
| `update_snippet` | スニペットを更新 |
| `delete_snippet` | スニペットを削除 |

### Webhook（5） — `webhooks.ts`

| ツール名 | 説明 |
|---------|------|
| `list_webhooks` | Webhook 一覧を取得 |
| `get_webhook` | Webhook の詳細情報を取得 |
| `create_webhook` | Webhook を作成 |
| `update_webhook` | Webhook を更新 |
| `delete_webhook` | Webhook を削除 |

### アクセストークン（3） — `access-tokens.ts`

| ツール名 | 説明 |
|---------|------|
| `list_project_access_tokens` | プロジェクトアクセストークン一覧を取得 |
| `create_project_access_token` | プロジェクトアクセストークンを作成 |
| `revoke_project_access_token` | プロジェクトアクセストークンを無効化（削除） |

### イベント / アクティビティ（2） — `events.ts`

| ツール名 | 説明 |
|---------|------|
| `list_project_events` | プロジェクトのアクティビティログを取得 |
| `list_user_events` | ユーザーの活動履歴を取得 |

### 移行チェック（3） — `migration-check.ts`

| ツール名 | 説明 |
|---------|------|
| `check_issues_formatting` | Issue の Redmine→GitLab 移行時フォーマット崩れを検出 |
| `check_wiki_formatting` | Wiki の Redmine→GitLab 移行時フォーマット崩れを検出 |
| `check_repository_formatting` | リポジトリ内 MD ファイルの移行時フォーマット崩れを検出 |

## 前提条件

- Node.js 20 以上
- GitLab の Personal Access Token（スコープ: `api`）

## インストール・ビルド

```bash
git clone https://github.com/your-name/gitlab-mcp.git
cd gitlab-mcp
npm install
npm run build
```

## 環境変数

| 変数名 | 必須 | デフォルト | 説明 |
|--------|------|-----------|------|
| `GITLAB_PERSONAL_ACCESS_TOKEN` | Yes | - | GitLab PAT (`glpat-xxx`) |
| `GITLAB_URL` | No | `http://localhost:8929` | GitLab インスタンスの URL |

## クライアント別セットアップ

### Claude Code

`~/.claude/settings.json` に追加:

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "node",
      "args": ["/path/to/gitlab-mcp/dist/index.js"],
      "env": {
        "GITLAB_URL": "https://gitlab.example.com",
        "GITLAB_PERSONAL_ACCESS_TOKEN": "glpat-xxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

### GitHub Copilot (VS Code)

> 前提: VS Code 1.99 以上 + GitHub Copilot 拡張

#### 方法 1: コマンドパレットから追加

1. `Ctrl+Shift+P` → **MCP: Add Server...** を選択
2. **stdio** を選択
3. コマンド `node`、引数に `dist/index.js` のフルパスを入力
4. `.vscode/mcp.json` が自動生成される

#### 方法 2: 手動で設定ファイルを作成

プロジェクトルートに `.vscode/mcp.json` を作成:

```json
{
  "servers": {
    "gitlab": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/gitlab-mcp/dist/index.js"],
      "env": {
        "GITLAB_URL": "https://gitlab.example.com",
        "GITLAB_PERSONAL_ACCESS_TOKEN": "glpat-xxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

トークンをハードコードしたくない場合は `inputs` を使用:

```json
{
  "inputs": [
    {
      "id": "gitlab-token",
      "type": "promptString",
      "description": "GitLab Personal Access Token",
      "password": true
    }
  ],
  "servers": {
    "gitlab": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/gitlab-mcp/dist/index.js"],
      "env": {
        "GITLAB_URL": "https://gitlab.example.com",
        "GITLAB_PERSONAL_ACCESS_TOKEN": "${input:gitlab-token}"
      }
    }
  }
}
```

#### 方法 3: ユーザー設定 (全ワークスペース共通)

`settings.json` に追加:

```json
{
  "mcp": {
    "servers": {
      "gitlab": {
        "type": "stdio",
        "command": "node",
        "args": ["/path/to/gitlab-mcp/dist/index.js"],
        "env": {
          "GITLAB_URL": "https://gitlab.example.com",
          "GITLAB_PERSONAL_ACCESS_TOKEN": "glpat-xxxxxxxxxxxxxxxxxxxx"
        }
      }
    }
  }
}
```

#### Copilot での使い方

1. Copilot Chat を開く (`Ctrl+Alt+I`)
2. チャット上部のドロップダウンで **Agent** モードを選択
3. ツールアイコン (レンチ) から gitlab ツールが有効になっていることを確認
4. 「プロジェクト一覧を見せて」などと質問すると MCP ツールが呼ばれる

## 検証用 GitLab 環境 (Docker)

ローカルで GitLab CE を起動してテストできます。

```bash
# GitLab 起動 (初回は5-10分かかります)
cd docker
docker compose up -d

# 起動確認
docker compose logs -f gitlab

# テストデータ投入 (GitLab が Ready になった後に実行)
bash setup.sh
```

セットアップ完了後:

- Web UI: http://localhost:8929 (`root` / `GitLabTestPass123!`)
- `.env.test` に PAT が保存される

```bash
# 停止
docker compose down

# データごと完全削除
docker compose down -v
```

## テスト

```bash
# ユニットテスト
npm test

# 結合テスト (Docker GitLab が起動している必要あり)
npm run test:integration
```

## プロジェクト構成

```
gitlab-mcp/
├── src/
│   ├── index.ts              # エントリポイント (stdio transport)
│   ├── server.ts             # MCP サーバー定義
│   ├── gitlab-client.ts      # GitLab API v4 クライアント
│   ├── types.ts              # 共通型定義
│   └── tools/
│       ├── projects.ts       # プロジェクト (8)
│       ├── issues.ts         # Issue (21)
│       ├── merge-requests.ts # Merge Request (16)
│       ├── repository.ts     # リポジトリ (17)
│       ├── pipelines.ts      # パイプライン / ジョブ (15)
│       ├── ci-variables.ts   # CI/CD 変数 (6)
│       ├── runners.ts        # ランナー (4)
│       ├── labels.ts         # ラベル (4)
│       ├── search.ts         # 検索 (1)
│       ├── milestones.ts     # マイルストーン (4)
│       ├── deployments.ts    # デプロイメント / 環境 (7)
│       ├── wiki.ts           # Wiki (5)
│       ├── groups.ts         # グループ / フォーク (10)
│       ├── users.ts          # ユーザー (3)
│       ├── members.ts        # プロジェクトメンバー (3)
│       ├── releases.ts       # リリース (5)
│       ├── snippets.ts       # スニペット (5)
│       ├── webhooks.ts       # Webhook (5)
│       ├── access-tokens.ts  # アクセストークン (3)
│       ├── events.ts         # イベント / アクティビティ (2)
│       └── migration-check.ts # 移行チェック (3)
├── tests/
│   ├── unit/                 # ユニットテスト (fetch モック)
│   └── integration/          # 結合テスト (Docker GitLab)
├── docker/
│   ├── docker-compose.yml    # 検証用 GitLab CE
│   └── setup.sh              # PAT・テストデータ作成
├── package.json
└── tsconfig.json
```

## ライセンス

MIT
