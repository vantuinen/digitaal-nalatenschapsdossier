import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, readBooleanSetting } from "@/lib/admin";

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const [users, vaults, assets, releaseRequests, settings] = await Promise.all([
    prisma.user.count(),
    prisma.legacyVault.count(),
    prisma.digitalAsset.count(),
    prisma.releaseRequest.count({ where: { status: "PENDING" } }),
    prisma.appSetting.findMany({
      where: {
        key: {
          in: ["maintenance_mode", "allow_registrations", "assistant_enabled"],
        },
      },
    }),
  ]);

  const settingsMap = new Map(settings.map((s) => [s.key, s.value]));

  return NextResponse.json({
    status: {
      users,
      vaults,
      assets,
      pendingReleaseRequests: releaseRequests,
      maintenanceMode: readBooleanSetting(settingsMap.get("maintenance_mode"), false),
      allowRegistrations: readBooleanSetting(settingsMap.get("allow_registrations"), true),
      assistantEnabled: readBooleanSetting(settingsMap.get("assistant_enabled"), true),
      timestamp: new Date().toISOString(),
    },
  });
}
