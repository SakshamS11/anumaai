# ANUMA AI

ANUMA is an evidence-first frontline interaction intelligence product. The repository currently contains the Phase 2 secure data foundation: authenticated organizations, scoped memberships, locations, teams, persistent conversation shells, immutable processing lineage, private audio-storage policy, and PostgreSQL row-level security.

Phase 2 does not record audio or perform transcription, semantic analysis, scoring, coaching, or outcome analytics.

## Local setup

1. Install Node.js 20.9 or newer and run `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Add the configured development project's public Supabase URL and publishable key.
4. Run `npm run dev`.

`.env.local` is ignored by Git. `SUPABASE_DB_URL` is a privileged local migration/testing credential: never expose it to browser code, prefix it with `NEXT_PUBLIC_`, commit it, or paste it into source files.

## Database migrations

The ordered SQL files under `supabase/migrations` are the schema source of truth. Do not change an applied migration; add a new timestamped migration for every later correction.

The normal CLI workflow is:

```powershell
npx.cmd supabase login
npx.cmd supabase link --project-ref YOUR_PROJECT_REF
npx.cmd supabase db push
```

When the CLI is not linked, a securely configured local database URI can be used without placing it in command history:

```powershell
npx.cmd supabase db push --db-url $env:SUPABASE_DB_URL
```

Generate database types from the applied hosted schema:

```powershell
npx.cmd supabase gen types typescript --project-id YOUR_PROJECT_REF --schema public | Set-Content src/lib/supabase/database.generated.ts -Encoding utf8
```

## Verification

```powershell
npm.cmd run format
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run test:security
npm.cmd run build
npm.cmd run test:e2e
```

`test:security` requires `SUPABASE_DB_URL` in the local process or ignored `.env.local`. It runs actual RLS and Storage-policy scenarios in a rolled-back PostgreSQL transaction. The browser foundation test creates a uniquely named development fixture and removes it through the configured database connection after the test.

The project intentionally does not require Docker solely for hosted migration or security verification.
