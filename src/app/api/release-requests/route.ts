import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });

  const userId = (session.user as any).id;
  const userEmail = session.user?.email || "";
  const { vaultId, reason } = await req.json();

  if (!vaultId) return NextResponse.json({ error: "vaultId is verplicht" }, { status: 400 });

  // Verify this user is actually a beneficiary of this vault
  const beneficiary = await prisma.beneficiary.findFirst({
    where: {
      vaultId,
      OR: [{ userId }, { email: userEmail }],
    },
  });
  if (!beneficiary) {
    return NextResponse.json({ error: "U bent geen erfgenaam van dit dossier" }, { status: 403 });
  }

  // Check vault exists and is in a state where a request makes sense
  const vault = await prisma.legacyVault.findUnique({ where: { id: vaultId } });
  if (!vault) return NextResponse.json({ error: "Dossier niet gevonden" }, { status: 404 });

  const allowedStatuses = ["ACTIVE", "DEATH_REPORTED", "UNDER_REVIEW", "APPROVED"];
  if (!allowedStatuses.includes(vault.status)) {
    return NextResponse.json(
      { error: `Er kan geen verzoek worden ingediend voor een dossier met status '${vault.status}'` },
      { status: 400 }
    );
  }

  // Prevent duplicate pending requests from the same beneficiary
  const existing = await prisma.releaseRequest.findFirst({
    where: { vaultId, requestedBy: userEmail, status: "PENDING" },
  });
  if (existing) {
    return NextResponse.json({ error: "U heeft al een openstaand verzoek voor dit dossier" }, { status: 409 });
  }

  const releaseRequest = await prisma.releaseRequest.create({
    data: {
      vaultId,
      requestedBy: `${beneficiary.name} (${userEmail})`,
      requestedByRole: "beneficiary",
      reason: reason || null,
      status: "PENDING",
    },
  });

  await prisma.auditLog.create({
    data: {
      vaultId,
      userId,
      action: "RELEASE_REQUESTED",
      details: `Vrijgaveverzoek ingediend door erfgenaam ${beneficiary.name} (${userEmail})`,
    },
  });

  return NextResponse.json({ releaseRequest }, { status: 201 });
}
