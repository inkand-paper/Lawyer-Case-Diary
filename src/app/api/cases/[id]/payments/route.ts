import { getAuthContext } from "@/lib/auth-server";
import { createPayment } from "@/lib/services/payment.service";
import { successResponse, apiErrors } from "@/lib/api-response";
import { z } from "zod";

const paymentSchema = z.object({
  amount: z.number().positive("Amount must be a positive number."),
  method: z.string().optional()
  // NOTE: a `notes` field used to be accepted here but was never persisted —
  // createPayment() never wrote it to the DB (Payment has no notes column).
  // Removed rather than silently discarding user input; no frontend (web or
  // Android) exposes a notes field for payments yet, so nothing depended on
  // it actually working.
});

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: RouteParams) {
  const user = await getAuthContext();
  if (!user) return apiErrors.UNAUTHORIZED();

  const { id: caseId } = await params;
  try {
    const body = await req.json();
    const validation = paymentSchema.safeParse(body);
    if (!validation.success) {
      return apiErrors.BAD_REQUEST(validation.error.issues[0].message);
    }

    const payment = await createPayment(user.id, user.chamberId, caseId, validation.data);
    return successResponse(payment, "Payment recorded successfully.", 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to record payment.";
    return apiErrors.SERVER_ERROR(message, error);
  }
}
