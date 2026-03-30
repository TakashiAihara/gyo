output "artifact_registry_url" {
  description = "Artifact Registry URL"
  value       = module.artifact_registry.repository_url
}

output "cloud_run_service_url" {
  description = "Cloud Run service URL"
  value       = module.cloud_run.service_url
}

output "cloud_run_service_name" {
  description = "Cloud Run service name"
  value       = module.cloud_run.service_name
}

output "database_host" {
  description = "Database host"
  value       = module.neon_database.database_host
}

output "github_actions_env_vars" {
  description = "Environment variables for GitHub Actions"
  value = merge(
    module.gcp_iam.github_actions_env_vars,
    {
      ARTIFACT_REGISTRY_URL  = module.artifact_registry.repository_url
      CLOUD_RUN_SERVICE_NAME = module.cloud_run.service_name
    }
  )
}

output "github_actions_sa_email" {
  description = "Service account email for GitHub Actions"
  value       = module.gcp_iam.cloudrun_sa_email
}
