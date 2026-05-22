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
  name: z.string().min(2, "Legal name must be at least 2 characters.").max(100, "Name too long."),
  email: z.string().email("A valid email address is required."),
  // Password complexity: min 8, must contain uppercase, lowercase, and number
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password too long.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
});

// ─── Date Transformer ─────────────────────────────────────────
const dateTransform = z
  .string()
  .transform((val, ctx) => {
    if (!val || val.trim() === "") return undefined;

    // Strict ISO check: require time component for professional precision
    const date = new Date(val);
    if (isNaN(date.getTime()) || !val.includes("T")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid format. Professional records require a full date and time (ISO protocol).",
      });
      return z.NEVER;
    }
    return date.toISOString();
  });

// ─── Client Registry ──────────────────────────────────────────
export const clientSchema = z.object({
  name: z.string().min(2, "Client name must be at least 2 characters.").max(200, "Name too long."),
  phone: z.string().max(30, "Phone number too long.").optional(),
  email: z.string().email().max(254).optional().or(z.literal("")),
  address: z.string().max(500, "Address too long.").optional(),
});

export const clientUpdateSchema = clientSchema.partial();

// ─── Case Registry ─────────────────────────────────────────────
export const caseSchema = z.object({
  title: z.string().min(2, "Case title must be at least 2 characters.").max(300, "Title too long."),
  caseNumber: z.string().min(1, "Ref number is required.").max(100, "Case number too long."),
  courtName: z.string().min(2, "Court name is required.").max(200, "Court name too long."),
  judgeName: z.string().max(200).optional(),
  clientId: z.string().min(1, "Client must be selected."),
  description: z.string().max(5000, "Description too long.").optional(),
  status: z.enum(["ACTIVE", "CLOSED"]).optional(),
  isChamberCase: z.boolean().optional(),
});

export const caseUpdateSchema = caseSchema.partial();

// ─── Hearing Timeline ──────────────────────────────────────────
export const hearingSchema = z.object({
  caseId: z.string().min(1, "Case selection required."),
  hearingDate: dateTransform.refine((val) => val !== undefined, {
    message: "A primary hearing date is required.",
  }),
  nextDate: dateTransform.optional(),
  notes: z.string().max(2000, "Notes too long.").optional(),
});

export const hearingUpdateSchema = hearingSchema.partial();

// ─── User Profile ──────────────────────────────────────────────
export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().max(254).optional(),
});

/**
 * Chamber Validation
 */
export const chamberSchema = z.object({
  name: z.string().min(2, "Chamber name must be at least 2 characters.").max(200, "Name too long."),
});

/**
 * Invitation Validation
 */
export const invitationSchema = z.object({
  email: z.string().email("Invalid professional email address.").max(254),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});
