import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@planetive.org';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123';

if (!url || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: list, error: listError } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 1000,
});
if (listError) {
  console.error('Failed to list users:', listError.message);
  process.exit(1);
}

const existing = list.users.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());

if (existing) {
  const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: 'Administrator', role: 'admin' },
  });
  if (updateError) {
    console.error('Failed to update admin user:', updateError.message);
    process.exit(1);
  }
  await supabase.from('profiles').update({ role: 'admin', display_name: 'Administrator' }).eq('id', existing.id);
  console.log('Admin user already existed — password reset and role set to admin.');
  console.log(`Email: ${ADMIN_EMAIL}`);
  process.exit(0);
}

const { data: created, error: createError } = await supabase.auth.admin.createUser({
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
  email_confirm: true,
  user_metadata: { full_name: 'Administrator', role: 'admin' },
});

if (createError) {
  console.error('Failed to create admin user:', createError.message);
  process.exit(1);
}

await supabase
  .from('profiles')
  .update({ role: 'admin', display_name: 'Administrator' })
  .eq('id', created.user.id);

console.log('Admin user created.');
console.log(`Email: ${ADMIN_EMAIL}`);
console.log('Password: (see SEED_ADMIN_PASSWORD or default Admin123)');
