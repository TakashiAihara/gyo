output "service_url" {
  description = "Cloud Run service URL"
  value       = google_cloud_run_service.service.status[0].url
}

output "service_name" {
  description = "Cloud Run service name"
  value       = google_cloud_run_service.service.name
}

output "service_location" {
  description = "Cloud Run service location"
  value       = google_cloud_run_service.service.location
}
