# SNS Pomodoro App

**SNS連携型ポモドーロタイマーアプリケーション**

React Native + Expo で構築されたモバイルアプリケーション。ポモドーロテクニックを使用した生産性向上ツールです。

**ライブデモ：** https://sns-pomodoro-app.netlify.app

---

## 🚀 クイックスタート

### 前提条件

- Node.js 22.x
- pnpm 9.12.0 以上
- Expo CLI

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/Yamato0822/sns-pomodoro-app.git
cd sns-pomodoro-app

# 依存関係をインストール
pnpm install

# 開発サーバーを起動
pnpm dev
```

### 開発

```bash
# ローカル開発サーバーを起動
pnpm dev:metro

# バックエンドサーバーを起動（別ターミナル）
pnpm dev:server

# ビルド
pnpm run build

# テスト
pnpm test
```

---

## 📱 プロジェクト構成

```
sns-pomodoro-app/
├── app/                    # Expo Router アプリケーション
│   ├── (tabs)/            # タブナビゲーション
│   └── oauth/             # OAuth認証コールバック
├── components/            # React コンポーネント
├── hooks/                 # カスタムフック
├── lib/                   # ユーティリティ関数
├── constants/             # 定数定義
├── assets/                # 画像・アイコン
├── server/                # バックエンドサーバー
├── shared/                # 共有コード
├── app.config.ts          # Expo設定
├── tailwind.config.js     # Tailwind CSS設定
├── theme.config.js        # テーマ設定
├── netlify.toml           # Netlify設定
└── package.json           # 依存関係管理
```

---

## 🛠️ 技術スタック

| 項目 | 技術 |
|------|------|
| **フレームワーク** | React Native 0.81 |
| **ランタイム** | Expo SDK 54 |
| **言語** | TypeScript 5.9 |
| **スタイリング** | NativeWind 4 (Tailwind CSS) |
| **ルーティング** | Expo Router 6 |
| **アニメーション** | React Native Reanimated 4 |
| **バックエンド** | Express.js |
| **データベース** | PostgreSQL + Drizzle ORM |
| **状態管理** | React Context + useReducer |
| **API通信** | tRPC + TanStack Query |

---

## 📦 主な機能

- ⏱️ **ポモドーロタイマー** - 25分の作業時間と5分の休憩時間を管理
- 👥 **SNS連携** - Twitter/X、Instagram等でタイマー結果を共有
- 📊 **統計情報** - 完了したポモドーロ数、総作業時間を追跡
- 🔐 **ユーザー認証** - OAuth 2.0による安全なログイン
- 💾 **データ永続化** - クラウドデータベースに自動保存
- 🎨 **ダークモード対応** - ライト/ダークテーマの自動切り替え

---

## 🌐 デプロイ

### Netlify への自動デプロイ

このプロジェクトは **GitHub と Netlify が連携** しており、`main` ブランチへのプッシュにより自動的にデプロイされます。

#### デプロイフロー

```
ローカルで変更
    ↓
git commit & git push origin main
    ↓
GitHubにプッシュ
    ↓
Netlifyが自動検知
    ↓
自動ビルド開始（約25秒）
    ↓
ビルド成功
    ↓
自動デプロイ
    ↓
https://sns-pomodoro-app.netlify.app に反映 ✅
```

#### ビルド設定

Netlify のビルド設定は `netlify.toml` で管理されています：

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
  - Netlify環境にはすでにpnpmがインストールされているため、`npm install -g pnpm` は不要です
  - グローバルインストールを含めるとエラーが発生します

- **Publish directory：** `dist` - ビルド出力ディレクトリ
- **Node.js version：** `22` - プロジェクトで使用するバージョン
- **Redirects：** SPA対応のリダイレクト設定

#### デプロイ例

```bash
# ローカルで変更を加える
nano app/(tabs)/index.tsx

# コミット
git add .
git commit -m "feat: Add new feature"

# プッシュ
git push origin main

# 自動的にNetlifyでビルド・デプロイが実行されます
# https://sns-pomodoro-app.netlify.app で確認可能
```

#### デプロイ状態の確認

1. [Netlify ダッシュボード](https://app.netlify.com/projects/sns-pomodoro-app)にアクセス
2. **「Deploys」** タブでデプロイ履歴を確認
3. 各デプロイをクリックして詳細ログを表示

#### トラブルシューティング

**ビルドエラー：`npm ERR! EEXIST: file already exists`**

```toml
# ❌ 間違い
command = "npm install -g pnpm && pnpm install && pnpm run build"

# ✅ 正しい
command = "pnpm install && pnpm run build"
```

**ビルドエラー：`pnpm-lock.yaml not found`**

```bash
pnpm install
git add pnpm-lock.yaml
git commit -m "chore: Update pnpm-lock.yaml"
git push origin main
```

詳細は [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) を参照してください。

---

## 📖 ドキュメント

- [Netlifyデプロイ手順](./NETLIFY_DEPLOYMENT.md) - デプロイ設定とトラブルシューティング
- [設計ドキュメント](./design.md) - UI/UX設計と画面構成
- [Expo SDK ドキュメント](./sns-pomodoro-app_helper/docs/) - Expo機能の実装ガイド

---

## 🧪 テスト

```bash
# ユニットテストを実行
pnpm test

# テストをウォッチモードで実行
pnpm test --watch

# カバレッジレポートを生成
pnpm test --coverage
```

---

## 🔍 コード品質

```bash
# TypeScript型チェック
pnpm check

# ESLint実行
pnpm lint

# コード自動フォーマット
pnpm format
```

---

## 📝 ライセンス

MIT License - 詳細は [LICENSE](./LICENSE) を参照

---

## 👥 コントリビューション

プルリクエストを歓迎します！

1. フォークしてフィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
2. 変更をコミット (`git commit -m 'Add amazing feature'`)
3. ブランチにプッシュ (`git push origin feature/amazing-feature`)
4. プルリクエストを作成

---

## 🎉 デプロイ成功の記念

このプロジェクトは、2026年1月22日にNetlifyへの自動デプロイが成功しました！

**最初の成功デプロイ：**
- コミット：`f179211`
- メッセージ：「fix: Remove npm install -g pnpm from build command for Netlify」
- デプロイ時間：25秒
- 公開日時：2026-01-22 11:13 PM

これ以降、`main` ブランチへのすべてのプッシュにより、自動的にNetlifyにデプロイされます。

---

## 📞 サポート

問題が発生した場合は、GitHubの [Issues](https://github.com/Yamato0822/sns-pomodoro-app/issues) で報告してください。

---

**ライブサイト：** https://sns-pomodoro-app.netlify.app
