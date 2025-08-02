import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

console.log('🔗 Connecting to Supabase...');
console.log('URL:', supabaseUrl.substring(0, 30) + '...');

export const supabase = createClient(supabaseUrl, supabaseKey);

// Test database connection
export const testConnection = async () => {
  try {
    console.log('🔍 Testing database connection...');
    const { data, error } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1);

    if (error) {
      console.error('❌ Database connection failed:', error.message);
      console.error('Error details:', error);
      return false;
    }

    console.log('✅ Database connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    return false;
  }
};