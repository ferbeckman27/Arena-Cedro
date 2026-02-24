import { createClient } from '@supabase/supabase-js';

// O Vite exige o prefixo VITE_ e o uso de import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("⚠️ Variáveis de ambiente do Supabase não encontradas! Verifique o arquivo .env");
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');