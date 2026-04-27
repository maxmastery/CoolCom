import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// IMPORTANT: โปรดเปลี่ยนค่าเหล่านี้ให้เป็นของ Project คุณใน Supabase
// สังเกตว่าใช้ ANON_KEY สำหรับ Frontend เสมอ ห้ามใช้ SERVICE_ROLE_KEY เด็ดขาด!
const supabaseUrl = 'https://kdeiauloliuojwadbzfd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkZWlhdWxvbGl1b2p3YWRiemZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMTYxMTAsImV4cCI6MjA5MjU5MjExMH0.3PTtphWSnLKyFWe-cVf_PPwWsxbIaGBFRiFJF1gemh4';

export const supabase = createClient(supabaseUrl, supabaseKey);
