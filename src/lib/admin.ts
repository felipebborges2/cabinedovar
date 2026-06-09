import { notFound } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export function getAppAdminEmails() {
  return (process.env.APP_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAppAdminEmail(email?: string | null) {
  if (!email) {
    return false;
  }

  return getAppAdminEmails().includes(email.toLowerCase());
}

export function requireAppAdmin(user: User) {
  if (!isAppAdminEmail(user.email)) {
    notFound();
  }
}
