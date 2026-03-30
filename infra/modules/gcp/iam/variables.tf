variable "gcp_project_id" {
  description = "GCP project ID"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository (owner/repo)"
  type        = string
}

variable "service_account_name" {
  description = "Service account name"
  type        = string
}

variable "service_account_display_name" {
  description = "Service account display name"
  type        = string
  default     = ""
}
