"use server";

import { db } from "@/lib/db";
import { getAuthBusiness } from "@/lib/auth-utils";
import { businessSettingsSchema, workingHoursSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true } | { success: false; error: string; fieldErrors?: Record<string, string> };

export async function updateBusinessSettings(formData: FormData): Promise<ActionResult> {
  const authResult = await getAuthBusiness();
  if (!authResult) return { success: false, error: "Non autorizzato" };

  const raw = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    phone: formData.get("phone") as string,
    address: formData.get("address") as string,
    slotIntervalMinutes: formData.get("slotIntervalMinutes") as string,
  };

  const parsed = businessSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0]) fieldErrors[issue.path[0].toString()] = issue.message;
    }
    return { success: false, error: "Dati non validi", fieldErrors };
  }

  // Check slug uniqueness (exclude current business)
  if (parsed.data.slug !== authResult.business.slug) {
    const existing = await db.business.findFirst({
      where: { slug: parsed.data.slug, id: { not: authResult.business.id } },
    });
    if (existing) {
      return {
        success: false,
        error: "Slug già in uso",
        fieldErrors: { slug: "Questo slug è già utilizzato da un'altra attività" },
      };
    }
  }

  await db.business.update({
    where: { id: authResult.business.id },
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      slotIntervalMinutes: parsed.data.slotIntervalMinutes,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateWorkingHours(data: string): Promise<ActionResult> {
  const authResult = await getAuthBusiness();
  if (!authResult) return { success: false, error: "Non autorizzato" };

  let rawHours: unknown;
  try {
    rawHours = JSON.parse(data);
  } catch {
    return { success: false, error: "Formato dati non valido" };
  }

  const parsed = workingHoursSchema.safeParse(rawHours);
  if (!parsed.success) {
    return { success: false, error: "Dati orari non validi: " + parsed.error.issues[0].message };
  }

  // Use a transaction to upsert all 7 days
  await db.$transaction(
    parsed.data.map((wh) =>
      db.workingHours.upsert({
        where: {
          businessId_dayOfWeek: {
            businessId: authResult.business.id,
            dayOfWeek: wh.dayOfWeek,
          },
        },
        create: {
          businessId: authResult.business.id,
          dayOfWeek: wh.dayOfWeek,
          isOpen: wh.isOpen,
          startTime: wh.startTime,
          endTime: wh.endTime,
        },
        update: {
          isOpen: wh.isOpen,
          startTime: wh.startTime,
          endTime: wh.endTime,
        },
      })
    )
  );

  revalidatePath("/settings");
  return { success: true };
}
