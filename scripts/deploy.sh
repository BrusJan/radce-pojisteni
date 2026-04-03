#!/usr/bin/env bash
# deploy.sh — Full VPS deployment: frontend build + backend docker compose + DB migration
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
FRONTEND_DIR="${ROOT_DIR}/frontend"

echo "=== Insurance Advisor — VPS Deploy ==="
echo "Root: ${ROOT_DIR}"
echo "Started: $(date)"
echo ""

# Load env
if [[ -f "${ROOT_DIR}/.env" ]]; then
  set -a
  source "${ROOT_DIR}/.env"
  set +a
fi

FRONTEND_API_BASE_URL="${FRONTEND_API_BASE_URL:-/api}"
POSTGRES_USER="${POSTGRES_USER:-insurance_app}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-insurance_password}"
POSTGRES_DB="${POSTGRES_DB:-insurance_advisor}"

# --- BACKEND CONTAINERS ---
echo "[1/4] Starting backend containers..."
cd "${ROOT_DIR}"
docker compose up -d --build
echo "      Waiting for DB to be ready..."
for i in $(seq 1 20); do
  if docker exec insurance-advisor-db pg_isready -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -q 2>/dev/null; then
    echo "      DB ready."
    break
  fi
  sleep 2
done

# --- DB MIGRATION ---
echo "[2/4] Running DB migrations..."
for sql_file in "${ROOT_DIR}"/backend/db/init/*.sql; do
  echo "      Applying $(basename "${sql_file}")..."
  docker exec -i insurance-advisor-db psql \
    -U "${POSTGRES_USER}" \
    -d "${POSTGRES_DB}" \
    < "${sql_file}"
done
echo "      Migrations done."

# --- FRONTEND ---
echo "[3/4] Building frontend..."
pushd "${FRONTEND_DIR}" >/dev/null

cat > src/environments/environment.prod.ts << EOF
export const environment = {
  production: true,
  apiBaseUrl: '${FRONTEND_API_BASE_URL}'
};
EOF

npm install --silent
ng build --configuration production
echo "      Frontend built → dist/insurance-advisor"
popd >/dev/null

# --- RELOAD NGINX ---
echo "[4/4] Reloading nginx..."
systemctl reload nginx
echo "      nginx reloaded"

echo ""
echo "=== Deploy complete at $(date) ==="
PUBLIC_IP=$(hostname -I | awk '{print $1}')
echo "    App:  http://${PUBLIC_IP}/"
echo "    API:  http://${PUBLIC_IP}/api/health"
