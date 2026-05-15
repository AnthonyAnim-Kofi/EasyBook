const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');

const env = dotenv.parse(fs.readFileSync('.env'));
const supabase = createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.EXPO_PUBLIC_SUPABASE_KEY);

async function checkSchema() {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Business keys:', Object.keys(data[0] || {}));
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (profileError) {
    console.error('Profile Error:', profileError);
  } else {
    console.log('Profile keys:', Object.keys(profileData[0] || {}));
  }
  const { data: pkgData, error: pkgError } = await supabase
    .from('packages')
    .select('*')
    .limit(1);

  if (pkgError) {
    console.error('Package Error:', pkgError);
  } else {
    console.log('Package keys:', Object.keys(pkgData[0] || {}));
  }
}

checkSchema();
