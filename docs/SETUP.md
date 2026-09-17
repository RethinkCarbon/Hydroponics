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
8. Also set `VITE_API_URL` to your backend URL (local: `http://localhost:3001`). Signup prefers the API so new users are **email-confirmed** and can sign in immediately.

### Auth (login / signup)

- **Sign in / Sign up** use Supabase Auth. Profiles + roles live in `public.profiles`.
- For a ready admin account: `cd server && npm run seed:admin`  
  Default: `admin@planetive.org` / `Admin123` (override with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`).
- Signup always creates **operator** accounts. Admins are created only with `npm run seed:admin`.
- **Confirm email** must be enabled in Supabase → **Authentication → Providers → Email**. Users cannot sign in until they click the confirmation link. Seeded admin accounts are confirmed automatically.
- Keep the **API server running** as a signup fallback when public signup is rate-limited (`cd server && npm run dev`).

---

## Step 2: Create the first database tables

1. In Supabase, open **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open the file `supabase/migrations/001_initial_tables.sql` in this repo, copy its full contents, and paste into the SQL Editor.
4. Click **Run** (or press Ctrl+Enter).
5. You should see “Success. No rows returned.” The tables created are:
   - **profiles** – user roles (admin/operator), linked to Supabase Auth. A row is created automatically when someone signs up.
   - **sensor_readings** – where the backend will store incoming sensor data (device_id, type, value, unit, created_at).
   - **alerts** – system alerts (type, message, device, acknowledged, action_target).
6. (Optional) To let users acknowledge alerts from the dashboard: run `supabase/migrations/002_alerts_acknowledge_policy.sql` in the SQL Editor the same way.
7. (Optional) For temperature control (exhaust fan, cooling pad, intake fan): run `supabase/migrations/003_temperature_control.sql` in the SQL Editor the same way.
8. (Optional) For humidity control (fogger, vent): run `supabase/migrations/004_humidity_control.sql` in the SQL Editor the same way (run after 003).
9. (Optional) For circulation fans (HAF): run `supabase/migrations/005_circulation_haf.sql` in the SQL Editor the same way (run after 004).
10. (Optional) For shade control (light + temp override + evening): run `supabase/migrations/006_shade_control.sql` in the SQL Editor the same way (run after 005).
11. (Optional) For vent/window automation (temp, RH, wind, rain): run `supabase/migrations/007_vent_automation.sql` in the SQL Editor the same way (run after 006).
12. (Optional) For irrigation (day/night schedule, tank low → stop): run `supabase/migrations/008_irrigation_control.sql` in the SQL Editor the same way (run after 007).
13. (Optional) For flushing / drain waste water (schedule, EC > max, manual; drain → wait → refill → resume): run `supabase/migrations/009_flush_control.sql` in the SQL Editor the same way (run after 008).
14. (Optional) For refilling clean water (level low → open inlet, level high → close, timeout fail-safe): run `supabase/migrations/010_refill_control.sql` in the SQL Editor the same way (run after 009).
15. (Optional) For UV lights (ON with circulation pump + flow, OFF if no flow; hour counter for lamp replacement): run `supabase/migrations/011_uv_control.sql` in the SQL Editor the same way (run after 010).
16. (Optional) For pH controller (dose up/down by range, mix → wait → recheck; after EC stable): run `supabase/migrations/012_ph_control.sql` in the SQL Editor the same way (run after 011).
17. (Optional) For system-wide overrides (low_low → stop all pumps; temp > 45°C → force ventilation; sensor_error → disable dosing; power_recovery → self-check): run `supabase/migrations/013_system_overrides.sql` in the SQL Editor the same way (run after 012).
18. (Optional) So new sign-ups can choose Admin or Operator role: run `supabase/migrations/014_profile_role_on_signup.sql` in the SQL Editor (run after 001; safe to run anytime).

---

## Step 3: Node + Express backend

1. From the **project root** (Hydroponics), run:
   ```bash
   cd server && npm install
   ```
2. The server loads `.env` from the project root, so your existing `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are used.
3. Start the server:
   ```bash
   npm run dev
   ```
4. You should see `Server running at http://localhost:3001`. Try:
   - **Health:** [http://localhost:3001/api/health](http://localhost:3001/api/health) → `{ "status": "ok", "timestamp": "..." }`
   - **Sensor ingest:** `POST http://localhost:3001/api/sensors/ingest` with body:
     ```json
     { "device_id": "tower-a-1", "type": "ec", "value": 1.8, "unit": "mS/cm" }
     ```
     Then check **Supabase → Table Editor → sensor_readings** for the new row.

When Step 3 is done, we can add more routes (e.g. control, alerts) or connect the frontend.
