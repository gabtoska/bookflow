"use server";

import { db } from "@/lib/db";
import { getAuthBusiness } from "@/lib/auth-utils";
import { serviceSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";

type ActionResult = { success: true } | { success: false; error: string; fieldErrors?: Record<string, string> };

function parseServiceForm(formData: FormData) {
  return {
    name: formData.get("name") as string,
    durationMinutes: formData.get("durationMinutes") as string,
    price: formData.get("price") as string,
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
  };
}

export async function createService(formData: FormData): Promise<ActionResult> {
  const authResult = await getAuthBusiness();
  if (!authResult) return { success: false, error: "Non autorizzato" };

  const raw = parseServiceForm(formData);
  const parsed = serviceSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0]) fieldErrors[issue.path[0].toString()] = issue.message;
    }
    return { success: false, error: "Dati non validi", fieldErrors };
  }

  await db.service.create({
    data: {
      businessId: authResult.business.id,
      name: parsed.data.name,
      durationMinutes: parsed.data.durationMinutes,
      price: parsed.data.price != null ? new Prisma.Decimal(parsed.data.price) : null,
      isActive: parsed.data.isActive,
    },
  });

  revalidatePath("/services");
  return { success: true };
}

export async function updateService(id: string, formData: FormData): Promise<ActionResult> {
  const authResult = await getAuthBusiness();
  if (!authResult) return { success: false, error: "Non autorizzato" };

  const existing = await db.service.findFirst({
    where: { id, businessId: authResult.business.id },
  });
  if (!existing) return { success: false, error: "Servizio non trovato" };

  const raw = parseServiceForm(formData);
  const parsed = serviceSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0]) fieldErrors[issue.path[0].toString()] = issue.message;
    }
    return { success: false, error: "Dati non validi", fieldErrors };
  }

  await db.service.update({
    where: { id },
    data: {
      name: parsed.data.name,
      durationMinutes: parsed.data.durationMinutes,
      price: parsed.data.price != null ? new Prisma.Decimal(parsed.data.price) : null,
      isActive: parsed.data.isActive,
    },
  });

  revalidatePath("/services");
  return { success: true };
}

export async function deleteService(id: string): Promise<ActionResult> {
  const authResult = await getAuthBusiness();
  if (!authResult) return { success: false, error: "Non autorizzato" };

  const existing = await db.service.findFirst({
    where: { id, businessId: authResult.business.id },
  });
  if (!existing) return { success: false, error: "Servizio non trovato" };

  await db.service.delete({ where: { id } });

  revalidatePath("/services");
  return { success: true };
}
