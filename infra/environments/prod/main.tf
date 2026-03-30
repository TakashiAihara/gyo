terraform {
  required_version = ">= 1.9"

  backend "gcs" {
    bucket = "gyo-tofu-state"
    prefix = "prod"
  }

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
    neon = {
      source  = "kislerdm/neon"
      version = "~> 0.6"
    }
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

provider "neon" {
  api_key = var.neon_api_key
}
