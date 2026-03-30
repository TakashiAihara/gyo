variable "gcp_project_id" {
  description = "GCP project ID"
  type        = string
}

variable "gcp_region" {
  description = "GCP region"
  type        = string
  default     = "asia-northeast1"
}

variable "neon_api_key" {
  description = "Neon API key"
  type        = string
  sensitive   = true
}

variable "github_repo" {
  description = "GitHub repository (owner/repo)"
  type        = string
  default     = "TakashiAihara/gyo"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "gyo"
}

variable "container_image" {
  description = "Container image URL (will be set by CI/CD)"
  type        = string
  default     = ""
}

variable "container_port" {
  description = "Container port to expose"
  type        = number
  default     = 8080
}
