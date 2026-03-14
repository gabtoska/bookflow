/**
 * Reminder provider abstraction.
 *
 * Defines the interface that any reminder channel provider must implement.
 * To add a real WhatsApp provider (e.g. Twilio, 360dialog), create a new
 * class implementing ReminderProvider and swap it in send-appointment-reminder.ts.
 */

export interface ReminderSendRequest {
  /** Recipient phone number */
  to: string;
  /** Message body */
  message: string;
  /** Optional metadata for provider-specific features */
  metadata?: Record<string, string>;
}

export interface ReminderSendResult {
  success: boolean;
  /** Provider-assigned message ID (for tracking) */
  providerMessageId?: string;
  /** Error message if sending failed */
  error?: string;
}

export interface ReminderProvider {
  /** Channel name (e.g. "WHATSAPP", "SMS") */
  readonly channel: string;

  /** Send a reminder message */
  send(request: ReminderSendRequest): Promise<ReminderSendResult>;
}
