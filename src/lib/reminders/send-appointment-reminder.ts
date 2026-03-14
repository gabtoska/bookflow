/**
 * Reminder service layer.
 *
 * Orchestrates the full reminder send flow:
 * 1. Builds the message using the centralized message builder
 * 2. Sends via the configured provider
 * 3. Logs the attempt to ReminderLog (both success and failure)
 * 4. Updates the appointment's reminderStatus
 *
 * This is the single entry point for sending reminders — server actions
 * call this function, never the provider directly.
 */

import { db } from "@/lib/db";
import type { ReminderProvider } from "./provider";
import { MockWhatsAppProvider } from "./mock-whatsapp-provider";
import { buildReminderMessage } from "./message-builder";

// ─── Provider configuration ──────────────────────────────────────────────────
// Swap this for a real provider in production
function getProvider(): ReminderProvider {
  return new MockWhatsAppProvider();
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SendReminderInput {
  appointmentId: string;
  businessId: string;
}

export interface SendReminderResult {
  success: boolean;
  error?: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export async function sendAppointmentReminder(
  input: SendReminderInput
): Promise<SendReminderResult> {
  // Load appointment with related data
  const appointment = await db.appointment.findFirst({
    where: {
      id: input.appointmentId,
      businessId: input.businessId,
    },
    include: {
      client: { select: { name: true, phone: true } },
      service: { select: { name: true } },
      business: { select: { name: true } },
    },
  });

  if (!appointment) {
    return { success: false, error: "Appuntamento non trovato" };
  }

  if (!appointment.client.phone || appointment.client.phone.trim().length < 5) {
    // Log failed attempt for missing phone
    await db.reminderLog.create({
      data: {
        businessId: input.businessId,
        appointmentId: input.appointmentId,
        channel: "WHATSAPP",
        status: "FAILED",
        recipient: appointment.client.phone || "",
        message: null,
        error: "Numero di telefono del cliente mancante o non valido",
      },
    });
    await db.appointment.update({
      where: { id: input.appointmentId },
      data: { reminderStatus: "FAILED" },
    });
    return { success: false, error: "Il cliente non ha un numero di telefono valido" };
  }

  // Build message
  const message = buildReminderMessage({
    businessName: appointment.business.name,
    customerName: appointment.client.name,
    serviceName: appointment.service.name,
    appointmentDate: appointment.appointmentDate,
    startTime: appointment.startTime,
  });

  // Set status to PENDING before attempting send
  await db.appointment.update({
    where: { id: input.appointmentId },
    data: { reminderStatus: "PENDING" },
  });

  // Send via provider
  const provider = getProvider();
  const result = await provider.send({
    to: appointment.client.phone,
    message,
  });

  if (result.success) {
    // Log success
    await db.reminderLog.create({
      data: {
        businessId: input.businessId,
        appointmentId: input.appointmentId,
        channel: "WHATSAPP",
        status: "SENT",
        recipient: appointment.client.phone,
        message,
        sentAt: new Date(),
      },
    });
    await db.appointment.update({
      where: { id: input.appointmentId },
      data: { reminderStatus: "SENT" },
    });
    return { success: true };
  } else {
    // Log failure
    await db.reminderLog.create({
      data: {
        businessId: input.businessId,
        appointmentId: input.appointmentId,
        channel: "WHATSAPP",
        status: "FAILED",
        recipient: appointment.client.phone,
        message,
        error: result.error || "Errore sconosciuto del provider",
      },
    });
    await db.appointment.update({
      where: { id: input.appointmentId },
      data: { reminderStatus: "FAILED" },
    });
    return { success: false, error: "Invio del promemoria fallito. Riprova più tardi." };
  }
}
