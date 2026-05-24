import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Testing reset password for fake email...");
  const { data, error } = await supabase.auth.resetPasswordForEmail("fake_nonexistent_email_12345@gmail.com");
  console.log("Data:", data);
  console.log("Error:", error);
}
test();
