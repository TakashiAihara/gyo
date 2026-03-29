# Components (v0.0.1)

## CLI (`packages/cli`)

- Bun でシングルバイナリにコンパイル (`bun build --compile`)
- Commander.js でサブコマンド管理
- `hc<AppType>` (Hono Client) でサーバーと型安全に通信
- 設定は `~/.config/gyo/config.json` に保存

## Server (`packages/server`)

- Hono フレームワーク、Cloud Run 上で動作
- Drizzle ORM + `@neondatabase/serverless` (HTTP ドライバ)
- `AppType` を export して CLI 側で型推論に利用

## Shared (`packages/shared`)

- CLI / Server 共通の型定義のみ

## Monorepo Structure

```
packages/
  cli/      # gyo CLI
  server/   # Cloud Run API
  shared/   # 共通型定義
docs/
  flow/v0.0.1/
    adr/    # 意思決定記録
    design/ # 設計ドキュメント
```
