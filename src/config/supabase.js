import { createClient } from '@supabase/supabase-js';

// Pull Supabase URL and Key from the .env.local file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Missing Supabase Environment Variables! Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local file.");
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');
