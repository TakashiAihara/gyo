#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
ENV_NAME="prod"
REPO=""
DRY_RUN=false

VARS_FILE=""
SECRETS_FILE=""
TFVARS_FILE=""

usage() {
  cat <<'EOF'
Usage: scripts/set-vars.sh [options]

Sync GitHub Actions variables/secrets from local env files.

Options:
  --env ENV                Environment name (default: prod)
  --repo OWNER/REPO        Target repository (default: current gh repo)
  --vars-file PATH         Variables source file (default: .env.<env>)
  --secrets-file PATH      Secrets source file (default: .env.<env>.secrets)
  --tfvars-file PATH       tfvars source file (default: infra/environments/<env>/terraform.tfvars)
  --dry-run                Print actions without updating GitHub
  -h, --help               Show help

Examples:
  scripts/set-vars.sh --env prod --dry-run
  scripts/set-vars.sh --env dev
  scripts/set-vars.sh --env staging --repo TakashiAihara/gyo
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env)
      ENV_NAME="$2"
      shift 2
      ;;
    --repo)
      REPO="$2"
      shift 2
      ;;
    --vars-file)
      VARS_FILE="$2"
      shift 2
      ;;
    --secrets-file)
      SECRETS_FILE="$2"
      shift 2
      ;;
    --tfvars-file)
      TFVARS_FILE="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$ENV_NAME" || ! "$ENV_NAME" =~ ^[A-Za-z0-9_-]+$ ]]; then
  echo "Invalid --env value: $ENV_NAME" >&2
  exit 1
fi

if [[ -z "$VARS_FILE" ]]; then
  VARS_FILE="${ROOT_DIR}/scripts/env.${ENV_NAME}"
fi
if [[ -z "$SECRETS_FILE" ]]; then
  SECRETS_FILE="${ROOT_DIR}/scripts/env.${ENV_NAME}.secrets"
fi
if [[ -z "$TFVARS_FILE" ]]; then
  TFVARS_FILE="${ROOT_DIR}/infra/environments/${ENV_NAME}/terraform.tfvars"
fi

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Required command not found: $1" >&2
    exit 1
  fi
}

require_cmd gh
require_cmd gcloud

declare -A VARS=()
declare -A SECRETS=()

trim() {
  local s="$1"
  s="${s#${s%%[![:space:]]*}}"
  s="${s%${s##*[![:space:]]}}"
  printf '%s' "$s"
}

