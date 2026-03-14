"use server";

import { db } from "@/lib/db";
import { publicBookingSchema } from "@/lib/validators";
import { generateAvailableSlots, timeToMinutes, minutesToTime } from "@/lib/slots";
import { revalidatePath } from "next/cache";

type BookingResult =
  | {
      success: true;
      booking: {
        businessName: string;
        serviceName: string;
        date: string;
        startTime: string;
        endTime: string;
        customerName: string;
      };
    }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

export async function submitPublicBooking(formData: FormData): Promise<BookingResult> {
  const raw = {
    businessSlug: formData.get("businessSlug") as string,
    serviceId: formData.get("serviceId") as string,
    date: formData.get("date") as string,
    startTime: formData.get("startTime") as string,
    customerName: (formData.get("customerName") as string)?.trim(),
    customerPhone: (formData.get("customerPhone") as string)?.trim(),
    customerEmail: (formData.get("customerEmail") as string)?.trim(),
    notes: (formData.get("notes") as string)?.trim(),
  };

  // Validate input
  const parsed = publicBookingSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0]) fieldErrors[issue.path[0].toString()] = issue.message;
    }
    return { success: false, error: "Controlla i dati inseriti", fieldErrors };
  }

  // Fetch business
  const business = await db.business.findUnique({
    where: { slug: parsed.data.businessSlug },
    include: { workingHours: true },
  });
  if (!business) {
    return { success: false, error: "Attività non trovata" };
  }

  // Verify service belongs to business and is active
  const service = await db.service.findFirst({
    where: { id: parsed.data.serviceId, businessId: business.id, isActive: true },
  });
  if (!service) {
    return { success: false, error: "Servizio non disponibile" };
  }

  // Validate date is not in the past
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  if (parsed.data.date < todayStr) {
    return { success: false, error: "Non è possibile prenotare nel passato" };
  }

  // Re-check slot availability server-side to prevent double-booking
  const appointmentDate = new Date(parsed.data.date + "T00:00:00");
  const existingAppointments = await db.appointment.findMany({
    where: {
      businessId: business.id,
      appointmentDate,
      status: { notIn: ["CANCELLED"] },
    },
    select: { startTime: true, endTime: true },
  });

  // Determine current time string if booking is for today
  const nowStr = parsed.data.date === todayStr
    ? `${today.getHours().toString().padStart(2, "0")}:${today.getMinutes().toString().padStart(2, "0")}`
    : undefined;

  const availableSlots = generateAvailableSlots(
    business.workingHours.map((wh) => ({
      dayOfWeek: wh.dayOfWeek,
      isOpen: wh.isOpen,
      startTime: wh.startTime,
      endTime: wh.endTime,
    })),
    business.slotIntervalMinutes,
    service.durationMinutes,
    existingAppointments,
    parsed.data.date,
    nowStr
  );

  if (!availableSlots.includes(parsed.data.startTime)) {
    return {
      success: false,
      error: "L'orario selezionato non è più disponibile. Scegli un altro orario.",
    };
  }

  // Calculate end time from service duration
  const startMinutes = timeToMinutes(parsed.data.startTime);
  const endTime = minutesToTime(startMinutes + service.durationMinutes);

  // Find or create client by businessId + phone
  let client = await db.client.findUnique({
    where: {
      businessId_phone: {
        businessId: business.id,
        phone: parsed.data.customerPhone,
      },
    },
  });

  if (client) {
    // Update existing client with latest info
    client = await db.client.update({
      where: { id: client.id },
      data: {
        name: parsed.data.customerName,
        ...(parsed.data.customerEmail ? { email: parsed.data.customerEmail } : {}),
      },
    });
  } else {
    client = await db.client.create({
      data: {
        businessId: business.id,
        name: parsed.data.customerName,
        phone: parsed.data.customerPhone,
        email: parsed.data.customerEmail || null,
      },
    });
  }

  // Create appointment
  // Status: PENDING — the business owner should confirm incoming online bookings.
  // This gives owners control and prevents no-shows from auto-confirmed slots.
  await db.appointment.create({
    data: {
      businessId: business.id,
      clientId: client.id,
      serviceId: service.id,
      appointmentDate,
      startTime: parsed.data.startTime,
      endTime,
      status: "PENDING",
      source: "ONLINE_BOOKING",
      notes: parsed.data.notes || null,
      noShow: false,
      reminderStatus: "NONE",
    },
  });

  revalidatePath("/appointments");
  revalidatePath("/dashboard");

  return {
    success: true,
    booking: {
      businessName: business.name,
      serviceName: service.name,
      date: parsed.data.date,
      startTime: parsed.data.startTime,
      endTime,
      customerName: parsed.data.customerName,
    },
  };
}
