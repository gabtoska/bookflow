import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Impostazioni" };
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Separator } from "@/components/ui/separator";
import { BusinessSettingsForm } from "@/components/settings/business-settings-form";
import { WorkingHoursForm } from "@/components/settings/working-hours-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.businessId) redirect("/login");

  const business = await db.business.findUnique({
    where: { id: session.user.businessId },
    include: {
      workingHours: { orderBy: { dayOfWeek: "asc" } },
    },
  });

  if (!business) redirect("/login");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Impostazioni"
        description="Configura la tua attività e gli orari di apertura."
      />

      <BusinessSettingsForm
        business={{
          name: business.name,
          slug: business.slug,
          phone: business.phone,
          address: business.address,
          slotIntervalMinutes: business.slotIntervalMinutes,
        }}
      />

      <Separator />

      <WorkingHoursForm
        workingHours={business.workingHours.map((wh) => ({
          dayOfWeek: wh.dayOfWeek,
          isOpen: wh.isOpen,
          startTime: wh.startTime,
          endTime: wh.endTime,
        }))}
      />
    </div>
  );
}
