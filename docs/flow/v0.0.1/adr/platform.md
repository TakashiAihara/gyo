# ADR: Platform Selection (v0.0.1)

## Status

Accepted

## Context

gyo サーバーのホスティング先として Cloud Run と AWS Lambda を検討した。
ランタイムは Bun、DB は Neon (serverless PostgreSQL)。

## Decision

**Cloud Run** を採用する。

## Comparison

| 項目 | Cloud Run | AWS Lambda |
|---|---|---|
| Bun ネイティブ対応 | ◎ コンテナとして動かすだけ | △ カスタムランタイム or Lambda Layer が必要 |
| セットアップコスト | ◎ Dockerfile 1枚、gcloud コマンド1本 | △ zip/Layer 管理、IAM ロール設計が煩雑 |
| コールドスタート | min-instances=0 で scale-to-zero、min=1 で常時起動 | デフォルトで発生。Provisioned Concurrency は有料 |
| 無料枠 | 2M req/月、360K GB-seconds/月 | 1M req/月、400K GB-seconds/月 |
| ログ / オブザーバビリティ | Cloud Logging に自動集約 | CloudWatch（設定が必要） |
| デプロイ方式 | コンテナイメージ push → Cloud Run update | zip upload または ECR + 関数更新 |
| 常駐プロセスの可否 | ◎ min=1 で WebSocket・scheduler が動く | ✗ リクエスト単位で起動するため常駐不可 |

## Consequences

- Dockerfile と Cloud Run への deploy ワークフローが必要になる
