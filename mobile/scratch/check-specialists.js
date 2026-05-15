const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');

const env = dotenv.parse(fs.readFileSync('.env'));
const supabase = createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.EXPO_PUBLIC_SUPABASE_KEY);

async function checkSchema() {
  const { data, error } = await supabase
    .from('specialists')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error specialists:', error);
  } else {
    console.log('Specialists keys:', Object.keys(data[0] || {}));
  }
}

checkSchema();
