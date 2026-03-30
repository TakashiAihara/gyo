variable "gcp_project_id" {
  description = "GCP project ID"
  type        = string
}

variable "gcp_region" {
  description = "GCP region"
  type        = string
}

variable "repository_id" {
  description = "Repository ID"
  type        = string
}

variable "repository_description" {
  description = "Repository description"
  type        = string
  default     = ""
}

variable "cleanup_policy_enabled" {
  description = "Enable image cleanup policies"
  type        = bool
  default     = true
}

variable "keep_tagged_versions" {
  description = "Number of tagged image versions to keep"
  type        = number
  default     = 1
}

variable "keep_untagged_days" {
  description = "Days to keep untagged images"
  type        = number
  default     = 7
}

variable "keep_tagged_days" {
  description = "Days to keep tagged images"
  type        = number
  default     = 365
}
