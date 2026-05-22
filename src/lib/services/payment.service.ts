import db from "@/lib/db";
import { revalidateTags } from "@/lib/optimizer";

/**
 * Professional Payment Management Service
 */

const VALID_PAYMENT_METHODS = ["CASH", "CHECK", "CARD", "BANK_TRANSFER"] as const;
type PaymentMethod = (typeof VALID_PAYMENT_METHODS)[number];

export const createPayment = async (
  userId: string,
  chamberId: string | null,
  caseId: string,
  data: { amount: number; method?: string; notes?: string }
) => {
  // Verify case ownership/access
  const caseRecord = await db.case.findFirst({
    where: {
      id: caseId,
      OR: chamberId ? [{ chamberId }, { userId }] : [{ userId }],
    },
  });

  if (!caseRecord) throw new Error("Case not found or access denied.");

  // Sanitize payment method — reject arbitrary strings
  const method: PaymentMethod =
    data.method && VALID_PAYMENT_METHODS.includes(data.method as PaymentMethod)
      ? (data.method as PaymentMethod)
      : "CASH";

  const payment = await db.payment.create({
    data: {
      caseId,
      amount: data.amount,
      paymentDate: new Date(), // FIX: was missing, causing DB errors or null dates
      method,
      status: "COMPLETED",
    },
  });

  revalidateTags([`case:${caseId}`, "dashboard"]);
  return payment;
};

export const deletePayment = async (
  userId: string,
  chamberId: string | null,
  caseId: string,
  paymentId: string
) => {
  // Verify case ownership/access
  const caseRecord = await db.case.findFirst({
    where: {
      id: caseId,
      OR: chamberId ? [{ chamberId }, { userId }] : [{ userId }],
    },
  });

  if (!caseRecord) throw new Error("Case not found or access denied.");

  const deletedPayment = await db.payment.delete({
    where: { id: paymentId, caseId },
  });

  revalidateTags([`case:${caseId}`, "dashboard"]);
  return deletedPayment;
};
