#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
FRONTEND_DIR="${ROOT_DIR}/frontend"

if [[ -f "${ROOT_DIR}/.env" ]]; then
  set -a
  source "${ROOT_DIR}/.env"
  set +a
fi

required_vars=(
  CLOUDFLARE_ACCOUNT_ID
  CLOUDFLARE_API_TOKEN
  CLOUDFLARE_PAGES_PROJECT
  FRONTEND_API_BASE_URL
)

for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    echo "Missing required variable: ${var_name}"
    exit 1
  fi
done

pushd "${FRONTEND_DIR}" >/dev/null

cp src/environments/environment.prod.ts src/environments/environment.prod.generated.ts
trap 'mv src/environments/environment.prod.generated.ts src/environments/environment.prod.ts 2>/dev/null || true' EXIT
sed "s|__FRONTEND_API_BASE_URL__|${FRONTEND_API_BASE_URL}|g" src/environments/environment.prod.generated.ts > src/environments/environment.prod.ts

npm install
npm run build

npx wrangler pages deploy dist/insurance-advisor \
  --project-name "${CLOUDFLARE_PAGES_PROJECT}" \
  --branch main

mv src/environments/environment.prod.generated.ts src/environments/environment.prod.ts
trap - EXIT

popd >/dev/null

echo "Frontend deployment done"
