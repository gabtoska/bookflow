import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Get the authenticated user's business. Returns null if not authenticated
 * or if the user has no business. Use this at the start of every server action
 * and data fetch to enforce business scoping.
 */
export async function getAuthBusiness() {
  const session = await auth();
  if (!session?.user?.businessId) return null;

  const business = await db.business.findUnique({
    where: { id: session.user.businessId },
  });

  if (!business) return null;

  return { session, business };
}
