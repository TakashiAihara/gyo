# ADR: Database Selection (v0.0.1)

## Status

Accepted

## Context

gyo サーバーのデータストアとして PostgreSQL 互換のマネージドサービスを検討した。
ORM は Drizzle、接続方式は HTTP ドライバ（コネクションプール不要）を想定。

## Decision

**Neon** を採用する。

## Comparison

| 項目 | Neon | Supabase | PlanetScale |
|---|---|---|---|
| PostgreSQL 互換 | ◎ PostgreSQL そのもの | ◎ PostgreSQL そのもの | △ MySQL 互換（PostgreSQL ではない）|
| サーバーレス HTTP ドライバ | ◎ `@neondatabase/serverless` 公式提供 | △ 標準 pg ドライバ、HTTP ドライバなし | △ HTTP ドライバあるが MySQL |
| Drizzle との相性 | ◎ `drizzle-orm/neon-http` で公式対応 | ○ 対応しているが接続方式が異なる | △ MySQL として扱う必要あり |
| 無料枠 | 0.5 GB、コンピュート 191 時間/月 | 500 MB、2プロジェクト | 5 GB（行数制限あり）|
| ブランチ機能 | ◎ DB ブランチでテスト環境分離が容易 | △ なし（スキーマ単位の分離のみ）| △ なし |
| スケールゼロ | ◎ アイドル時に自動停止 | ○ 無料枠は7日で一時停止 | ○ 対応 |

## Consequences

- `@neondatabase/serverless` と `drizzle-orm/neon-http` を使用する
- ブランチ機能を活用してテスト・本番 DB を分離できる
