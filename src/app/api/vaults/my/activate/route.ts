import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  const userId = (session.user as any).id;

  const existing = await prisma.legacyVault.findUnique({ where: { ownerId: userId } });
  if (!existing) return NextResponse.json({ error: "Geen kluis gevonden" }, { status: 404 });
  if (existing.status !== "DRAFT") return NextResponse.json({ error: "Kluis is al actief" }, { status: 400 });

  if (!existing.notaryEmail) {
    return NextResponse.json({ error: "Koppel eerst een notaris aan uw dossier" }, { status: 400 });
  }

  if (existing.notaryAccepted !== "ACCEPTED") {
    return NextResponse.json({
      error: "De notaris heeft het koppelverzoek nog niet geaccepteerd. U kunt de kluis pas activeren na acceptatie.",
    }, { status: 400 });
  }

  const vault = await prisma.legacyVault.update({
    where: { ownerId: userId },
    data: { status: "ACTIVE", activatedAt: new Date() },
  });

  await prisma.auditLog.create({
    data: { vaultId: vault.id, userId, action: "VAULT_ACTIVATED", details: "Kluis geactiveerd door eigenaar" },
  });

  return NextResponse.json({ vault });
}
