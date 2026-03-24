import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false as const, status: 401, error: "Niet geautoriseerd" };

  const role = (session.user as any).role;
  if (role !== "ADMIN") {
    return { ok: false as const, status: 403, error: "Alleen beheerders hebben toegang." };
  }

  return { ok: true as const, session };
}

export function readBooleanSetting(value: string | null | undefined, fallback: boolean) {
  if (value === undefined || value === null) return fallback;
  return value === "true";
}
