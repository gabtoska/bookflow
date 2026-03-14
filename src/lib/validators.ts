import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Inserisci un'email valida"),
  password: z.string().min(6, "La password deve avere almeno 6 caratteri"),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Il nome deve avere almeno 2 caratteri"),
  email: z.string().email("Inserisci un'email valida"),
  password: z.string().min(6, "La password deve avere almeno 6 caratteri"),
  businessName: z.string().min(2, "Il nome dell'attività deve avere almeno 2 caratteri"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

// ─── Clients ──────────────────────────────────────────────────────────────────

export const clientSchema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio"),
  phone: z.string().min(1, "Il telefono è obbligatorio"),
  email: z.string().email("Email non valida").or(z.literal("")).optional(),
  notes: z.string().optional(),
});

export type ClientInput = z.infer<typeof clientSchema>;

// ─── Services ─────────────────────────────────────────────────────────────────

export const serviceSchema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio"),
  durationMinutes: z.coerce
    .number({ error: "Inserisci un numero valido" })
    .int({ message: "Deve essere un numero intero" })
    .positive({ message: "La durata deve essere positiva" }),
  price: z.coerce
    .number({ error: "Inserisci un prezzo valido" })
    .nonnegative({ message: "Il prezzo non può essere negativo" })
    .optional()
    .or(z.literal("").transform(() => undefined)),
  isActive: z.boolean().default(true),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

// ─── Appointments ─────────────────────────────────────────────────────────────

export const appointmentSchema = z
  .object({
    clientId: z.string().min(1, "Seleziona un cliente"),
    serviceId: z.string().min(1, "Seleziona un servizio"),
    appointmentDate: z.string().min(1, "La data è obbligatoria"),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato orario non valido (HH:mm)"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato orario non valido (HH:mm)"),
    status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"], {
      error: "Seleziona uno stato",
    }),
    source: z.enum(["MANUAL", "ONLINE_BOOKING"]).default("MANUAL"),
    notes: z.string().optional(),
    noShow: z.boolean().default(false),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "L'orario di fine deve essere dopo l'orario di inizio",
    path: ["endTime"],
  });

export type AppointmentInput = z.infer<typeof appointmentSchema>;

// ─── Business Settings ────────────────────────────────────────────────────────

export const businessSettingsSchema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio"),
  slug: z
    .string()
    .min(1, "Lo slug è obbligatorio")
    .regex(/^[a-z0-9-]+$/, "Lo slug può contenere solo lettere minuscole, numeri e trattini"),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  slotIntervalMinutes: z.coerce
    .number({ error: "Inserisci un numero valido" })
    .int({ message: "Deve essere un numero intero" })
    .min(5, "L'intervallo minimo è 5 minuti")
    .max(120, "L'intervallo massimo è 120 minuti"),
});

export type BusinessSettingsInput = z.infer<typeof businessSettingsSchema>;

export const workingHourSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  isOpen: z.boolean(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato orario non valido"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato orario non valido"),
});

export const workingHoursSchema = z.array(workingHourSchema).length(7);

export type WorkingHoursInput = z.infer<typeof workingHoursSchema>;

// ─── Public Booking ───────────────────────────────────────────────────────────

export const publicBookingSchema = z.object({
  businessSlug: z.string().min(1),
  serviceId: z.string().min(1, "Seleziona un servizio"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data non valida"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Orario non valido"),
  customerName: z.string().min(1, "Il nome è obbligatorio"),
  customerPhone: z.string().min(1, "Il telefono è obbligatorio"),
  customerEmail: z.string().email("Email non valida").or(z.literal("")).optional(),
  notes: z.string().optional(),
});

export type PublicBookingInput = z.infer<typeof publicBookingSchema>;
