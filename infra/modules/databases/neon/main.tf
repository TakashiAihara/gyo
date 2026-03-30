resource "neon_project" "project" {
  name                       = var.project_name
  history_retention_seconds  = 21600  # 6 hours (Neon free plan limit)
}

resource "neon_role" "app_role" {
  project_id = neon_project.project.id
  branch_id  = neon_project.project.default_branch_id
  name       = var.role_name
}

resource "neon_database" "database" {
  project_id = neon_project.project.id
  branch_id  = neon_project.project.default_branch_id
  name       = var.database_name
  owner_name = neon_role.app_role.name
}

locals {
  neon_endpoint = "ep-${substr(neon_project.project.id, 0, 7)}.${var.neon_region}.neon.tech"
  neon_host     = local.neon_endpoint
  database_url  = "postgresql://${neon_role.app_role.name}:${neon_role.app_role.password}@${local.neon_endpoint}:5432/${neon_database.database.name}?sslmode=require"
}
