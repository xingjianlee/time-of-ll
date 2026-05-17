import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? "https://picphqjbqnspwqyvfxmk.supabase.co";
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});

export type Owner = "sunny" | "felix";

/** Emails allowed to read & write. Edit here AND in the SQL is_couple() function. */
export const WHITELIST: Record<string, Owner> = {
  "15032717237@163.com": "felix",
  "1501868289@qq.com": "sunny",
};

export function ownerForEmail(email: string | null | undefined): Owner | null {
  if (!email) return null;
  return WHITELIST[email.toLowerCase()] ?? null;
}
