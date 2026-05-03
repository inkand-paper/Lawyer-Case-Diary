import { z } from "zod";

/**
 * ============================================================
 * Professional Zod Validation Schemas
 * Normalises browser datetime-local inputs to ISO strings.
 * Handles optional dates by treating empty strings as undefined.
 * ============================================================
 */

// ─── Authentication ───────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email("A valid email address is required."),
  password: z.string().min(1, "Password is required."),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Legal name must be at least 2 characters."),
  email: z.string().email("A valid email address is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

// ─── Date Transformer ─────────────────────────────────────────
const dateTransform = z
  .string()
  .transform((val, ctx) => {
    if (!val || val.trim() === "") return undefined;
    const date = new Date(val);
    if (isNaN(date.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid date format. Please select a valid date.",
      });
      return z.NEVER;
    }
    return date.toISOString();
  });

// ─── Client Registry ──────────────────────────────────────────
export const clientSchema = z.object({
  name: z.string().min(2, "Client name must be at least 2 characters."),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
});

export const clientUpdateSchema = clientSchema.partial();

// ─── Case Registry ─────────────────────────────────────────────
export const caseSchema = z.object({
  title: z.string().min(2, "Case title must be at least 2 characters."),
  caseNumber: z.string().min(1, "Ref number is required."),
  courtName: z.string().min(2, "Court name is required."),
  judgeName: z.string().optional(),
  clientId: z.string().min(1, "Client must be selected."),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "CLOSED"]).optional(),
});

export const caseUpdateSchema = caseSchema.partial();

// ─── Hearing Timeline ──────────────────────────────────────────
export const hearingSchema = z.object({
  caseId: z.string().min(1, "Case selection required."),
  hearingDate: dateTransform.refine(val => val !== undefined, {
    message: "A primary hearing date is required."
  }),
  nextDate: dateTransform.optional(),
  notes: z.string().optional(),
});

export const hearingUpdateSchema = hearingSchema.partial();

// ─── User Profile ──────────────────────────────────────────────
export const profileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
});

/**
 * Chamber Validation
 */
export const chamberSchema = z.object({
  name: z.string().min(2, "Chamber name must be at least 2 characters."),
});

/**
 * Invitation Validation
 */
export const invitationSchema = z.object({
  email: z.string().email("Invalid professional email address."),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});
