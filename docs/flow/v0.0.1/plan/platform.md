# Platform Setup Plan (v0.0.1)

## Goal

gyo server を Cloud Run + Neon にデプロイし、CLI から使える状態にする。

## Prerequisites

- GCP アカウント（課金有効）
- Neon アカウント
- GitHub リポジトリ（済）

## Steps

### Phase 1: Bootstrap（CLI / 手動）

OpenTofu が動く前に必要な最低限のリソースを CLI で作る。

| # | 作業 | コマンド | 担当 |
|---|---|---|---|
| 1 | GCP プロジェクト作成 | `gcloud projects create gyo-prod` | ユーザー |
| 2 | 課金アカウント紐付け | `gcloud billing accounts list` → `gcloud billing projects link gyo-prod --billing-account=XXXXXX` | ユーザー |
| 3 | GCP 認証 | `gcloud auth login && gcloud config set project gyo-prod` | ユーザー |
| 4 | State 用 GCS バケット作成 | `gcloud storage buckets create gs://gyo-tofu-state --location=asia-northeast1` | ユーザー |
| 5 | Neon 認証 | `neonctl auth` | ユーザー |
| 6 | Neon API キー取得 | Neon Console → Account Settings → API Keys | ユーザー |

### Phase 2: OpenTofu（自動）

`infra/` に配置し、上記の bootstrap 完了後に `tofu apply` で構築する。

| # | リソース | プロバイダ | ステータス |
|---|---|---|---|
| 1 | GCP APIs 有効化（Cloud Run, Artifact Registry, IAM）| google | ✅ |
| 2 | Artifact Registry リポジトリ | google | ✅ |
| 3 | Cloud Run サービス | google | ✅ |
| 4 | サービスアカウント（Cloud Run 用）| google | ✅ |
| 5 | Workload Identity Federation（GitHub Actions → GCP）| google | ✅ |
| 6 | IAM バインディング | google | ✅ |
| 7 | Neon プロジェクト | neon | ✅ |
| 8 | Neon データベース + ロール | neon | ✅ |

**完成ファイル:**
- `infra/main.tf` ✅
- `infra/variables.tf` ✅
- `infra/gcp.tf` ✅
- `infra/neon.tf` ✅
- `infra/outputs.tf` ✅
- `infra/terraform.tfvars.example` ✅

### Phase 3: Deploy 確認

| # | 作業 | 担当 |
|---|---|---|
| 1 | `tofu apply` でインフラ構築 | Claude |
| 2 | DB マイグレーション（`bunx drizzle-kit migrate`）| Claude |
| 3 | GitHub Secrets / Variables 設定 | ユーザー |
| 4 | main に push → GitHub Actions deploy | ユーザー |
| 5 | CLI から動作確認（`gyo add "テスト"`）| ユーザー |

## Directory Structure

```
infra/
  main.tf          # プロバイダ設定、backend
  gcp.tf           # Artifact Registry, Cloud Run, IAM, WIF
  neon.tf          # Neon プロジェクト、DB
  variables.tf     # 変数定義
  outputs.tf       # 接続文字列、サービス URL 等
  terraform.tfvars.example
```
