variable "gcp_project_id" {
  description = "GCP project ID"
  type        = string
}

variable "apis" {
  description = "List of APIs to enable"
  type        = list(string)
  default = [
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "iam.googleapis.com",
    "sts.googleapis.com",
    "cloudresourcemanager.googleapis.com"
  ]
}
