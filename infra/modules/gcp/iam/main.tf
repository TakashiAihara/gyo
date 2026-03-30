data "google_client_config" "current" {}

resource "google_service_account" "cloudrun" {
  account_id   = var.service_account_name
  display_name = var.service_account_display_name != "" ? var.service_account_display_name : "Service account for ${var.service_account_name}"
}

# Workload Identity Pool
resource "google_iam_workload_identity_pool" "github" {
  workload_identity_pool_id = "github-pool"
  display_name              = "GitHub"
  description               = "Workload Identity Pool for GitHub Actions"
  disabled                  = false
}

# Workload Identity Pool Provider
resource "google_iam_workload_identity_pool_provider" "github" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-provider"
  display_name                       = "GitHub Provider"
  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.aud"        = "assertion.aud"
    "attribute.repository" = "assertion.repository"
  }

  attribute_condition = "assertion.repository == '${var.github_repo}'"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

# Service Account IAM binding for GitHub Actions
resource "google_service_account_iam_member" "github_actions_sa" {
  service_account_id = google_service_account.cloudrun.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/${var.github_repo}"
}

# Artifact Registry writer role
resource "google_project_iam_member" "artifactregistry" {
  project = var.gcp_project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.cloudrun.email}"
}

# Cloud Run admin role (deploy, update, delete services)
resource "google_project_iam_member" "cloudrun_admin" {
  project = var.gcp_project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${google_service_account.cloudrun.email}"
}

# Allow SA to act as itself for Cloud Run service identity
resource "google_service_account_iam_member" "cloudrun_sa_user" {
  service_account_id = google_service_account.cloudrun.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.cloudrun.email}"
}
