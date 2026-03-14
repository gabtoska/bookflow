import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Clienti" };
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ClientsPageContent } from "@/components/clients/clients-page-content";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.businessId) redirect("/login");

  const { q } = await searchParams;

  const clients = await db.client.findMany({
    where: {
      businessId: session.user.businessId,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { phone: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { appointments: true } },
    },
  });

  return (
    <Suspense>
      <ClientsPageContent clients={JSON.parse(JSON.stringify(clients))} />
    </Suspense>
  );
}
