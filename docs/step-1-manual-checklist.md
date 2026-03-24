# Step 1 Manual Checklist

## A. Frontend availability
- Open Cloudflare Pages URL.
- Verify page renders and shows service status panel.

## B. Backend health polling
- Confirm status updates every ~10 seconds.
- Confirm last-updated timestamp changes.

## C. Health payload content
- Confirm API status is visible.
- Confirm PostgreSQL status is visible.
- Confirm pgvector status is visible.

## D. Failure simulation - backend
- Stop backend container on VPS.
- Confirm UI changes to disconnected/degraded state.
- Start backend container.
- Confirm auto-recovery.

## E. Failure simulation - database
- Stop db container on VPS.
- Confirm UI reports DB issue.
- Start db container.
- Confirm auto-recovery.

## F. Unified deploy
- Run `npm run deploy` from project root.
- Confirm FE deploy step completes.
- Confirm BE deploy step completes.

## G. Logs and diagnostics
- Confirm backend logs are reachable on VPS (`docker compose logs`).
- Confirm UI does not expose raw stack traces.
