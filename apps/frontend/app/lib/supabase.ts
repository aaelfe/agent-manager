import { createClient } from '@supabase/supabase-js';
import type { Database } from '~/types/supabase';

// These environment variables should be set in your project
// For Remix, they would typically be in your server environment
// and exposed via the VITE_ prefix for client-side code
const supabaseUrl = import.meta.env.SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY || '';

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_ANON_KEY');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey); 