import { getAuthContext } from "@/lib/auth-server";
import { deletePayment } from "@/lib/services/payment.service";
import { successResponse, apiErrors } from "@/lib/api-response";

type RouteParams = { params: Promise<{ id: string, paymentId: string }> };

export async function DELETE(_req: Request, { params }: RouteParams) {
  const user = await getAuthContext();
  if (!user) return apiErrors.UNAUTHORIZED();

  const { id: caseId, paymentId } = await params;
  try {
    const payment = await deletePayment(user.id, user.chamberId, caseId, paymentId);
    return successResponse(payment, "Payment record removed from registry.");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to remove payment record.";
    return apiErrors.SERVER_ERROR(message, error);
  }
}
