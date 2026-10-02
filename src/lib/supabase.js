import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn(
    'Supabase URL hoặc Publishable Key chưa được cấu hình đầy đủ trong file .env. Vui lòng kiểm tra lại.'
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
