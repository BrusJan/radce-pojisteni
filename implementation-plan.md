# Implementation Plan

## Delivery Model
- Work in gated iterations.
- Every iteration ends with deployment and manual validation on live URLs.
- No new iteration starts before validation sign-off.

## Step 1 - Deployable Skeleton (Frontend + Backend + DB)

### Goal
Build a minimal end-to-end baseline that can be deployed with one command and manually validated.

### Scope
- Frontend (Angular + Tailwind-ready structure)
  - One page showing service status.
  - Poll backend `GET /health` every 10 seconds.
  - Czech UI labels for end-user status.
- Backend (Spring Boot)
  - `GET /health` endpoint.
  - Includes API status, PostgreSQL status, and pgvector status.
- Database
  - PostgreSQL + pgvector via Docker Compose.
- Deployment
  - Single root command: `npm run deploy`.
  - Deploy frontend to Cloudflare Pages.
  - Deploy backend+db stack to personal Ubuntu VPS.
- Documentation
  - Cloudflare + VPS setup guide.
  - Manual test checklist.

### Deliverables
- Minimal Angular app for health polling.
- Spring Boot app with detailed health response.
- `docker-compose.yml` for backend and PostgreSQL/pgvector.
- Unified deploy scripts with placeholders for credentials/config.
- Deployment tutorial and validation checklist.

### Manual Validation Gate (Step 1)
- Frontend URL loads.
- Health polling updates every 10 seconds.
- Health response reports API, PostgreSQL, and pgvector.
- Simulated backend outage becomes visible in UI.
- Simulated DB outage becomes visible in UI.
- `npm run deploy` updates both FE and BE targets.

## Step 2 - Reliability and Error Handling

### Goal
Improve observability and resilience before feature growth.

### Scope
- Consistent backend error envelope.
- Frontend network error UX and retry strategy.
- Service status bar for API/DB/LLM/TTS states.
- Basic system log panel (internal use).

### Validation Gate
- User sees clear status and actionable error messages for FE/BE/DB connection issues.

## Step 3 - CRM Foundation
- Data model for salespeople, clients, notes, contracts, interactions.
- AuthN/AuthZ with role separation (salesperson vs customer).

## Step 4 - Document Ingestion and RAG Core
- Manual ZIP import.
- Extraction/chunking/embedding.
- Metadata filters by client, document type, contract status.

## Step 5 - Customer AI Chat and Contract Draft Flow
- Czech customer chat and optional TTS.
- Guided contract draft creation.
- Handoff to salesperson for validation/signing/meeting.

## Step 6 - Guardrails, Audit, and Traceability
- Prompt policies per role.
- Source-grounded responses.
- Full conversation/action audit trail.

## Working Agreement
- Every iteration includes deploy + your manual validation.
- Any failed checklist item blocks moving forward.
- Placeholders are acceptable in config until infrastructure credentials are provided.
