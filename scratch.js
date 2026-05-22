require('dotenv').config({ path: './backend/.env' });
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
  const { data, error } = await supabase.storage.from('event-photos').upload('test.txt', 'hello');
  console.log('Upload Result:', data, error);
}
test();
