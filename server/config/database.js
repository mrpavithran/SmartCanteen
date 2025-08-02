import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database initialization
export const initializeDatabase = async () => {
  try {
    // Create tables if they don't exist
    const { error: usersError } = await supabase.rpc('create_users_table');
    const { error: categoriesError } = await supabase.rpc('create_categories_table');
    const { error: itemsError } = await supabase.rpc('create_items_table');
    const { error: ordersError } = await supabase.rpc('create_orders_table');
    const { error: walletError } = await supabase.rpc('create_wallet_table');

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
};