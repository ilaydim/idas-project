import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ioxotqnpijpdfevqtcjh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlveG90cW5waWpwZGZldnF0Y2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODI1ODMsImV4cCI6MjA4NzM1ODU4M30.kEmiSfnbMbYwY8A-JnifNxdeFEQLb_PI8C1EA8knoCs";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Testing signInWithPassword for fake email...");
  const { data, error } = await supabase.auth.signInWithPassword({email: "fake_nonexistent_email_12345@gmail.com", password: "DummyPassword123!"});
  console.log("Fake Email Error:", error?.message);

  console.log("Testing signInWithPassword for REAL email but wrong pass...");
  const { data: d2, error: e2 } = await supabase.auth.signInWithPassword({email: "saklavciyaren@gmail.com", password: "DummyPassword123!"});
  console.log("Real Email Error:", e2?.message);
}
test();
