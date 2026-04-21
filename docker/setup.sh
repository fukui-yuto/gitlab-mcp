#!/bin/bash
# GitLab テスト環境セットアップスクリプト
# GitLabが起動した後に実行して、テスト用のPATとプロジェクトを作成する
set -euo pipefail

GITLAB_URL="${GITLAB_URL:-http://localhost:8929}"
ROOT_PASSWORD="${ROOT_PASSWORD:-GitLabTestPass123!}"

echo "=== GitLab MCP テスト環境セットアップ ==="
echo "GitLab URL: ${GITLAB_URL}"

# GitLabの起動を待つ
echo ""
echo "[1/4] GitLabの起動を待機中..."
for i in $(seq 1 60); do
  if curl -sf "${GITLAB_URL}/-/readiness" > /dev/null 2>&1; then
    echo "  GitLab is ready!"
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "  ERROR: GitLab did not become ready within 30 minutes"
    exit 1
  fi
  echo "  Waiting... (${i}/60, retrying in 30s)"
  sleep 30
done

# rootユーザーのPATを作成
echo ""
echo "[2/4] Personal Access Token を作成中..."
PAT_RESPONSE=$(curl -sf "${GITLAB_URL}/api/v4/session" \
  --data-urlencode "login=root" \
  --data-urlencode "password=${ROOT_PASSWORD}" 2>/dev/null || true)

# session APIが無効な場合、rails consoleで作成
# GitLab 17+ではsession APIが廃止されているため、docker execで作成
echo "  Rails console経由でPATを作成します..."
PAT_TOKEN="glpat-test-$(date +%s)"

docker exec gitlab-mcp-test gitlab-rails runner "
  user = User.find_by_username('root')
  token = user.personal_access_tokens.create!(
    name: 'mcp-test-token',
    scopes: [:api, :read_repository, :write_repository],
    expires_at: 365.days.from_now
  )
  token.set_token('${PAT_TOKEN}')
  token.save!
  puts \"Token created: #{token.token}\"
"

echo "  PAT: ${PAT_TOKEN}"

# テスト用プロジェクトを作成
echo ""
echo "[3/4] テスト用プロジェクトを作成中..."

# プロジェクト作成
curl -sf "${GITLAB_URL}/api/v4/projects" \
  -H "PRIVATE-TOKEN: ${PAT_TOKEN}" \
  -d "name=test-project" \
  -d "description=MCP integration test project" \
  -d "initialize_with_readme=true" \
  -d "visibility=public" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'  Project created: {d[\"path_with_namespace\"]} (ID: {d[\"id\"]})')" 2>/dev/null || echo "  Project may already exist"

# テスト用Issue作成
echo ""
echo "[4/4] テスト用データを作成中..."

curl -sf "${GITLAB_URL}/api/v4/projects/1/issues" \
  -H "PRIVATE-TOKEN: ${PAT_TOKEN}" \
  -d "title=Test Issue 1" \
  -d "description=This is a test issue for MCP integration testing" \
  -d "labels=bug,test" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'  Issue created: #{d[\"iid\"]} - {d[\"title\"]}')" 2>/dev/null || echo "  Issue creation skipped"

curl -sf "${GITLAB_URL}/api/v4/projects/1/issues" \
  -H "PRIVATE-TOKEN: ${PAT_TOKEN}" \
  -d "title=Test Issue 2 - Feature Request" \
  -d "description=A feature request for testing" \
  -d "labels=feature" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'  Issue created: #{d[\"iid\"]} - {d[\"title\"]}')" 2>/dev/null || echo "  Issue creation skipped"

echo ""
echo "=== セットアップ完了 ==="
echo ""
echo "以下の環境変数をMCPサーバーに設定してください:"
echo ""
echo "  export GITLAB_URL=${GITLAB_URL}"
echo "  export GITLAB_PERSONAL_ACCESS_TOKEN=${PAT_TOKEN}"
echo ""
echo "GitLab Web UI: ${GITLAB_URL}"
echo "  ユーザー: root"
echo "  パスワード: ${ROOT_PASSWORD}"

# .envファイルとして保存
ENV_FILE="$(dirname "$0")/../.env.test"
cat > "${ENV_FILE}" << EOF
GITLAB_URL=${GITLAB_URL}
GITLAB_PERSONAL_ACCESS_TOKEN=${PAT_TOKEN}
GITLAB_ROOT_PASSWORD=${ROOT_PASSWORD}
EOF
echo ""
echo ".env.test に保存しました: ${ENV_FILE}"
