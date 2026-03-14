// Shared type for AppointmentsCalendar — subset of AppointmentData used by the custom calendar
export interface AppointmentForCalendar {
  id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  noShow: boolean;
  client: { name: string };
  service: { name: string };
}
