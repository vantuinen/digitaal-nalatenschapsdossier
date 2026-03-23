import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  const userId = (session.user as any).id;
  const vault = await prisma.legacyVault.findUnique({ where: { ownerId: userId } });
  return NextResponse.json({ vault });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  const userId = (session.user as any).id;
  const body = await req.json();

  const currentVault = await prisma.legacyVault.findUnique({ where: { ownerId: userId } });
  if (!currentVault) return NextResponse.json({ error: "Geen kluis gevonden" }, { status: 404 });

  // Detect whether a new notary is being assigned
  const newNotaryEmail = body.notaryEmail;
  const isNewNotaryAssignment =
    newNotaryEmail !== undefined &&
    newNotaryEmail !== "" &&
    newNotaryEmail !== currentVault.notaryEmail;

  // Detect notary being unlinked
  const isUnlinking = newNotaryEmail === "" && currentVault.notaryEmail;

  const vault = await prisma.legacyVault.update({
    where: { ownerId: userId },
    data: {
      ...(body.title && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.testamentRef !== undefined && { testamentRef: body.testamentRef }),
      ...(body.notaryName !== undefined && { notaryName: body.notaryName || null }),
      ...(body.notaryEmail !== undefined && { notaryEmail: body.notaryEmail || null }),
      // When assigning a new notary: set to PENDING so notary must accept
      ...(isNewNotaryAssignment && { notaryAccepted: "PENDING" }),
      // When unlinking notary: reset acceptance status
      ...(isUnlinking && { notaryAccepted: "NONE" }),
    },
  });

  if (isNewNotaryAssignment) {
    await prisma.auditLog.create({
      data: {
        vaultId: vault.id,
        userId,
        action: "NOTARY_COUPLING_REQUESTED",
        details: `Koppelverzoek verstuurd naar notaris: ${newNotaryEmail}`,
      },
    });
  }

  if (isUnlinking) {
    await prisma.auditLog.create({
      data: {
        vaultId: vault.id,
        userId,
        action: "NOTARY_UNLINKED",
        details: `Notaris ontkoppeld: ${currentVault.notaryEmail}`,
      },
    });
  }

  return NextResponse.json({ vault });
}
