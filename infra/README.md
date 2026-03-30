# Infrastructure as Code (IaC) - gyo

OpenTofu と Terraform を使用した Infrastructure as Code 管理。

## ディレクトリ構成

```
infra/
├── README.md                 # このファイル
├── main.tf                   # Provider 設定、backend
├── variables.tf              # グローバル変数
├── outputs.tf                # グローバル出力
├── terraform.tfvars.example  # 変数ファイルサンプル
│
├── modules/                             # Terraform modules
│   ├── gcp/
│   │   ├── compute/                     # Cloud Run サービス
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   │
│   │   ├── registry/                    # Artifact Registry
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   │
│   │   ├── iam/                         # IAM, Workload Identity
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   ├── outputs.tf
│   │   │   └── locals.tf
│   │   │
│   │   └── apis/                        # GCP API 有効化
│   │       ├── main.tf
│   │       └── variables.tf
│   │
│   └── databases/
│       ├── neon/                        # Neon PostgreSQL
│       │   ├── main.tf
│       │   ├── variables.tf
│       │   └── outputs.tf
│       │
│       └── migrations/                  # DB マイグレーション
│           ├── main.tf
│           └── variables.tf
│
├── environments/                        # 環境別設定
│   ├── prod/                            # 本番環境
│   │   ├── main.tf                      # module 呼び出し
│   │   ├── terraform.tfvars             # 本番環境変数
│   │   └── backend.tf                   # Backend 設定
│   │
│   ├── staging/                         # ステージング環境
│   │   ├── main.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   │
│   └── dev/                             # 開発環境
│       ├── main.tf
│       ├── terraform.tfvars
│       └── backend.tf
│
└── docs/                                # ドキュメント
    ├── module-architecture.md           # モジュール設計
    └── deployment-guide.md              # デプロイガイド
```

## モジュール設計

### module/gcp/apis/

GCP の必要な API サービスを有効化するモジュール。

**責務:**
- Cloud Run API
- Artifact Registry API
- IAM API
- STS API
- Resource Manager API

**入力:**
- `gcp_project_id` - GCP プロジェクト ID

**出力:**
- API 有効化の完了通知

---

### modules/gcp/registry/

Artifact Registry の設定・管理モジュール。

**責務:**
- Docker リポジトリの作成
- アクセス制御

**入力:**
- `gcp_project_id` - GCP プロジェクト ID
- `gcp_region` - リージョン
- `repository_name` - リポジトリ名
- `repository_description` - 説明

**出力:**
- `repository_url` - Artifact Registry の URL
- `repository_id` - リポジトリ ID

---

### modules/gcp/compute/

Cloud Run サービスの設定・管理モジュール。

**責務:**
- Cloud Run サービスのデプロイメント
- コンテナ仕様の管理
- スケーリング設定
- IAM 設定（パブリックアクセス）

**入力:**
- `gcp_project_id` - GCP プロジェクト ID
- `gcp_region` - リージョン
- `service_name` - サービス名
- `image_url` - コンテナイメージ URI
- `environment_variables` - 環境変数
- `service_account_email` - サービスアカウント
- `cpu` - CPU リソース
- `memory` - メモリリソース

**出力:**
- `service_url` - Cloud Run の URL
- `service_name` - サービス名

---

### modules/gcp/iam/

IAM、サービスアカウント、Workload Identity Federation の設定モジュール。

**責務:**
- Cloud Run 用サービスアカウント作成
- Workload Identity Pool / Provider 設定（GitHub Actions 連携）
- IAM ロールバインディング

**入力:**
- `gcp_project_id` - GCP プロジェクト ID
- `github_repo` - GitHub リポジトリ（owner/repo）
- `service_account_name` - サービスアカウント名

**出力:**
- `cloudrun_sa_email` - Cloud Run サービスアカウントのメール
- `workload_identity_pool_resource_name` - WIF プール名
- `workload_identity_provider_resource_name` - WIF プロバイダー名
- `github_actions_env_vars` - GitHub Actions 用こと環境変数

---

### modules/databases/neon/

Neon PostgreSQL データベースの設定・管理モジュール。

**責務:**
- Neon プロジェクト作成
- データベース作成
- ロール（ユーザー）作成
- 接続文字列の生成

**入力:**
- `neon_api_key` - Neon API キー
- `project_name` - プロジェクト名
- `neon_region` - リージョン
- `database_name` - データベース名
- `role_name` - ロール名

**出力:**
- `project_id` - Neon プロジェクト ID
- `database_name` - データベース名
- `database_url` - 接続文字列（DATABASE_URL）
- `database_host` - ホスト名

---

## 環境別設定戦略

### environments/prod/

本番環境用の設定。以下の特徴：
- 高スケーリング設定
- 本番用の State 管理
- Cloud Run インスタンス数: 3-10

### environments/staging/

ステージング環境用の設定。

### environments/dev/

開発環境用の設定。

---

## State 管理

各環境は GCS (Google Cloud Storage) に State を保存。

```hcl
# backend.tf の例
terraform {
  backend "gcs" {
    bucket = "gyo-tofu-state"
    prefix = "prod"  # 環境ごとに異なる prefix
  }
}
```

---

## 使用方法

### 初期準備

```bash
cd infra/environments/prod
cp ../../terraform.tfvars.example terraform.tfvars
# terraform.tfvars を編集して GCP Project ID などを設定
```

### Plan を確認

```bash
cd infra/environments/prod
tofu init
tofu plan
```

### Apply（インフラ構築）

```bash
cd infra/environments/prod
tofu apply
```

### 出力値の確認

```bash
tofu output
```

---

## ベストプラクティス

1. **モジュールの再利用性**
   - 環境ごとに異なるパラメータを変数として受け取る
   - ハードコード値は最小化

2. **State 分離**
   - 環境ごとに異なる State ファイル
   - バケットは共通、prefix で分離

3. **エラーハンドリング**
   - `depends_on` で依存関係を明示
   - 各モジュールで必要な API の有効化を担保

4. **出力値の管理**
   - 各モジュールは必要な出力値を用意
   - 親モジュール（environments）が合成・整理

5. **変数の命名規則**
   - `gcp_` で GCP リソース固有の設定
   - `neon_` で Neon 固有の設定
   - 環境名は `environment` 変数で指定

---

## GitHub Actions との連携

Workload Identity Federation を使用して、GitHub Actions から GCP へ認証。

**必要な GitHub Secrets:**
- なし（OIDC で自動認証）

**必要な GitHub Variables:**
- `GCP_PROJECT_ID`
- `GCP_REGION`
- `WORKLOAD_IDENTITY_PROVIDER`
- `SERVICE_ACCOUNT_EMAIL`

---

## トラブルシューティング

### API が有効化されていないエラー

```bash
# 手動で有効化
gcloud services enable run.googleapis.com \
  artifactregistry.googleapis.com \
  iam.googleapis.com \
  sts.googleapis.com
```

### Neon 接続エラー

```bash
# Neon CLI で接続確認
neonctl connection-string --project-id <PROJECT_ID>
```

---

## 参考資料

- [Terraform Google Provider](https://registry.terraform.io/providers/hashicorp/google)
- [Terraform Neon Provider](https://registry.terraform.io/providers/kislerdm/neon)
- [Google Cloud Run ドキュメント](https://cloud.google.com/run/docs)
- [Workload Identity Federation](https://cloud.google.com/iam-federation/docs)
