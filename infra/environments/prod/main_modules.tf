# ================================================================
# GCP APIs
# ================================================================

module "gcp_apis" {
  source = "../../modules/gcp/apis"

  gcp_project_id = var.gcp_project_id
}

# ================================================================
# IAM & Workload Identity
# ================================================================

module "gcp_iam" {
  source = "../../modules/gcp/iam"

  gcp_project_id               = var.gcp_project_id
  github_repo                  = var.github_repo
  service_account_name         = "${var.app_name}-cloudrun"
  service_account_display_name = "Service account for ${var.app_name} Cloud Run (${var.environment})"

  depends_on = [module.gcp_apis]
}

# ================================================================
# Artifact Registry
# ================================================================

module "artifact_registry" {
  source = "../../modules/gcp/registry"

  gcp_project_id         = var.gcp_project_id
  gcp_region             = var.gcp_region
  repository_id          = "${var.app_name}-server"
  repository_description = "Docker images for ${var.app_name} server (${var.environment})"

  depends_on = [module.gcp_apis]
}

# ================================================================
# Neon Database
# ================================================================

module "neon_database" {
  source = "../../modules/databases/neon"

  neon_api_key  = var.neon_api_key
  project_name  = "${var.app_name}-${var.environment}"
  neon_region   = "ap-southeast-1"
  database_name = "${var.app_name}_db"
  role_name     = "${var.app_name}_app"
}

# ================================================================
# Cloud Run
# ================================================================

module "cloud_run" {
  source = "../../modules/gcp/compute"

  gcp_project_id        = var.gcp_project_id
  gcp_region            = var.gcp_region
  service_name          = "${var.app_name}-server"
  image_url             = var.container_image != "" ? var.container_image : "${var.gcp_region}-docker.pkg.dev/${var.gcp_project_id}/${module.artifact_registry.repository_id}/${var.app_name}-server:latest"
  service_account_email = module.gcp_iam.cloudrun_sa_email
  environment_variables = {
    NODE_ENV     = "production"
    DATABASE_URL = module.neon_database.database_url
  }
  cpu                 = "1"
  memory              = "512Mi"
  timeout_seconds     = 300
  container_port      = var.container_port
  min_instances       = 1
  max_instances       = 10
  allow_public_access = true

  depends_on = [
    module.artifact_registry,
    module.neon_database
  ]
}
