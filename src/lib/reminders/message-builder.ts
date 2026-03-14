/**
 * Centralized reminder message builder.
 *
 * Generates professional, friendly reminder messages in Italian.
 * All reminder messages go through this builder — never build messages
 * inline in actions or UI components.
 */

const MONTH_NAMES = [
  "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
  "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
];

const DAY_NAMES = [
  "domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato",
];

export interface ReminderMessageData {
  businessName: string;
  customerName: string;
  serviceName: string;
  appointmentDate: Date | string;
  startTime: string; // "HH:mm"
}

function formatDateItalian(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  const dayName = DAY_NAMES[d.getDay()];
  const dayNum = d.getDate();
  const month = MONTH_NAMES[d.getMonth()];
  return `${dayName} ${dayNum} ${month}`;
}

export function buildReminderMessage(data: ReminderMessageData): string {
  const dateStr = formatDateItalian(data.appointmentDate);

  return (
    `Ciao ${data.customerName}, ti ricordiamo il tuo appuntamento ` +
    `per "${data.serviceName}" ${dateStr} alle ${data.startTime} ` +
    `presso ${data.businessName}. ` +
    `Per modifiche, contattaci direttamente. A presto!`
  );
}
