import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const newM = (total % 60).toString().padStart(2, "0");
  return `${newH}:${newM}`;
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database...\n");

  // Clean existing data (order matters for FK constraints)
  await prisma.reminderLog.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.service.deleteMany();
  await prisma.client.deleteMany();
  await prisma.workingHours.deleteMany();
  await prisma.business.deleteMany();
  await prisma.user.deleteMany();

  // ── User ──────────────────────────────────────────────────────────────────

  const passwordHash = await hash("demo1234", 12);

  const user = await prisma.user.create({
    data: {
      name: "Marco Rossi",
      email: "marco@barbershoprossi.it",
      passwordHash,
    },
  });
  console.log(`✓ User created: ${user.email}`);

  // ── Business ──────────────────────────────────────────────────────────────

  const business = await prisma.business.create({
    data: {
      ownerId: user.id,
      name: "Barbershop Rossi",
      slug: "barbershop-rossi",
      phone: "+39 02 1234567",
      address: "Via Montenapoleone 15, 20121 Milano MI",
      slotIntervalMinutes: 30,
    },
  });
  console.log(`✓ Business created: ${business.name}`);

  // ── Working Hours ─────────────────────────────────────────────────────────

  const workingHoursData = [
    { dayOfWeek: 0, startTime: "00:00", endTime: "00:00", isOpen: false }, // Domenica
    { dayOfWeek: 1, startTime: "09:00", endTime: "19:00", isOpen: true }, // Lunedì
    { dayOfWeek: 2, startTime: "09:00", endTime: "19:00", isOpen: true }, // Martedì
    { dayOfWeek: 3, startTime: "09:00", endTime: "19:00", isOpen: true }, // Mercoledì
    { dayOfWeek: 4, startTime: "09:00", endTime: "19:00", isOpen: true }, // Giovedì
    { dayOfWeek: 5, startTime: "09:00", endTime: "19:00", isOpen: true }, // Venerdì
    { dayOfWeek: 6, startTime: "09:00", endTime: "14:00", isOpen: true }, // Sabato
  ];

  for (const wh of workingHoursData) {
    await prisma.workingHours.create({
      data: { businessId: business.id, ...wh },
    });
  }
  console.log("✓ Working hours created (Mon–Sat)");

  // ── Services ──────────────────────────────────────────────────────────────

  const servicesData = [
    { name: "Taglio Capelli", durationMinutes: 30, price: 20 },
    { name: "Barba", durationMinutes: 20, price: 15 },
    { name: "Taglio + Barba", durationMinutes: 45, price: 30 },
    { name: "Shampoo e Piega", durationMinutes: 30, price: 18 },
    { name: "Trattamento Capelli", durationMinutes: 40, price: 35 },
    { name: "Rasatura Completa", durationMinutes: 25, price: 12 },
  ];

  const services = [];
  for (const s of servicesData) {
    const service = await prisma.service.create({
      data: { businessId: business.id, ...s },
    });
    services.push(service);
  }
  console.log(`✓ ${services.length} services created`);

  // ── Clients ───────────────────────────────────────────────────────────────

  const clientsData = [
    { name: "Luca Bianchi", phone: "+39 333 1234567", email: "luca.bianchi@email.it" },
    { name: "Alessandro Moretti", phone: "+39 340 2345678", email: null },
    { name: "Francesco Romano", phone: "+39 348 3456789", email: "f.romano@gmail.com" },
    { name: "Matteo Colombo", phone: "+39 351 4567890", email: null },
    { name: "Lorenzo Ferrari", phone: "+39 328 5678901", email: "lorenzo.ferrari@outlook.it" },
    { name: "Andrea Ricci", phone: "+39 339 6789012", email: null },
    { name: "Davide Marino", phone: "+39 345 7890123", email: "d.marino@email.it" },
    { name: "Giovanni Greco", phone: "+39 320 8901234", email: null },
    { name: "Simone Conti", phone: "+39 338 9012345", email: "simone.conti@pec.it" },
    { name: "Tommaso Bruno", phone: "+39 347 0123456", email: null },
  ];

  const clients = [];
  for (const c of clientsData) {
    const client = await prisma.client.create({
      data: {
        businessId: business.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
      },
    });
    clients.push(client);
  }
  console.log(`✓ ${clients.length} clients created`);

  // ── Appointments ──────────────────────────────────────────────────────────

  // Spread across past, today, and future
  const appointmentsData = [
    // Past appointments (completed / no-show)
    { clientIdx: 0, serviceIdx: 0, dayOffset: -7, time: "09:00", status: "COMPLETED" as const, source: "MANUAL" as const },
    { clientIdx: 1, serviceIdx: 2, dayOffset: -7, time: "10:00", status: "COMPLETED" as const, source: "MANUAL" as const },
    { clientIdx: 2, serviceIdx: 1, dayOffset: -5, time: "11:00", status: "COMPLETED" as const, source: "ONLINE_BOOKING" as const },
    { clientIdx: 3, serviceIdx: 0, dayOffset: -5, time: "14:00", status: "NO_SHOW" as const, source: "MANUAL" as const, noShow: true },
    { clientIdx: 4, serviceIdx: 3, dayOffset: -3, time: "09:30", status: "COMPLETED" as const, source: "MANUAL" as const },
    { clientIdx: 5, serviceIdx: 4, dayOffset: -2, time: "15:00", status: "CANCELLED" as const, source: "ONLINE_BOOKING" as const },
    { clientIdx: 6, serviceIdx: 0, dayOffset: -1, time: "10:00", status: "COMPLETED" as const, source: "MANUAL" as const },

    // Today's appointments
    { clientIdx: 0, serviceIdx: 2, dayOffset: 0, time: "09:00", status: "CONFIRMED" as const, source: "MANUAL" as const, reminderStatus: "SENT" as const },
    { clientIdx: 7, serviceIdx: 0, dayOffset: 0, time: "10:00", status: "CONFIRMED" as const, source: "ONLINE_BOOKING" as const, reminderStatus: "SENT" as const },
    { clientIdx: 8, serviceIdx: 1, dayOffset: 0, time: "11:00", status: "PENDING" as const, source: "ONLINE_BOOKING" as const, reminderStatus: "PENDING" as const },
    { clientIdx: 2, serviceIdx: 5, dayOffset: 0, time: "14:30", status: "CONFIRMED" as const, source: "MANUAL" as const, reminderStatus: "SENT" as const },
    { clientIdx: 9, serviceIdx: 0, dayOffset: 0, time: "16:00", status: "PENDING" as const, source: "ONLINE_BOOKING" as const },

    // Future appointments
    { clientIdx: 1, serviceIdx: 0, dayOffset: 1, time: "09:00", status: "CONFIRMED" as const, source: "MANUAL" as const },
    { clientIdx: 3, serviceIdx: 2, dayOffset: 1, time: "11:00", status: "PENDING" as const, source: "ONLINE_BOOKING" as const },
    { clientIdx: 4, serviceIdx: 0, dayOffset: 2, time: "10:00", status: "CONFIRMED" as const, source: "MANUAL" as const },
    { clientIdx: 5, serviceIdx: 3, dayOffset: 3, time: "14:00", status: "PENDING" as const, source: "ONLINE_BOOKING" as const },
    { clientIdx: 6, serviceIdx: 4, dayOffset: 5, time: "09:30", status: "PENDING" as const, source: "MANUAL" as const },
    { clientIdx: 8, serviceIdx: 0, dayOffset: 7, time: "16:00", status: "CONFIRMED" as const, source: "ONLINE_BOOKING" as const },
  ];

  const appointments = [];
  for (const a of appointmentsData) {
    const service = services[a.serviceIdx];
    const endTime = addMinutes(a.time, service.durationMinutes);

    const appointment = await prisma.appointment.create({
      data: {
        businessId: business.id,
        clientId: clients[a.clientIdx].id,
        serviceId: service.id,
        appointmentDate: daysFromNow(a.dayOffset),
        startTime: a.time,
        endTime,
        status: a.status,
        source: a.source,
        noShow: a.noShow ?? false,
        reminderStatus: a.reminderStatus ?? "NONE",
        notes: a.status === "CANCELLED" ? "Il cliente ha annullato" : null,
      },
    });
    appointments.push(appointment);

    // Update client's lastAppointmentAt for past appointments
    if (a.dayOffset <= 0 && a.status !== "CANCELLED") {
      await prisma.client.update({
        where: { id: clients[a.clientIdx].id },
        data: { lastAppointmentAt: daysFromNow(a.dayOffset) },
      });
    }
  }
  console.log(`✓ ${appointments.length} appointments created`);

  // ── Reminder Logs ─────────────────────────────────────────────────────────

  // Create reminder logs for today's confirmed appointments
  const todaysConfirmed = appointments.filter(
    (_, i) =>
      appointmentsData[i].dayOffset === 0 &&
      appointmentsData[i].reminderStatus === "SENT"
  );

  for (const appt of todaysConfirmed) {
    await prisma.reminderLog.create({
      data: {
        businessId: business.id,
        appointmentId: appt.id,
        channel: "WHATSAPP",
        status: "SENT",
        recipient: clients.find((c) => c.id === appt.clientId)!.phone,
        message: "Promemoria: hai un appuntamento oggi presso Barbershop Rossi. Ti aspettiamo!",
        sentAt: new Date(),
      },
    });
  }

  // One pending reminder for tomorrow
  const tomorrowAppts = appointments.filter(
    (_, i) => appointmentsData[i].dayOffset === 1
  );
  if (tomorrowAppts.length > 0) {
    await prisma.reminderLog.create({
      data: {
        businessId: business.id,
        appointmentId: tomorrowAppts[0].id,
        channel: "WHATSAPP",
        status: "PENDING",
        recipient: clients.find((c) => c.id === tomorrowAppts[0].clientId)!.phone,
        message: "Promemoria: hai un appuntamento domani presso Barbershop Rossi.",
      },
    });
  }

  // One failed reminder example
  if (appointments.length > 3) {
    await prisma.reminderLog.create({
      data: {
        businessId: business.id,
        appointmentId: appointments[3].id,
        channel: "WHATSAPP",
        status: "FAILED",
        recipient: clients[appointmentsData[3].clientIdx].phone,
        message: "Promemoria appuntamento",
        error: "Numero non raggiungibile",
      },
    });
  }

  const reminderCount = await prisma.reminderLog.count();
  console.log(`✓ ${reminderCount} reminder logs created`);

  console.log("\n✅ Seed completed successfully!");
  console.log("\n📋 Demo credentials:");
  console.log("   Email:    marco@barbershoprossi.it");
  console.log("   Password: demo1234");
  console.log(`   Booking:  /book/${business.slug}\n`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
