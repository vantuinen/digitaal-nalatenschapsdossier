import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Returns the effective roles for the current user:
// - their primary role (TESTATOR, NOTARY, BENEFICIARY)
// - plus BENEFICIARY if they have any beneficiary entries (regardless of primary role)
// - plus TESTATOR if a BENEFICIARY-role user also has a vault
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });

  const userId = (session.user as any).id;
  const userEmail = session.user?.email || "";
  const primaryRole = (session.user as any).role as string;

  const [vault, beneficiaryEntries] = await Promise.all([
    prisma.legacyVault.findUnique({ where: { ownerId: userId }, select: { id: true, status: true } }),
    prisma.beneficiary.findMany({
      where: { OR: [{ userId }, { email: userEmail }] },
      select: { id: true },
    }),
  ]);

  const roles: string[] = [primaryRole];
  if (beneficiaryEntries.length > 0 && !roles.includes("BENEFICIARY")) roles.push("BENEFICIARY");
  if (vault && !roles.includes("TESTATOR")) roles.push("TESTATOR");

  return NextResponse.json({ roles, primaryRole, hasVault: !!vault, isBeneficiary: beneficiaryEntries.length > 0 });
}
