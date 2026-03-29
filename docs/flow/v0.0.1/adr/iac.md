# ADR: IaC Tool Selection (v0.0.1)

## Status

Accepted

## Context

Cloud Run、Artifact Registry、Neon、Workload Identity Federation など
複数のインフラリソースを管理する必要がある。手動構築ではなく IaC で管理したい。

## Comparison

| 項目 | OpenTofu | Pulumi | Terraform |
|---|---|---|---|
| 言語 | HCL（インフラ記述に特化した DSL）| TypeScript / Python / Go 等 | HCL（OpenTofu と同じ）|
| ライセンス | MPL 2.0（完全 OSS、Linux Foundation 傘下）| Apache 2.0（CLI/SDK は OSS）| BSL（商用利用に制約あり）|
| GCP プロバイダ | ◎ Terraform 互換でそのまま使える | ○ 対応しているが情報量が少ない | ◎ 最も広く使われている |
| Neon プロバイダ | ◎ Neon 公式 `terraform-provider-neon` を利用可 | △ コミュニティ製、成熟度が低い | ◎ 公式プロバイダ |
| エコシステム / 情報量 | ○ Terraform の既存資産（ドキュメント・記事・モジュール）をそのまま活用可 | △ 成長中だが情報量で劣る | ◎ 最大 |
| State 管理 | GCS / S3 | Pulumi Cloud（無料枠あり）/ GCS / S3 | GCS / Terraform Cloud |
| GitHub Actions 連携 | ◎ 公式 Action あり | ◎ 公式 Action あり | ◎ 公式 Action あり |

## Decision

**OpenTofu** を採用する。

- Neon 公式プロバイダが使えるため、DB のプロジェクト・ブランチ・ロールまで IaC で管理できる
- Terraform の豊富なドキュメント・事例をそのまま参照できる
- 完全 OSS でライセンスの懸念がない
- Pulumi は TypeScript 統一の利点があるが、Neon プロバイダの成熟度を優先した

## Consequences

- HCL の学習が必要になるが、インフラ記述量は少ないため影響は小さい
- State は GCS バケットで管理する
- `infra/` ディレクトリに OpenTofu の設定を配置する
