/**
 * Supabase Client Configuration
 * Uses the service_role key to bypass RLS policies.
 * NEVER expose this key on the frontend.
 */

const { createClient } = require('@supabase/supabase-js');
const cors=require('cors')



const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

module.exports = supabase;
