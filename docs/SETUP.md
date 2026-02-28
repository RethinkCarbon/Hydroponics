# Setup: Step by step

## Step 1: Create Supabase project and get credentials

1. Go to **[supabase.com](https://supabase.com)** and sign in (or create an account).
2. Click **New project**.
3. Pick an organization (or create one), name the project (e.g. `hydroponics`), set a database password (save it somewhere safe), and choose a region close to you.
4. Wait for the project to finish creating (1–2 minutes).
5. In the left sidebar, open **Project Settings** (gear icon) → **API**.
6. Copy:
   - **Project URL** → use for `VITE_SUPABASE_URL` and `SUPABASE_URL`
   - **anon public** key → use for `VITE_SUPABASE_ANON_KEY`
   - **service_role** key → use for `SUPABASE_SERVICE_ROLE_KEY` (keep this secret; backend only)
7. In the project root, copy `.env.example` to `.env` and paste in those values.

When Step 1 is done, say so and we’ll do **Step 2** (first database tables).
