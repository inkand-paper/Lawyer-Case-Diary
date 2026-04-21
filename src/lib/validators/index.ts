import { z } from "zod";

/**
 * Professional Zod Validation Schemas
 * All schemas exported in both strict (create) and partial (update) variants.
 */

// --- Authentication ---
export const loginSchema = z.object({
  email: z.string().email("A valid email address is required."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Legal name must be at least 2 characters."),
  email: z.string().email("A valid email address is required."),
  password: z.string().min(8, "Password must be at least 8 characters for professional security."),
});

// --- Client Directory ---
export const clientSchema = z.object({
  name: z.string().min(2, "Client name must be at least 2 characters."),
  phone: z.string().optional(),
  email: z.string().email("A valid email address is required.").optional().or(z.literal("")),
  address: z.string().optional(),
});

/** Partial schema for PATCH/PUT updates - all fields optional */
export const clientUpdateSchema = clientSchema.partial();

// --- Case Registry ---
export const caseSchema = z.object({
  title: z.string().min(2, "Case title must be at least 2 characters."),
  caseNumber: z.string().min(1, "Case number is required."),
  courtName: z.string().min(2, "Court name is required."),
  judgeName: z.string().optional(),
  clientId: z.string().min(1, "A valid client must be selected."),
  description: z.string().optional(),
  status: z.string().optional(),
});

/** Partial schema for PATCH/PUT updates - all fields optional */
export const caseUpdateSchema = caseSchema.partial();

// --- Hearing Timeline ---
export const hearingSchema = z.object({
  caseId: z.string().min(1, "A valid case must be selected."),
  hearingDate: z.string().datetime({ message: "A valid ISO datetime is required (e.g. 2025-01-15T10:00:00.000Z)." }),
  nextDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

/** Partial schema for PATCH/PUT updates - all fields optional */
export const hearingUpdateSchema = hearingSchema.partial();
