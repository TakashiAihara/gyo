resource "google_cloud_run_service" "service" {
  name     = var.service_name
  location = var.gcp_region

  template {
    spec {
      service_account_name = var.service_account_email

      containers {
        image = var.image_url

        ports {
          container_port = var.container_port
        }

        dynamic "env" {
          for_each = var.environment_variables
          content {
            name  = env.key
            value = env.value
          }
        }

        resources {
          limits = {
            cpu    = var.cpu
            memory = var.memory
          }
        }
      }

      timeout_seconds = var.timeout_seconds
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = var.max_instances
        "autoscaling.knative.dev/minScale" = var.min_instances
      }
    }
  }

  metadata {
    annotations = {
      "run.googleapis.com/launch-stage" = "GA"
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

resource "google_cloud_run_service_iam_member" "public_access" {
  count    = var.allow_public_access ? 1 : 0
  service  = google_cloud_run_service.service.name
  location = google_cloud_run_service.service.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
