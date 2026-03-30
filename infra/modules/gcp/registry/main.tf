resource "google_artifact_registry_repository" "repository" {
  location      = var.gcp_region
  repository_id = var.repository_id
  description   = var.repository_description
  format        = "DOCKER"

  dynamic "cleanup_policies" {
    for_each = var.cleanup_policy_enabled ? [1] : []
    content {
      id     = "delete-untagged-old-images"
      action = "DELETE"
      condition {
        tag_state  = "UNTAGGED"
        older_than = "${var.keep_untagged_days}d"
      }
    }
  }

  dynamic "cleanup_policies" {
    for_each = var.cleanup_policy_enabled ? [1] : []
    content {
      id     = "keep-recent-tagged-images"
      action = "KEEP"
      most_recent_versions {
        keep_count = var.keep_tagged_versions
      }
    }
  }
}
