import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Servizi" };
import { redirect } from "next/navigation";
import { ServicesPageContent } from "@/components/services/services-page-content";

export default async function ServicesPage() {
  const session = await auth();
  if (!session?.user?.businessId) redirect("/login");

  const services = await db.service.findMany({
    where: { businessId: session.user.businessId },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { appointments: true } },
    },
  });

  return <ServicesPageContent services={JSON.parse(JSON.stringify(services))} />;
}
