"use server";

import { signIn } from "@/lib/auth";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema, signupSchema } from "@/lib/validators";
import { AuthError } from "next-auth";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function signUpAction(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    businessName: formData.get("businessName") as string,
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password, businessName } = parsed.data;

  const existingUser = await db.user.findUnique({ where: { email: email } });
  if (existingUser) {
    return { error: "Un account con questa email esiste già" };
  }

  const passwordHash = await hash(password, 12);
  let slug = slugify(businessName);

  const existingSlug = await db.business.findUnique({ where: { slug: slug } });
  if (existingSlug) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      business: {
        create: {
          name: businessName,
          slug,
          slotIntervalMinutes: 30,
          workingHours: {
            create: [
              { dayOfWeek: 0, startTime: "00:00", endTime: "00:00", isOpen: false },
              { dayOfWeek: 1, startTime: "09:00", endTime: "18:00", isOpen: true },
              { dayOfWeek: 2, startTime: "09:00", endTime: "18:00", isOpen: true },
              { dayOfWeek: 3, startTime: "09:00", endTime: "18:00", isOpen: true },
              { dayOfWeek: 4, startTime: "09:00", endTime: "18:00", isOpen: true },
              { dayOfWeek: 5, startTime: "09:00", endTime: "18:00", isOpen: true },
              { dayOfWeek: 6, startTime: "09:00", endTime: "13:00", isOpen: true },
            ],
          },
        },
      },
    },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Errore durante la registrazione" };
    }
    throw error;
  }
}

export async function signInAction(formData: FormData) {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email o password non corretti" };
    }
    throw error;
  }
}
