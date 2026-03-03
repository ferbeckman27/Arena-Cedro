import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://ovmsumaiacqekrvunrsl.supabase.co';

const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92bXN1bWFpYWNxZWtydnVucnNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NjAxNjQsImV4cCI6MjA4ODEzNjE2NH0.MaePDJNY5pHJb9Yeptds60rUqUQMQhIUE6VenOWZais';

export const supabase = createClient(supabaseUrl, supabaseKey);
