/**
 * Mock WhatsApp reminder provider.
 *
 * Simulates WhatsApp message sending for development and testing.
 * Succeeds by default; fails for phone numbers containing "FAIL" (useful for testing).
 * Replace this with a real Twilio/360dialog provider for production.
 */

import type { ReminderProvider, ReminderSendRequest, ReminderSendResult } from "./provider";

export class MockWhatsAppProvider implements ReminderProvider {
  readonly channel = "WHATSAPP";

  async send(request: ReminderSendRequest): Promise<ReminderSendResult> {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Validate phone number presence
    if (!request.to || request.to.trim().length < 5) {
      return {
        success: false,
        error: "Numero di telefono mancante o non valido",
      };
    }

    // Test hook: numbers containing "FAIL" simulate provider failure
    if (request.to.includes("FAIL")) {
      return {
        success: false,
        error: "Errore simulato del provider WhatsApp",
      };
    }

    // Simulate successful send
    const providerMessageId = `mock_wa_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    console.log(`[MockWhatsApp] Message sent to ${request.to}: ${request.message.slice(0, 80)}...`);

    return {
      success: true,
      providerMessageId,
    };
  }
}
