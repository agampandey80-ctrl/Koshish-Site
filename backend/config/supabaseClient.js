/**
 * Supabase Client Configuration
 * Uses the service_role key to bypass RLS policies.
 * NEVER expose this key on the frontend.
 */

const { createClient } = require('@supabase/supabase-js');


const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️  Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. Database operations will fail.');
  supabase = new Proxy({}, {
    get: function(target, prop) {
      throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment/Vercel settings.');
    }
  });
} else {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

module.exports = supabase;
