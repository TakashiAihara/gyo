variable "neon_api_key" {
  description = "Neon API key"
  type        = string
  sensitive   = true
}

variable "project_name" {
  description = "Neon project name"
  type        = string
}

variable "neon_region" {
  description = "Neon region"
  type        = string
  default     = "ap-southeast-1"
}

variable "database_name" {
  description = "Database name"
  type        = string
  default     = "postgres"
}

variable "role_name" {
  description = "Database role name"
  type        = string
}
