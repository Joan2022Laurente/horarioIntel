import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hvunobsbasdksiajmfjf.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dW5vYnNiYXNka3NpYWptZmpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1Njg0NzAsImV4cCI6MjEwNTE0NDQ3MH0.ZP2J4bJ8V55Y7fggZKfFIzp9p-TxwsRp01UQultfpxc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
