import { createClient } from "@supabase/supabase-js";

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function createSupabaseClient() {
  return createClient(
    getEnvVar("SUPABASE_URL"),
    getEnvVar("SUPABASE_SERVICE_ROLE_KEY")
  );
}
