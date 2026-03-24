#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

if [[ -f "${ROOT_DIR}/.env" ]]; then
  set -a
  source "${ROOT_DIR}/.env"
  set +a
fi

required_vars=(
  VPS_HOST
  VPS_USER
  VPS_SSH_PORT
  VPS_DEPLOY_PATH
  BACKEND_PORT
  APP_CORS_ALLOWED_ORIGINS
  POSTGRES_DB
  POSTGRES_USER
  POSTGRES_PASSWORD
  POSTGRES_PORT
)

for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    echo "Missing required variable: ${var_name}"
    exit 1
  fi
done

TEMP_ENV_FILE="${ROOT_DIR}/.deploy.backend.env"
trap 'rm -f "${TEMP_ENV_FILE}"' EXIT
cat > "${TEMP_ENV_FILE}" <<EOF
BACKEND_PORT=${BACKEND_PORT}
APP_CORS_ALLOWED_ORIGINS=${APP_CORS_ALLOWED_ORIGINS}
POSTGRES_DB=${POSTGRES_DB}
POSTGRES_USER=${POSTGRES_USER}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_PORT=${POSTGRES_PORT}
EOF

ssh -p "${VPS_SSH_PORT}" "${VPS_USER}@${VPS_HOST}" "mkdir -p '${VPS_DEPLOY_PATH}'"
scp -P "${VPS_SSH_PORT}" "${TEMP_ENV_FILE}" "${VPS_USER}@${VPS_HOST}:${VPS_DEPLOY_PATH}/.env"

tar -czf - -C "${ROOT_DIR}" backend docker-compose.yml | \
  ssh -p "${VPS_SSH_PORT}" "${VPS_USER}@${VPS_HOST}" "tar -xzf - -C '${VPS_DEPLOY_PATH}'"

ssh -p "${VPS_SSH_PORT}" "${VPS_USER}@${VPS_HOST}" "cd '${VPS_DEPLOY_PATH}' && docker compose up -d --build"

trap - EXIT
rm -f "${TEMP_ENV_FILE}"

echo "Backend deployment done"
