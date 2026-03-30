output "cloudrun_sa_email" {
  description = "Cloud Run service account email"
  value       = google_service_account.cloudrun.email
}

output "workload_identity_pool_resource_name" {
  description = "Workload Identity Pool resource name"
  value       = google_iam_workload_identity_pool.github.name
}

output "workload_identity_provider_resource_name" {
  description = "Workload Identity Provider resource name"
  value       = google_iam_workload_identity_pool_provider.github.name
}

output "github_actions_env_vars" {
  description = "Environment variables for GitHub Actions"
  value = {
    GCP_PROJECT_ID             = var.gcp_project_id
    WORKLOAD_IDENTITY_PROVIDER = google_iam_workload_identity_pool_provider.github.name
    SERVICE_ACCOUNT_EMAIL      = google_service_account.cloudrun.email
  }
}
