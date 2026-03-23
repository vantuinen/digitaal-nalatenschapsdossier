import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  const userId = (session.user as any).id;

  // Any authenticated user can create a vault, regardless of their primary role
  const existing = await prisma.legacyVault.findUnique({ where: { ownerId: userId } });
  if (existing) return NextResponse.json({ error: "U heeft al een kluis" }, { status: 409 });

  const body = await req.json();
  const vault = await prisma.legacyVault.create({
    data: {
      ownerId: userId,
      title: body.title || "Mijn Digitale Nalatenschap",
      description: body.description || null,
      testamentRef: body.testamentRef || null,
    },
  });

  await prisma.auditLog.create({
    data: { vaultId: vault.id, userId, action: "VAULT_CREATED", details: `Kluis '${vault.title}' aangemaakt` },
  });

  return NextResponse.json({ vault });
}