unquote() {
  local s="$1"
  if [[ "$s" =~ ^\".*\"$ ]]; then
    s="${s:1:-1}"
  elif [[ "$s" =~ ^\'.*\'$ ]]; then
    s="${s:1:-1}"
  fi
  printf '%s' "$s"
}

load_env_file() {
  local file="$1"
  local target="$2"

  [[ -f "$file" ]] || return 0

  while IFS= read -r raw_line || [[ -n "$raw_line" ]]; do
    local line
    line="$(trim "$raw_line")"

    [[ -z "$line" ]] && continue
    [[ "$line" == \#* ]] && continue

    if [[ "$line" =~ ^export[[:space:]]+ ]]; then
      line="${line#export }"
      line="$(trim "$line")"
    fi

    if [[ ! "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
      continue
    fi

    local key="${line%%=*}"
    local value="${line#*=}"
    value="$(trim "$value")"
    value="$(unquote "$value")"

    if [[ "$target" == "vars" ]]; then
      VARS["$key"]="$value"
    else
      SECRETS["$key"]="$value"
    fi
  done < "$file"
}

read_tfvar() {
  local key="$1"
  local file="$2"
  [[ -f "$file" ]] || return 1

  local line
  line="$(grep -E "^[[:space:]]*${key}[[:space:]]*=" "$file" | tail -n 1 || true)"
  [[ -n "$line" ]] || return 1

  local value="${line#*=}"
  value="$(trim "$value")"
  value="${value%%#*}"
  value="$(trim "$value")"
  value="$(unquote "$value")"
  [[ -n "$value" ]] || return 1
  printf '%s' "$value"
}

set_var() {
  local key="$1"
  local value="$2"

  [[ -n "$value" ]] || return 0

  if [[ "$DRY_RUN" == true ]]; then
    echo "[dry-run] gh variable set $key"
    return 0
  fi

  if [[ -n "$REPO" ]]; then
    gh variable set "$key" --body "$value" --repo "$REPO"
  else
    gh variable set "$key" --body "$value"
  fi
}

set_secret() {
  local key="$1"
  local value="$2"

  [[ -n "$value" ]] || return 0

  if [[ "$DRY_RUN" == true ]]; then
    echo "[dry-run] gh secret set $key"
    return 0
  fi

  if [[ -n "$REPO" ]]; then
    gh secret set "$key" --body "$value" --repo "$REPO"
  else
    gh secret set "$key" --body "$value"
  fi
}

load_env_file "$VARS_FILE" vars
load_env_file "$SECRETS_FILE" secrets

# Fill required deploy variables from tfvars if missing.
if [[ -z "${VARS[GCP_PROJECT_ID]:-}" ]]; then
  VARS[GCP_PROJECT_ID]="$(read_tfvar gcp_project_id "$TFVARS_FILE" || true)"
fi

if [[ -z "${VARS[GCP_REGION]:-}" ]]; then
  VARS[GCP_REGION]="$(read_tfvar gcp_region "$TFVARS_FILE" || true)"
fi

if [[ -z "${VARS[CLOUD_RUN_SERVICE_NAME]:-}" ]]; then
  app_name="$(read_tfvar app_name "$TFVARS_FILE" || true)"
  if [[ -n "$app_name" ]]; then
    VARS[CLOUD_RUN_SERVICE_NAME]="${app_name}-server"
  fi
fi

if [[ -z "${VARS[ARTIFACT_REGISTRY_URL]:-}" ]]; then
  if [[ -n "${VARS[GCP_REGION]:-}" && -n "${VARS[GCP_PROJECT_ID]:-}" && -n "${VARS[CLOUD_RUN_SERVICE_NAME]:-}" ]]; then
    VARS[ARTIFACT_REGISTRY_URL]="${VARS[GCP_REGION]}-docker.pkg.dev/${VARS[GCP_PROJECT_ID]}/${VARS[CLOUD_RUN_SERVICE_NAME]}"
  fi
fi

if [[ -z "${VARS[SERVICE_ACCOUNT_EMAIL]:-}" ]]; then
  app_name="$(read_tfvar app_name "$TFVARS_FILE" || true)"
  if [[ -n "$app_name" && -n "${VARS[GCP_PROJECT_ID]:-}" ]]; then
    VARS[SERVICE_ACCOUNT_EMAIL]="${app_name}-cloudrun@${VARS[GCP_PROJECT_ID]}.iam.gserviceaccount.com"
  fi
fi

if [[ -z "${VARS[WORKLOAD_IDENTITY_PROVIDER]:-}" && -n "${VARS[GCP_PROJECT_ID]:-}" ]]; then
  project_number="$(gcloud projects describe "${VARS[GCP_PROJECT_ID]}" --format='value(projectNumber)' 2>/dev/null || true)"
  if [[ -n "$project_number" ]]; then
    VARS[WORKLOAD_IDENTITY_PROVIDER]="projects/${project_number}/locations/global/workloadIdentityPools/github-pool/providers/github-provider"
  fi
fi

# Promote secret-looking keys from vars -> secrets when accidentally placed in vars file.
for k in "${!VARS[@]}"; do
  case "$k" in
    *PASSWORD*|*SECRET*|*TOKEN*|*API_KEY*|DATABASE_URL)
      SECRETS["$k"]="${VARS[$k]}"
      unset 'VARS[$k]'
      ;;
  esac
done

# Auto-fetch DATABASE_URL via neonctl if not already set.
if [[ -z "${SECRETS[DATABASE_URL]:-}" ]]; then
  if command -v neonctl >/dev/null 2>&1; then
    _neon_api_key="$(read_tfvar neon_api_key "$TFVARS_FILE" || true)"
    _app_name="$(read_tfvar app_name "$TFVARS_FILE" || true)"
    if [[ -n "$_neon_api_key" && -n "$_app_name" ]]; then
      _neon_project_name="${_app_name}-${ENV_NAME}"
      echo "Fetching DATABASE_URL via neonctl (project: ${_neon_project_name})..."
      _neon_project_id="$(neonctl projects list --api-key "$_neon_api_key" -o json 2>/dev/null \
        | NEON_PROJECT_NAME="$_neon_project_name" python3 -c "import sys,json,os; ps=json.load(sys.stdin).get('projects',[]); print(next((p['id'] for p in ps if p.get('name')==os.environ.get('NEON_PROJECT_NAME','')), ''))" \
        2>/dev/null || true)"
      if [[ -n "$_neon_project_id" ]]; then
        _db_url="$(neonctl connection-string \
          --project-id "$_neon_project_id" \
          --role-name "${_app_name}_app" \
          --database-name "${_app_name}_db" \
          --pooled \
          --api-key "$_neon_api_key" \
          -o json 2>/dev/null || true)"
        if [[ -n "$_db_url" ]]; then
          SECRETS[DATABASE_URL]="$_db_url"
          echo "  (auto-fetched DATABASE_URL via neonctl)"
        else
          echo "Warning: neonctl connection-string returned empty" >&2
        fi
      else
        echo "Warning: neon project '${_neon_project_name}' not found" >&2
      fi
    fi
  else
    echo "Warning: neonctl not found, DATABASE_URL will not be set" >&2
  fi
fi

echo "Environment: ${ENV_NAME}"
echo "Sync target: ${REPO:-current gh repo}"
echo "Vars file: ${VARS_FILE}"
echo "Secrets file: ${SECRETS_FILE}"
echo "TFVars file: ${TFVARS_FILE}"

required_vars=(
  GCP_PROJECT_ID
  GCP_REGION
  CLOUD_RUN_SERVICE_NAME
  ARTIFACT_REGISTRY_URL
  WORKLOAD_IDENTITY_PROVIDER
  SERVICE_ACCOUNT_EMAIL
)

for req in "${required_vars[@]}"; do
  if [[ -z "${VARS[$req]:-}" ]]; then
    echo "Missing required GitHub variable: $req" >&2
    echo "Set it in ${VARS_FILE} or ${TFVARS_FILE}." >&2
    exit 1
  fi
done

printf '\nApplying GitHub Variables...\n'
for key in "${!VARS[@]}"; do
  set_var "$key" "${VARS[$key]}"
  echo "  - set var: $key"
done

printf '\nApplying GitHub Secrets...\n'
for key in "${!SECRETS[@]}"; do
  set_secret "$key" "${SECRETS[$key]}"
  echo "  - set secret: $key"
done

printf '\nDone.\n'
