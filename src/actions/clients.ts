"use server";

import { db } from "@/lib/db";
import { getAuthBusiness } from "@/lib/auth-utils";
import { clientSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true } | { success: false; error: string; fieldErrors?: Record<string, string> };

export async function createClient(formData: FormData): Promise<ActionResult> {
  const authResult = await getAuthBusiness();
  if (!authResult) return { success: false, error: "Non autorizzato" };

  const raw = {
    name: formData.get("name") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
    notes: formData.get("notes") as string,
  };

  const parsed = clientSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0]) fieldErrors[issue.path[0].toString()] = issue.message;
    }
    return { success: false, error: "Dati non validi", fieldErrors };
  }

  try {
    await db.client.create({
      data: {
        businessId: authResult.business.id,
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        notes: parsed.data.notes || null,
      },
    });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && (e as { code: string }).code === "P2002") {
      return { success: false, error: "Un cliente con questo numero di telefono esiste già", fieldErrors: { phone: "Numero già registrato" } };
    }
    return { success: false, error: "Errore durante la creazione del cliente" };
  }

  revalidatePath("/clients");
  return { success: true };
}

export async function updateClient(id: string, formData: FormData): Promise<ActionResult> {
  const authResult = await getAuthBusiness();
  if (!authResult) return { success: false, error: "Non autorizzato" };

  const existing = await db.client.findFirst({
    where: { id, businessId: authResult.business.id },
  });
  if (!existing) return { success: false, error: "Cliente non trovato" };

  const raw = {
    name: formData.get("name") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
    notes: formData.get("notes") as string,
  };

  const parsed = clientSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0]) fieldErrors[issue.path[0].toString()] = issue.message;
    }
    return { success: false, error: "Dati non validi", fieldErrors };
  }

  try {
    await db.client.update({
      where: { id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        notes: parsed.data.notes || null,
      },
    });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && (e as { code: string }).code === "P2002") {
      return { success: false, error: "Un cliente con questo numero di telefono esiste già", fieldErrors: { phone: "Numero già registrato" } };
    }
    return { success: false, error: "Errore durante l'aggiornamento del cliente" };
  }

  revalidatePath("/clients");
  return { success: true };
}

export async function deleteClient(id: string): Promise<ActionResult> {
  const authResult = await getAuthBusiness();
  if (!authResult) return { success: false, error: "Non autorizzato" };

  const existing = await db.client.findFirst({
    where: { id, businessId: authResult.business.id },
  });
  if (!existing) return { success: false, error: "Cliente non trovato" };

  await db.client.delete({ where: { id } });

  revalidatePath("/clients");
  return { success: true };
}
