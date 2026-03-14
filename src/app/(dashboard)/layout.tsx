import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export const metadata: Metadata = {
  title: { template: "%s — BookFlow", default: "Dashboard — BookFlow" },
  description: "Gestisci appuntamenti, clienti e servizi con BookFlow.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <DashboardShell
      userName={session.user.name}
      businessName={session.user.businessName}
    >
      {children}
    </DashboardShell>
  );
}
