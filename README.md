# gitlab-mcp

Personal Access Token (PAT) で認証する GitLab MCP サーバー。

GitLab 公式 MCP サーバーは OAuth 2.0 のみ対応・Premium 以上が必要ですが、本サーバーは **どのエディション (CE/EE/Free) でも** PAT だけで利用できます。

## 実装済みツール一覧（全32ツール）

### プロジェクト（2） — `projects.ts`

| ツール名 | 説明 |
|---------|------|
| `list_projects` | プロジェクト一覧を取得（検索・フィルタ対応） |
| `get_project` | プロジェクトの詳細情報を取得 |

### Issue（4） — `issues.ts`

| ツール名 | 説明 |
|---------|------|
| `list_issues` | Issue 一覧を取得（状態・ラベル等でフィルタ） |
| `get_issue` | Issue の詳細情報を取得 |
| `create_issue` | 新しい Issue を作成 |
| `update_issue` | Issue を更新（タイトル変更・クローズ等） |

### Merge Request（7） — `merge-requests.ts`

| ツール名 | 説明 |
|---------|------|
| `list_merge_requests` | MR 一覧を取得（状態・ブランチ等でフィルタ） |
| `get_merge_request` | MR の詳細情報を取得 |
| `create_merge_request` | 新しい MR を作成 |
| `get_merge_request_diffs` | MR の変更差分を取得 |
| `create_merge_request_note` | MR にコメントを投稿 |
| `merge_merge_request` | MR をマージ（スカッシュ・自動マージ対応） |
| `approve_merge_request` | MR を承認 |

### リポジトリ（4） — `repository.ts`

| ツール名 | 説明 |
|---------|------|
| `list_branches` | ブランチ一覧を取得 |
| `get_file_contents` | ファイル内容を取得（Base64 自動デコード） |
| `create_branch` | 新しいブランチを作成 |
| `create_or_update_file` | ファイルを作成または更新してコミット |

### パイプライン / ジョブ（6） — `pipelines.ts`

| ツール名 | 説明 |
|---------|------|
| `list_pipelines` | パイプライン一覧を取得 |
| `get_pipeline` | パイプラインの詳細情報を取得 |
| `list_pipeline_jobs` | パイプライン内のジョブ一覧を取得 |
| `get_job_log` | ジョブのログ（トレース）を取得 |
| `retry_pipeline` | 失敗したパイプラインを再実行 |
| `cancel_pipeline` | 実行中のパイプラインをキャンセル |

### ラベル（1） — `labels.ts`

| ツール名 | 説明 |
|---------|------|
| `list_labels` | プロジェクトのラベル一覧を取得 |

### 検索（1） — `search.ts`

| ツール名 | 説明 |
|---------|------|
| `search` | グローバル / プロジェクト / グループ横断検索 |

### マイルストーン（1） — `milestones.ts`

| ツール名 | 説明 |
|---------|------|
| `list_milestones` | マイルストーン一覧を取得 |

### デプロイメント / 環境（2） — `deployments.ts`

| ツール名 | 説明 |
|---------|------|
| `list_deployments` | デプロイメント一覧を取得 |
| `list_environments` | 環境一覧を取得 |

### Wiki（2） — `wiki.ts`

| ツール名 | 説明 |
|---------|------|
| `list_wiki_pages` | Wiki ページ一覧を取得 |
| `create_wiki_page` | Wiki ページを新規作成 |

### グループ / フォーク（2） — `groups.ts`

| ツール名 | 説明 |
|---------|------|
| `fork_project` | プロジェクトをフォーク |
| `list_group_projects` | グループ内のプロジェクト一覧を取得 |

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
