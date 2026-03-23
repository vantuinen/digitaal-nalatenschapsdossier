import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== "NOTARY" && role !== "ADMIN") {
    return NextResponse.json({ error: "Alleen een notaris kan een annotatie toevoegen" }, { status: 403 });
  }

  const { id } = await params;
  const { notaryTestamentRef } = await req.json();

  const vault = await prisma.legacyVault.findUnique({ where: { id } });
  if (!vault) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  // Verify this notary is assigned to this vault
  if (vault.notaryEmail !== session.user?.email && role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang tot dit dossier" }, { status: 403 });
  }

  const previousValue = vault.notaryTestamentRef;

  const updated = await prisma.legacyVault.update({
    where: { id },
    data: { notaryTestamentRef: notaryTestamentRef || null },
  });

  await prisma.auditLog.create({
    data: {
      vaultId: id,
      userId: (session.user as any).id,
      action: "NOTARY_TESTAMENT_REF_UPDATED",
      details: previousValue
        ? `Notariële testamentannotatie gewijzigd van "${previousValue}" naar "${notaryTestamentRef || "(leeg)"}"`
        : `Notariële testamentannotatie toegevoegd: "${notaryTestamentRef}"`,
    },
  });

  return NextResponse.json({ vault: updated });
}
