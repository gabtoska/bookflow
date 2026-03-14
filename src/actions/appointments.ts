"use server";

import { db } from "@/lib/db";
import { getAuthBusiness } from "@/lib/auth-utils";
import { appointmentSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true } | { success: false; error: string; fieldErrors?: Record<string, string> };

function parseAppointmentForm(formData: FormData) {
  return {
    clientId: formData.get("clientId") as string,
    serviceId: formData.get("serviceId") as string,
    appointmentDate: formData.get("appointmentDate") as string,
    startTime: formData.get("startTime") as string,
    endTime: formData.get("endTime") as string,
    status: formData.get("status") as string,
    source: formData.get("source") as string,
    notes: formData.get("notes") as string,
    noShow: formData.get("noShow") === "true",
  };
}

async function checkOverlap(
  businessId: string,
  date: Date,
  startTime: string,
  endTime: string,
  excludeId?: string
): Promise<boolean> {
  const overlapping = await db.appointment.findFirst({
    where: {
      businessId,
      appointmentDate: date,
      status: { notIn: ["CANCELLED"] },
      startTime: { lt: endTime },
      endTime: { gt: startTime },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
  return !!overlapping;
}

export async function createAppointment(formData: FormData): Promise<ActionResult> {
  const authResult = await getAuthBusiness();
  if (!authResult) return { success: false, error: "Non autorizzato" };

  const raw = parseAppointmentForm(formData);
  const parsed = appointmentSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0]) fieldErrors[issue.path[0].toString()] = issue.message;
    }
    return { success: false, error: "Dati non validi", fieldErrors };
  }

  const businessId = authResult.business.id;

  // Verify client belongs to this business
  const client = await db.client.findFirst({
    where: { id: parsed.data.clientId, businessId },
  });
  if (!client) return { success: false, error: "Cliente non trovato", fieldErrors: { clientId: "Cliente non valido" } };

  // Verify service belongs to this business
  const service = await db.service.findFirst({
    where: { id: parsed.data.serviceId, businessId },
  });
  if (!service) return { success: false, error: "Servizio non trovato", fieldErrors: { serviceId: "Servizio non valido" } };

  const appointmentDate = new Date(parsed.data.appointmentDate + "T00:00:00");

  // Check for overlapping appointments
  const hasOverlap = await checkOverlap(
    businessId,
    appointmentDate,
    parsed.data.startTime,
    parsed.data.endTime
  );
  if (hasOverlap) {
    return {
      success: false,
      error: "Esiste già un appuntamento in questo orario",
      fieldErrors: { startTime: "Orario sovrapposto con un altro appuntamento" },
    };
  }

  await db.appointment.create({
    data: {
      businessId,
      clientId: parsed.data.clientId,
      serviceId: parsed.data.serviceId,
      appointmentDate,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      status: parsed.data.status as "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW",
      source: parsed.data.source as "MANUAL" | "ONLINE_BOOKING",
      notes: parsed.data.notes || null,
      noShow: parsed.data.noShow,
    },
  });

  // Update client's lastAppointmentAt
  if (["CONFIRMED", "COMPLETED"].includes(parsed.data.status)) {
    const currentLast = client.lastAppointmentAt;
    if (!currentLast || appointmentDate > currentLast) {
      await db.client.update({
        where: { id: client.id },
        data: { lastAppointmentAt: appointmentDate },
      });
    }
  }

  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateAppointment(id: string, formData: FormData): Promise<ActionResult> {
  const authResult = await getAuthBusiness();
  if (!authResult) return { success: false, error: "Non autorizzato" };

  const existing = await db.appointment.findFirst({
    where: { id, businessId: authResult.business.id },
  });
  if (!existing) return { success: false, error: "Appuntamento non trovato" };

  const raw = parseAppointmentForm(formData);
  const parsed = appointmentSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0]) fieldErrors[issue.path[0].toString()] = issue.message;
    }
    return { success: false, error: "Dati non validi", fieldErrors };
  }

  const businessId = authResult.business.id;

  const client = await db.client.findFirst({
    where: { id: parsed.data.clientId, businessId },
  });
  if (!client) return { success: false, error: "Cliente non trovato" };

  const service = await db.service.findFirst({
    where: { id: parsed.data.serviceId, businessId },
  });
  if (!service) return { success: false, error: "Servizio non trovato" };

  const appointmentDate = new Date(parsed.data.appointmentDate + "T00:00:00");

  const hasOverlap = await checkOverlap(
    businessId,
    appointmentDate,
    parsed.data.startTime,
    parsed.data.endTime,
    id // exclude current appointment
  );
  if (hasOverlap) {
    return {
      success: false,
      error: "Esiste già un appuntamento in questo orario",
      fieldErrors: { startTime: "Orario sovrapposto con un altro appuntamento" },
    };
  }

  await db.appointment.update({
    where: { id },
    data: {
      clientId: parsed.data.clientId,
      serviceId: parsed.data.serviceId,
      appointmentDate,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      status: parsed.data.status as "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW",
      source: parsed.data.source as "MANUAL" | "ONLINE_BOOKING",
      notes: parsed.data.notes || null,
      noShow: parsed.data.noShow,
    },
  });

  // Update client's lastAppointmentAt
  if (["CONFIRMED", "COMPLETED"].includes(parsed.data.status)) {
    const currentLast = client.lastAppointmentAt;
    if (!currentLast || appointmentDate > currentLast) {
      await db.client.update({
        where: { id: client.id },
        data: { lastAppointmentAt: appointmentDate },
      });
    }
  }

  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteAppointment(id: string): Promise<ActionResult> {
  const authResult = await getAuthBusiness();
  if (!authResult) return { success: false, error: "Non autorizzato" };

  const existing = await db.appointment.findFirst({
    where: { id, businessId: authResult.business.id },
  });
  if (!existing) return { success: false, error: "Appuntamento non trovato" };

  await db.appointment.delete({ where: { id } });

  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  return { success: true };
}
