import { describe, it, expect } from "vitest";
import { registerSchema, clientSchema, hearingSchema } from "./index";

describe("Validation Schemas", () => {
  describe("registerSchema", () => {
    it("validates a correct professional registration", () => {
      const validData = {
        name: "John Doe",
        email: "john@example.com",
        password: "securepassword123",
      };
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects short passwords", () => {
      const invalidData = {
        name: "John",
        email: "john@example.com",
        password: "short",
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Password must be at least 8 characters"
        );
      }
    });

    it("rejects invalid email formats", () => {
      const invalidData = {
        name: "John",
        email: "not-an-email",
        password: "securepassword123",
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("clientSchema", () => {
    it("validates a complete client record", () => {
      const validData = {
        name: "Acme Corp",
        email: "contact@acme.com",
        phone: "1234567890",
        address: "123 Main St",
      };
      expect(clientSchema.safeParse(validData).success).toBe(true);
    });

    it("allows optional fields to be omitted", () => {
      const validData = { name: "Acme Corp" }; // Only name is min 2
      expect(clientSchema.safeParse(validData).success).toBe(true);
    });

    it("allows an empty string for optional email", () => {
      const validData = { name: "Acme Corp", email: "" }; // allowed by .or(z.literal(""))
      expect(clientSchema.safeParse(validData).success).toBe(true);
    });
  });

  describe("hearingSchema", () => {
    it("requires a valid ISO datetime for hearingDate", () => {
      const invalidData = { caseId: "123", hearingDate: "2025-01-15" }; // Missing time/Z
      expect(hearingSchema.safeParse(invalidData).success).toBe(false);

      const validData = {
        caseId: "123",
        hearingDate: "2025-01-15T10:00:00.000Z",
      };
      expect(hearingSchema.safeParse(validData).success).toBe(true);
    });
  });
});
