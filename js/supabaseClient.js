import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// IMPORTANT: โปรดเปลี่ยนค่าเหล่านี้ให้เป็นของ Project คุณใน Supabase
// สังเกตว่าใช้ ANON_KEY สำหรับ Frontend เสมอ ห้ามใช้ SERVICE_ROLE_KEY เด็ดขาด!
const supabaseUrl = 'https://kdeiauloliuojwadbzfd.supabase.co';
const supabaseKey = 'sb_publishable_3F7zRf4ZAbf80x8gfoQcRQ_NOF9uOmt';

export const supabase = createClient(supabaseUrl, supabaseKey);
