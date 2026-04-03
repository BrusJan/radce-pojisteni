#!/usr/bin/env bash
# deploy.sh — Full VPS deployment: frontend build + nginx reload + backend docker compose
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

# --- FRONTEND ---
echo "[1/3] Building frontend..."

pushd "${FRONTEND_DIR}" >/dev/null

# Inject API base URL into production environment
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
echo "[2/3] Reloading nginx..."
systemctl reload nginx
echo "      nginx reloaded"

# --- BACKEND ---
echo "[3/3] Building & starting backend containers..."
cd "${ROOT_DIR}"
docker compose up -d --build
echo "      Backend containers up"

echo ""
echo "=== Deploy complete at $(date) ==="
echo "    Frontend: http://$(hostname -I | awk '{print $1}')/"
echo "    Backend:  http://127.0.0.1:${BACKEND_PORT:-8080}/health (internal)"
echo "    Via nginx: http://$(hostname -I | awk '{print $1}')/api/health"
