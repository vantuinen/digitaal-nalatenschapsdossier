import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, readBooleanSetting } from "@/lib/admin";

const settingKeys = ["maintenance_mode", "allow_registrations", "assistant_enabled"] as const;

type SettingKey = (typeof settingKeys)[number];

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const rows = await prisma.appSetting.findMany({ where: { key: { in: [...settingKeys] } } });
  const map = new Map(rows.map((row) => [row.key, row.value]));

  return NextResponse.json({
    settings: {
      maintenanceMode: readBooleanSetting(map.get("maintenance_mode"), false),
      allowRegistrations: readBooleanSetting(map.get("allow_registrations"), true),
      assistantEnabled: readBooleanSetting(map.get("assistant_enabled"), true),
    },
  });
}

export async function PATCH(req: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => ({}));
  const updates: Partial<Record<SettingKey, string>> = {};

  if (typeof body.maintenanceMode === "boolean") updates.maintenance_mode = String(body.maintenanceMode);
  if (typeof body.allowRegistrations === "boolean") updates.allow_registrations = String(body.allowRegistrations);
  if (typeof body.assistantEnabled === "boolean") updates.assistant_enabled = String(body.assistantEnabled);

  const entries = Object.entries(updates) as [SettingKey, string][];
  if (entries.length === 0) {
    return NextResponse.json({ error: "Geen geldige instellingen meegegeven." }, { status: 400 });
  }

  await Promise.all(
    entries.map(([key, value]) =>
      prisma.appSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )
  );

  return GET();
}
