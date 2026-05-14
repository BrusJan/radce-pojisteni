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

## Step 3 - CRM Foundation ✅ COMPLETED

### Goal
Client registry with advisor-managed credentials and role-based access control.

### Scope
- **Clients as user accounts:** Clients table stores `username` and `password` (BCrypt-hashed) so clients can log in.
- **Advisor client management:** Advisor can create/edit clients, set username/password, and generate random credentials.
- **Role-based authZ:** Two roles — `ADVISOR` and `CLIENT`.
  - Advisors access `/clients/**`, `/files/**`, and the full dashboard.
  - Clients access only the client portal (empty placeholder for now).
  - JWT tokens carry role claim; Spring Security enforces role-based access.
- **Dual login:** Login page has a toggle to switch between "Poradce" (advisor) and "Klient" (client) login modes.
  - Advisor login: `POST /auth/login` (email + password).
  - Client login: `POST /auth/client-login` (username + password).
- **Client portal:** Empty placeholder page with header, logout, and "coming soon" message.
- **Password security:** Passwords are BCrypt-hashed before storage. Password hashes are never exposed to the frontend (replaced with `__SET__` sentinel).

### DB Changes
- Added `username VARCHAR(255)` and `password VARCHAR(255)` columns to `clients` table.

### Backend Changes
- `JwtService`: Separate `generateAdvisor()` and `generateClient()` methods with role claim.
- `JwtAuthFilter`: Extracts role from JWT, sets `ROLE_ADVISOR` or `ROLE_CLIENT` authority.
- `SecurityConfig`: `/clients/**` and `/files/**` require `ROLE_ADVISOR`; other authenticated routes accept any role.
- `AuthService`: `loginAdvisor()` (by email) and `loginClient()` (by username).
- `AuthController`: `/auth/login` and `/auth/client-login` endpoints.
- `ClientController`: Passwords are hashed on create/update; list/get return `__SET__` instead of real hash.
- `ClientRepository`: `findByUsername()` for client login; `update()` preserves existing password when `__SET__` sentinel is received.
- `Client` record: Added `username` and `password` fields.
- `ClientRequest` record: Added `username` and `password` fields.

### Frontend Changes
- `LoginComponent`: Mode toggle (advisor/client), dynamic label/placeholder, calls appropriate endpoint.
- `ClientDashboardComponent`: New empty portal page with header and logout.
- `ClientsComponent`: Added credentials section with username/password fields and "Generovat" button.
- `AuthStoreService`: Added `isAdvisor()` and `isClient()` helpers.
- `auth.guard.ts`: Added `advisorGuard` and `clientGuard` route guards.
- `main.ts`: New `/client` route with `clientGuard`; dashboard uses `advisorGuard`.
- `api.model.ts`: `AuthResponse` has `role` field; `Client` and `ClientRequest` have `username`/`password`.

### Validation Gate
- Advisor can log in, create clients with credentials, see client list.
- Client can log in with username/password, sees empty portal.
- Client cannot access `/clients` or `/files` endpoints (403).
- Advisor cannot access client portal route (redirected to dashboard).
- Password hashes are never exposed in API responses.

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
