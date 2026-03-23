import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Returns what capabilities the current user actually has,
// regardless of their primary role field.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });

  const userId = (session.user as any).id;
  const userEmail = session.user?.email || "";
  const role = (session.user as any).role;

  const [vault, beneficiaryCount] = await Promise.all([
    prisma.legacyVault.findUnique({
      where: { ownerId: userId },
      select: { id: true, status: true, notaryAccepted: true },
    }),
    prisma.beneficiary.count({
      where: { OR: [{ userId }, { email: userEmail }] },
    }),
  ]);

  return NextResponse.json({
    role,
    isNotary:      role === "NOTARY",
    hasVault:      !!vault,
    isBeneficiary: beneficiaryCount > 0 || role === "BENEFICIARY",
    // Anyone can act as a testator — they just need to create a vault
    canCreateVault: !vault && role !== "NOTARY",
  });
}
