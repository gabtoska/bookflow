"use server";

import { getAuthBusiness } from "@/lib/auth-utils";
import { sendAppointmentReminder } from "@/lib/reminders/send-appointment-reminder";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true } | { success: false; error: string };

export async function sendReminder(appointmentId: string): Promise<ActionResult> {
  const authResult = await getAuthBusiness();
  if (!authResult) return { success: false, error: "Non autorizzato" };

  const result = await sendAppointmentReminder({
    appointmentId,
    businessId: authResult.business.id,
  });

  revalidatePath("/appointments");
  revalidatePath("/dashboard");

  if (result.success) {
    return { success: true };
  }
  return { success: false, error: result.error || "Errore nell'invio del promemoria" };
}
