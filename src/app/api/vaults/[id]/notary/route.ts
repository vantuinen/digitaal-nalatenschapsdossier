import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  const role = (session.user as any).role;
  if (role !== "NOTARY" && role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { id } = await params;

  const vault = await prisma.legacyVault.findUnique({
    where: { id },
    include: {
      owner: { select: { name: true, email: true } },
      assets: {
        include: { beneficiary: { select: { name: true, email: true } } },
        orderBy: { createdAt: "asc" },
      },
      beneficiaries: { orderBy: { createdAt: "asc" } },
      releaseRequests: { orderBy: { createdAt: "desc" } },
      auditLogs: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!vault) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  // Verify this notary is assigned to this vault
  const userEmail = session.user?.email;
  if (vault.notaryEmail !== userEmail && role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang tot dit dossier" }, { status: 403 });
  }

  // Block access until the notary has accepted the coupling request
  if (vault.notaryAccepted !== "ACCEPTED" && role !== "ADMIN") {
    return NextResponse.json(
      { error: "U heeft het koppelverzoek voor dit dossier nog niet geaccepteerd" },
      { status: 403 }
    );
  }

  return NextResponse.json({ vault });
}
