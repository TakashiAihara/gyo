output "project_id" {
  description = "Neon project ID"
  value       = neon_project.project.id
  sensitive   = false
}

output "database_name" {
  description = "Database name"
  value       = neon_database.database.name
}

output "role_name" {
  description = "Database role name"
  value       = neon_role.app_role.name
}

output "database_url" {
  description = "Database connection URL"
  value       = local.database_url
  sensitive   = true
}

output "database_host" {
  description = "Database host"
  value       = local.neon_host
}

output "project_name" {
  description = "Project name"
  value       = neon_project.project.name
}
