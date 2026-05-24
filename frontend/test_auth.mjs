import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ioxotqnpijpdfevqtcjh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlveG90cW5waWpwZGZldnF0Y2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODI1ODMsImV4cCI6MjA4NzM1ODU4M30.kEmiSfnbMbYwY8A-JnifNxdeFEQLb_PI8C1EA8knoCs";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Testing reset password for fake email...");
  const { data, error } = await supabase.auth.resetPasswordForEmail("fake_nonexistent_email_12345@gmail.com");
  console.log("Data:", data);
  console.log("Error:", error);
}
test();
