# Insurance Advisor POC

Step 1 baseline delivers:
- Angular frontend with Czech status UI polling backend `/health` every 10s
- Spring Boot backend with `/health` endpoint reporting API + PostgreSQL + pgvector
- Docker Compose stack for backend and PostgreSQL with pgvector
- Unified deployment command for Cloudflare Pages (frontend) and Ubuntu VPS (backend)

## Project Structure
- `implementation-plan.md` - phased development plan
- `frontend/` - Angular app skeleton
- `backend/` - Spring Boot app skeleton
- `docker-compose.yml` - backend + db stack for VPS
- `scripts/` - deploy scripts
- `docs/cloudflare-vps-setup.md` - setup tutorial
- `docs/step-1-manual-checklist.md` - validation checklist

## Step 1 Quick Start
1. Copy `.env.example` to `.env` and fill placeholders.
2. Ensure Cloudflare Pages project and VPS are prepared.
3. Run:

```bash
npm install
npm run deploy
```

## Deployment Commands
- `npm run deploy` - deploy frontend and backend together
- `npm run deploy:frontend` - deploy frontend only
- `npm run deploy:backend` - deploy backend only

## Placeholder Notice
This baseline intentionally uses placeholder values for secrets, account IDs, hostnames, and API endpoints. Fill `.env` before deployment.

## Next Steps
After deploying Step 1, run the manual validation checklist in `docs/step-1-manual-checklist.md`.