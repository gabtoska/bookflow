/**
 * Available time slot generation utility.
 *
 * Generates bookable time slots for a given business day by:
 * 1. Reading working hours for the selected weekday
 * 2. Generating slots at slotIntervalMinutes intervals
 * 3. Ensuring the full service duration fits before closing time
 * 4. Removing slots that overlap with existing non-cancelled appointments
 * 5. Removing past slots if the selected date is today
 */

export interface WorkingHoursData {
  dayOfWeek: number;
  isOpen: boolean;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}

export interface ExistingAppointment {
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}

/** Convert "HH:mm" to total minutes since midnight */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Convert total minutes since midnight to "HH:mm" */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/**
 * Generate available time slots for a given date.
 *
 * @param workingHours - Working hours for each day of the week
 * @param slotIntervalMinutes - Interval between slot start times (e.g. 30)
 * @param serviceDurationMinutes - Duration of the selected service
 * @param existingAppointments - Non-cancelled appointments already booked for that date
 * @param selectedDate - The date being booked (YYYY-MM-DD string)
 * @param nowStr - Current time as "HH:mm" (only used if selectedDate is today)
 * @returns Array of available slot start times in "HH:mm" format
 */
export function generateAvailableSlots(
  workingHours: WorkingHoursData[],
  slotIntervalMinutes: number,
  serviceDurationMinutes: number,
  existingAppointments: ExistingAppointment[],
  selectedDate: string,
  nowStr?: string
): string[] {
  // Determine day of week for the selected date
  const date = new Date(selectedDate + "T12:00:00"); // noon to avoid timezone issues
  const dayOfWeek = date.getDay(); // 0 = Sunday

  // Find working hours for this day
  const dayHours = workingHours.find((wh) => wh.dayOfWeek === dayOfWeek);
  if (!dayHours || !dayHours.isOpen) return [];

  const openMinutes = timeToMinutes(dayHours.startTime);
  const closeMinutes = timeToMinutes(dayHours.endTime);

  // Determine cutoff: if today, exclude past times (with a small buffer)
  let cutoffMinutes = 0;
  if (nowStr) {
    cutoffMinutes = timeToMinutes(nowStr);
  }

  // Generate all possible slot starts
  const slots: string[] = [];

  for (let start = openMinutes; start < closeMinutes; start += slotIntervalMinutes) {
    const end = start + serviceDurationMinutes;

    // Slot must complete before closing
    if (end > closeMinutes) break;

    // Skip past times for today
    if (start < cutoffMinutes) continue;

    // Check overlap with existing appointments
    const slotStartStr = minutesToTime(start);
    const slotEndStr = minutesToTime(end);

    const hasConflict = existingAppointments.some((apt) => {
      // Two intervals overlap when: start1 < end2 AND start2 < end1
      return slotStartStr < apt.endTime && apt.startTime < slotEndStr;
    });

    if (!hasConflict) {
      slots.push(slotStartStr);
    }
  }

  return slots;
}
