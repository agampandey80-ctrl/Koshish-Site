// Script to create or update an admin user
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedAdmin() {
  const email = 'admin@koshish.org';
  const password = 'admin'; // Expected by most generic systems or let user know
  
  const hash = await bcrypt.hash(password, 10);
  
  console.log('Checking for existing admin...');
  const { data: existingAdmin, error: fetchError } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email)
    .single();
    
  if (existingAdmin) {
    console.log('Admin exists, updating password...');
    const { error: updateError } = await supabase
      .from('admins')
      .update({ password_hash: hash })
      .eq('email', email);
      
    if (updateError) {
      console.error('Error updating admin:', updateError);
    } else {
      console.log('Admin password updated successfully. Email:', email, 'Password:', password);
    }
  } else {
    console.log('Admin does not exist, creating...');
    const { error: insertError } = await supabase
      .from('admins')
      .insert([{ email, password_hash: hash }]);
      
    if (insertError) {
      console.error('Error creating admin:', insertError);
    } else {
      console.log('Admin created successfully. Email:', email, 'Password:', password);
    }
  }
}

seedAdmin().catch(console.error);
