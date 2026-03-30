output "repository_url" {
  description = "Artifact Registry repository URL"
  value       = "${google_artifact_registry_repository.repository.location}-docker.pkg.dev/${var.gcp_project_id}/${google_artifact_registry_repository.repository.repository_id}"
}

output "repository_id" {
  description = "Repository ID"
  value       = google_artifact_registry_repository.repository.repository_id
}

output "repository_name" {
  description = "Repository name URI"
  value       = google_artifact_registry_repository.repository.name
}
