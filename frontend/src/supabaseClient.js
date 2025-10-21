// frontend/src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// .env file ကနေ Supabase URL နဲ့ Key ကို ယူသုံးပါ
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase Client instance ကို ဖန်တီးပါ
export const supabase = createClient(supabaseUrl, supabaseAnonKey);