import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Allow access if: primary role is BENEFICIARY, OR user has beneficiary entries
  const userId = (session.user as any).id;
  const userEmail = session.user?.email || "";
  const primaryRole = (session.user as any).role;

  if (primaryRole === "BENEFICIARY") {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  // Check if this non-BENEFICIARY user has any beneficiary entries
  const entry = await prisma.beneficiary.findFirst({
    where: { OR: [{ userId }, { email: userEmail }] },
  });

  if (!entry) redirect("/dashboard");
  return <DashboardLayout>{children}</DashboardLayout>;
}
