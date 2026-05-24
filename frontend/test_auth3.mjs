import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ioxotqnpijpdfevqtcjh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlveG90cW5waWpwZGZldnF0Y2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODI1ODMsImV4cCI6MjA4NzM1ODU4M30.kEmiSfnbMbYwY8A-JnifNxdeFEQLb_PI8C1EA8knoCs";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Testing signUp for REAL email...");
  const { data, error } = await supabase.auth.signUp({email: "saklavciyaren@gmail.com", password: "DummyPassword123!"});
  console.log("Real Email Data:", JSON.stringify(data, null, 2));
  console.log("Real Email Error:", error?.message);
}
test();
