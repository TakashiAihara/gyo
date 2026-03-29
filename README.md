# gyo

AI がスクラムマスター兼 PM として機能するタスク管理システム。

自然言語でタスクを投げるだけで、分解・優先付け・見積もり・リマインドを AI が担う。

## コンセプト

> ユーザーはタスクを「投げる」だけでよい。

AI がしないこと: 意思決定の代行。提案はするが、判断はユーザー。

## 主な機能

- 自然言語でタスクを追加・更新
- AI（Claude API）による構造化・優先付け・時間見積もり・次アクション提案
- [OpenClaw](https://openclaw.ai/) Skill 経由でチャットアプリ（Telegram 等）から操作
- Android へのリマインダー通知（Gotify 起点、複数プロバイダー対応予定）
- 複数デバイス・複数サーバーから同じデータにアクセス
- Google OAuth によるユーザー分割

## CLI

```bash
gyo add "来週月曜までにPR出す"   # 自然言語 → AI が構造化
gyo list                          # 一覧
gyo list --due today              # 期日フィルタ
gyo done <id>                     # 完了
gyo next                          # AI が次にやるべきタスクを提案
gyo estimate <id>                 # AI が時間見積もり
gyo show <id>                     # 詳細
```

## アーキテクチャ

```
gyo CLI (Bun, シングルバイナリ)
  └── HTTP
        └── Cloud Run API (Bun)
              ├── Neon (serverless PostgreSQL)
              ├── Claude API (AI)
              └── Gotify / 通知プロバイダー
```

## 構成

```
packages/
  cli/     # gyo CLI (bun build --compile でシングルバイナリ)
  server/  # Cloud Run API
  shared/  # 共通型定義
```

## セットアップ

```bash
bun install
```

### 環境変数

**CLI** (`packages/cli/.env`)

```env
GYO_API_URL=https://your-cloud-run-url
GYO_API_TOKEN=your-token
```

**Server** (`packages/server/.env`)

```env
DATABASE_URL=postgresql://...   # Neon
ANTHROPIC_API_KEY=...
GOTIFY_URL=https://...
GOTIFY_TOKEN=...
```

## ビルド

```bash
bun run build:cli    # → dist/gyo (シングルバイナリ)
bun run build:server # → dist/server
```

## 命名規則

フィーチャー名は念能力の漢字1文字（行・発・硬・円・流 等）。
