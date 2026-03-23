import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: list pending coupling requests for this notary
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== "NOTARY" && role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const userEmail = session.user?.email || "";

  const pending = await prisma.legacyVault.findMany({
    where: {
      notaryEmail: userEmail,
      notaryAccepted: "PENDING",
    },
    include: {
      owner: { select: { name: true, email: true, createdAt: true } },
      _count: { select: { assets: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ requests: pending });
}

// POST: accept or reject a coupling request
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== "NOTARY" && role !== "ADMIN") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { vaultId, decision } = await req.json(); // decision: "ACCEPTED" | "REJECTED"
  if (!["ACCEPTED", "REJECTED"].includes(decision)) {
    return NextResponse.json({ error: "Ongeldige beslissing" }, { status: 400 });
  }

  const userEmail = session.user?.email || "";

  const vault = await prisma.legacyVault.findUnique({ where: { id: vaultId } });
  if (!vault) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  if (vault.notaryEmail !== userEmail) {
    return NextResponse.json({ error: "Dit verzoek is niet aan u gericht" }, { status: 403 });
  }
  if (vault.notaryAccepted !== "PENDING") {
    return NextResponse.json({ error: "Dit verzoek is al behandeld" }, { status: 409 });
  }

  const updated = await prisma.legacyVault.update({
    where: { id: vaultId },
    data: {
      notaryAccepted: decision,
      // If rejected: clear the notary assignment entirely
      ...(decision === "REJECTED" && {
        notaryEmail: null,
        notaryName: null,
        notaryAccepted: "NONE",
      }),
    },
  });

  await prisma.auditLog.create({
    data: {
      vaultId,
      userId: (session.user as any).id,
      action: decision === "ACCEPTED" ? "NOTARY_COUPLING_ACCEPTED" : "NOTARY_COUPLING_REJECTED",
      details:
        decision === "ACCEPTED"
          ? `Koppelverzoek geaccepteerd door notaris ${userEmail}`
          : `Koppelverzoek afgewezen door notaris ${userEmail} — notariskoppeling verwijderd`,
    },
  });

  return NextResponse.json({ vault: updated });
}
