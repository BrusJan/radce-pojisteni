# Cloudflare + Ubuntu VPS Setup Guide (Step 1)

This guide explains the one-time setup needed before running `npm run deploy`.

## 1. Prerequisites
- Cloudflare account with Pages enabled.
- Ubuntu VPS with SSH access.
- Domain or subdomain for backend API (recommended).
- Local machine with Node.js, npm, Docker (for local checks), and SSH client.

## 2. Cloudflare Pages Setup
1. Create a Pages project in Cloudflare dashboard.
2. Note these values:
   - Account ID
   - Project name
3. Create an API token with permission to deploy Pages.
4. Store values in root `.env` using `.env.example` template:
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_PAGES_PROJECT`

## 3. Ubuntu VPS Setup
1. Install Docker and Docker Compose plugin.
2. Create deployment directory, for example `/opt/insurance-advisor`.
3. Ensure SSH user has permission to run Docker.
4. Configure firewall to allow ports 22, 80, 443 (and temporary 8080 if needed).
5. Optional but recommended: configure reverse proxy + TLS (Nginx or Caddy).

## 4. Configure VPS Deployment Variables
Set in root `.env`:
- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_PORT` (default 22)
- `VPS_DEPLOY_PATH` (example `/opt/insurance-advisor`)
- `BACKEND_PUBLIC_URL` (example `https://api.example.com`)

## 5. Backend Runtime Variables
Set in root `.env`:
- `BACKEND_PORT` (default `8080`)
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_PORT` (default `5432`)

The deploy script writes these values to VPS `.env` used by Docker Compose.

## 6. Frontend Runtime Variables
Set in root `.env`:
- `FRONTEND_API_BASE_URL` (must point to backend public URL)

## 7. First Deployment
From repository root:
1. Fill `.env` from `.env.example`.
2. Run `npm install`.
3. Run `npm run deploy`.

Expected:
- Frontend build + deploy to Cloudflare Pages.
- Backend package sync to VPS and `docker compose up -d --build`.

## 8. Validate
Run checklist in [docs/step-1-manual-checklist.md](docs/step-1-manual-checklist.md).

## 9. Troubleshooting
- SSH failure:
  - Check `VPS_HOST`, key, user permissions, and open port.
- Cloudflare failure:
  - Check account ID, token scope, and Pages project name.
- Backend unhealthy:
  - Check `docker compose logs backend` on VPS.
- DB/pgvector failure:
  - Check `docker compose logs db` and extension init output.
