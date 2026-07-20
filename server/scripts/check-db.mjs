import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error('DB NOT CONNECTED');
  console.error('Reason: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

try {
  const supabase = createClient(url, serviceRoleKey);
  const { error } = await supabase
    .from('control_setpoints')
    .select('id')
    .eq('id', 'climate')
    .single();

  if (error) {
    console.error('DB NOT CONNECTED');
    console.error(`Reason: ${error.message}`);
    process.exit(1);
  }

  console.log('DB CONNECTED');
  console.log(`Project: ${url}`);
  process.exit(0);
} catch (err) {
  console.error('DB NOT CONNECTED');
  console.error(`Reason: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}
