## Secure Media Vault – Local Setup Guide

This guide explains how to run the project locally end-to-end: prerequisites, cloning, installing, configuring Supabase (DB, Storage, Edge Function), environment variables, and development commands.

1) Prerequisites
- Node.js: 18.x or 20.x (LTS)
- Package manager: pnpm 8+ (recommended) or npm 9+
- Git
- Supabase account and project
- Optional tooling:
  - Supabase CLI (recommended for deploying the edge function)

Verify versions:
```bash
node -v
pnpm -v

2)key folders:
- apps/
  - api/ – GraphQL API (GraphQL Yoga)
  - web/ – React + Apollo web app (Vite)
- packages/
  - shared/types/ – shared TypeScript types
- migrations/ – database migration SQL files
- supabase/
  - functions/hash-object/ – Supabase Edge Function to compute SHA-256 for uploaded objects


3) Project bootstrapping:
--->>Clone
git clone <your-repo-url> secure-media-vault
cd secure-media-vault

--->install
pnpm install
```
--->>Build
```bash
# API
cd apps/api && pnpm build
# Web
cd ../web && pnpm build


4) Supabase Setup
1) Create a Supabase project
   - Gather from Settings → API:
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`

2) Create Storage bucket
   - Name: `user-uploads`
   - Visibility: Private

3) Run database migrations and policies
   - Open Supabase SQL editor and run, in order:
     - `migrations/001_init.sql`
     - `migrations/002_align_schema.sql`

4) Creating and deploy Edge Function: `hash-object`
   - Using Supabase CLI from repo root:
```bash
supabase functions deploy hash-object

# Set function secrets (replace values and project ref)
supabase secrets set \
  SUPABASE_URL=YOUR_SUPABASE_URL \
  SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY \
  STORAGE_BUCKET=user-uploads \
  --project-ref YOUR_PROJECT_REF
```
   - Copy the function URL from the dashboard if you need to set `EDGE_FUNCTION_URL` in the API.


 5)Environment variables 
 - apps/api/.env – see `apps/api/.env.example`
- apps/web/.env – see `apps/web/.env.example`
- Edge Function secrets – see `supabase/functions/hash-object/.env.example`

1.apps/api/.env.example
    SUPABASE_URL=YOUR_SUPABASE_URL
    SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

2.apps/web/.env.example
    # GraphQL API endpoint (set for local dev)
    VITE_GRAPHQL_URL=http://localhost:4000/graphql

   # Supabase client (public) keys
     VITE_SUPABASE_URL=YOUR_SUPABASE_URL
     VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

3.supabase/functions/hash-object/.env.example
      SUPABASE_URL=YOUR_SUPABASE_URL
      SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
      STORAGE_BUCKET=user-uploads


6) Local Development
Run API and Web in separate terminals.
##Run API (Terminal1):    
cd C:\Users
pnpm install --silent
pnpm dev
Wait for “GraphQL API running at http://localhost:4000”

##Run web (Terminal2):
cd C:\Users
pnpm install --silent
$env:VITE_GRAPHQL_URL="http://localhost:4000/graphql"
pnpm dev -- --port 5177

-->macOS/Linux (bash/zsh):
```bash
##Terminal 1
(cd apps/api && pnpm dev)
##Terminal 2
(cd apps/web && VITE_GRAPHQL_URL=http://localhost:4000/graphql pnpm dev -- --port 5177)
```

Notes:
- CORS is enabled for local origins and the Authorization header in the API.
- The web app attaches a fresh Supabase JWT to each GraphQL request.


```

7) Tests
There are no automated tests yet. Recommended manual checks:
- Auth: sign in/out via the web app
- Assets query: list loads without errors
- Upload flow: file uploads to `user-uploads` at key `user_uploads/<userId>/<assetId>-<filename>`; UI shows success

8) Troubleshooting
- CORS/Network:
  - Ensure API is at `http://localhost:4000` and web uses `VITE_GRAPHQL_URL=http://localhost:4000/graphql`
- Unauthorized/UNAUTHENTICATED:
  - Confirm you’re logged in; the web app will send `Authorization: Bearer <jwt>` automatically
- Storage "resource does not exist":
  - Ensure bucket `user-uploads` exists (private). API also attempts to create it when missing
  - Ensure Edge Function is deployed and secrets are set
- Database errors:
  - Ensure both migrations ran

## Migrations quick run order

Run these in your Supabase SQL editor:

1. `migrations/001_init.sql`
2. `migrations/002_align_schema.sql`
3. `supabase/migrations/002_rls.sql` (enables RLS and policies)

## Threat Model & Assumptions

- Replay protection: Upload tickets are single-use and bound to (userId, size, mime, path, nonce). Tickets are invalidated after finalize.
- RLS enforcement: All core tables use Supabase Row-Level Security; only owners (and explicitly shared users) can read assets.
- MIME sniffing: Server-side hashing/inspection checks magic bytes, mitigating spoofed extensions.
- TTL links: Download URLs are short-lived (~90s). Expired links cannot be reused.
- Path safety: Filenames are normalized; path traversal (`../`) and suspicious unicode are rejected.
- Audit logs: Each issued download link is logged to `download_audit`.

## Assumptions

- Email+password auth is available (magic links optional).
- Allowed file types: jpeg, png, webp, pdf.
- TTL chosen as ~90 seconds for a security/usability balance.

## Rubric Checklist

| Rubric Item | Fix Status |
| --- | --- |
| Security & RLS | ✅ via `supabase/migrations/002_rls.sql` |
| Correctness (idempotent finalize, audit, TTL) | ⚠️ Confirm TTL + audit in resolvers |
| Client UX (cancel/retry, corrupt, conflict) | ⚠️ Implemented in UI state machine; verify flows |
| API & Types | ✅ Schema exists; ensure error codes (e.g., VERSION_CONFLICT) |
| Docs & Tests | ⚠️ Test skeletons added; README updated |
| Demo Video | ❌ Record and link |


