import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import db from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";
import type { User } from "@/lib/types";

// Mock out our database and auth services
vi.mock("@/lib/db", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    log: {
      create: vi.fn().mockResolvedValue({}),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  hashPassword: vi.fn(),
  signToken: vi.fn(),
}));

// The route only reads id/name/email off the returned user; mocks only need
// to satisfy that subset. Cast through `unknown` (not `any`) since the real
// Prisma User type has many more required fields than these fixtures need.
type MockUser = Pick<User, "id" | "name" | "email">;
const asUser = (u: MockUser): User => u as unknown as User;

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns BAD_REQUEST if validation fails", async () => {
    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: "bad" }), // Missing required name and proper password
    });

    const response = await POST(req);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("BAD_REQUEST");
  });

  it("returns BAD_REQUEST if email is already taken", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValueOnce(asUser({
      id: "1",
      name: "Existing User",
      email: "test@example.com",
    }));

    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "John",
        email: "test@example.com",
        password: "Password123",
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.message).toContain("already registered");
  });

  it("creates user securely and returns 201 Created on success", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValueOnce(null);
    vi.mocked(hashPassword).mockResolvedValueOnce("hashed_pwd");
    vi.mocked(db.user.create).mockResolvedValueOnce(asUser({
      id: "123",
      name: "John",
      email: "test@example.com",
    }));
    vi.mocked(signToken).mockResolvedValueOnce("mock_jwt_token");

    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "John",
        email: "test@example.com",
        password: "Password123",
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(201);

    const json = await response.json();
    expect(json.data.token).toBe("mock_jwt_token");
    expect(json.data.id).toBe("123");

    // Ensure the token cookie is actually being set
    const cookies = response.headers.get("set-cookie");
    expect(cookies).toContain("token=mock_jwt_token");
  });
});


