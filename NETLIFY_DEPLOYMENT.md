# Netlifyデプロイ手順

このドキュメントでは、SNS Pomodoro Appを**Netlify**にデプロイするための手順を説明します。

## 概要

SNS Pomodoro Appは、GitHubとの連携により、**自動的にNetlifyにデプロイ**されます。`main`ブランチへのプッシュにより、Netlifyが自動的にビルドとデプロイを実行します。

**ライブURL：** https://sns-pomodoro-app.netlify.app

---

## セットアップ手順

### 1. Netlifyプロジェクトの作成

1. [Netlify](https://app.netlify.com)にログインします
2. **「New site from Git」**をクリック
3. GitHubを選択し、`sns-pomodoro-app`リポジトリを接続
4. ビルド設定を確認（以下参照）

### 2. ビルド設定

Netlifyのビルド設定は、**`netlify.toml`ファイル**で管理されます。

```toml
[build]
  command = "pnpm install && pnpm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**重要なポイント：**

- **Build command：** `pnpm install && pnpm run build`
  - Netlifyの環境にはすでにpnpmがインストールされているため、`npm install -g pnpm`は不要です
  - グローバルインストールを含めるとエラーが発生します（`EEXIST: file already exists`）

- **Publish directory：** `dist`
  - ビルド出力ディレクトリ

- **Node.js version：** `22`
  - プロジェクトで使用するNode.jsバージョン

- **Redirects：** SPA（Single Page Application）対応
  - すべてのリクエストを`index.html`にリダイレクト

---

## デプロイフロー

### 自動デプロイ（推奨）

1. ローカルで変更を加える
2. `git add`と`git commit`でコミット
3. `git push origin main`でGitHubにプッシュ
4. Netlifyが自動的にビルド・デプロイを実行
5. デプロイ完了後、https://sns-pomodoro-app.netlify.app でアクセス可能

### 手動デプロイ

Netlifyダッシュボードから手動でデプロイをトリガーすることも可能です：

1. [Netlifyダッシュボード](https://app.netlify.com/projects/sns-pomodoro-app)にアクセス
2. **「Deploys」** タブをクリック
3. **「Trigger deploy」** ボタンをクリック
4. **「Deploy site」** を選択

---

## トラブルシューティング

### ビルドエラー：`npm ERR! EEXIST: file already exists`

**原因：** Build commandに`npm install -g pnpm`が含まれている

**解決策：** `netlify.toml`を以下のように修正

```toml
# ❌ 間違い
command = "npm install -g pnpm && pnpm install && pnpm run build"

# ✅ 正しい
command = "pnpm install && pnpm run build"
```

### ビルドエラー：`pnpm-lock.yaml not found`

**原因：** `pnpm-lock.yaml`がGitHubにコミットされていない

**解決策：**

```bash
# ローカルで依存関係をインストール
pnpm install

# pnpm-lock.yamlをコミット
git add pnpm-lock.yaml
git commit -m "chore: Update pnpm-lock.yaml"
git push origin main
```

### ビルドエラー：`Build script returned non-zero exit code`

**原因：** ビルド中にエラーが発生

**確認方法：**

1. Netlifyダッシュボードの**「Deploys」**タブで失敗したデプロイをクリック
2. **「Deploy log」**でエラーメッセージを確認
3. ローカルで`pnpm run build`を実行して同じエラーが発生するか確認

---

## 環境変数の設定

Netlifyで環境変数が必要な場合：

1. Netlifyダッシュボード → **「Project configuration」** → **「Environment variables」**
2. 環境変数を追加
3. デプロイを再トリガー

---

## デプロイ履歴の確認

Netlifyダッシュボードの**「Deploys」**タブで、すべてのデプロイ履歴を確認できます：

- **Published：** デプロイ成功
- **Failed：** デプロイ失敗
- **Building：** デプロイ進行中

各デプロイをクリックすると、詳細なログを確認できます。

---

## 本番環境URL

**ライブサイト：** https://sns-pomodoro-app.netlify.app

このURLは、`main`ブランチの最新デプロイが自動的に反映されます。

---

## 参考資料

- [Netlify Documentation](https://docs.netlify.com)
- [netlify.toml Reference](https://docs.netlify.com/configure-builds/file-based-configuration/)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/)

---

## デプロイ成功の記念

このプロジェクトは、2026年1月22日にNetlifyへの自動デプロイが成功しました！🎉

**最初の成功デプロイ：**
- コミット：`f179211`
- メッセージ：「fix: Remove npm install -g pnpm from build command for Netlify」
- デプロイ時間：25秒
- 公開日時：2026-01-22 11:13 PM

これ以降、`main`ブランチへのすべてのプッシュにより、自動的にNetlifyにデプロイされます。
