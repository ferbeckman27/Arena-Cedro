const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = 'https://rzukzukevgjfgfzyzrkw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6dWt6dWtldmdqZmdmenl6cmt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDIwNzIsImV4cCI6MjA4NzE3ODA3Mn0.ajRDXsrSV6h4FKD6KgZzIHoSSX1X62fqZ9EJDzdlpRU';

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

module.exports = { supabase };
