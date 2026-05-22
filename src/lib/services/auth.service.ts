import db from "@/lib/db";
import crypto from "crypto";
import { signToken } from "@/lib/auth";

/**
 * Professional Authentication & Security Service
 * SOLID Principle: Single Responsibility
 */

export const generateApiKey = async (userId: string, name: string) => {
  const rawKey = `lcd_${crypto.randomBytes(24).toString("hex")}`;
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  const newKey = await db.apiKey.create({
    data: {
      userId,
      name,
      keyHash
    }
  });

  return { ...newKey, rawKey };
};

export const revokeApiKey = async (userId: string, id: string) => {
  return await db.apiKey.delete({
    where: { id, userId }
  });
};

export const registerUser = async (data: {
  name: string;
  email: string;
  passwordHash: string;
  verificationToken: string;
  verificationTokenExpiry: Date;
}) => {
  return await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      emailVerified: false,
      verificationToken: data.verificationToken,
      verificationTokenExpiry: data.verificationTokenExpiry,
    },
  });
};

/**
 * Creates and persists a new Refresh Token for a user.
 */
export const createRefreshToken = async (userId: string) => {
  const token = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await db.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    }
  });

  return token;
};

/**
 * Validates an old Refresh Token and issues a new pair (Rotation).
 * SOLID: S (Single Responsibility for session cycling)
 */
export const rotateRefreshToken = async (oldToken: string) => {
  const tokenRecord = await db.refreshToken.findUnique({
    where: { token: oldToken },
    include: { user: true }
  });

  if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
    if (tokenRecord) await db.refreshToken.delete({ where: { id: tokenRecord.id } });
    throw new Error("Invalid or expired refresh token.");
  }

  // 1. Delete the used token (Rotation)
  await db.refreshToken.delete({ where: { id: tokenRecord.id } });

  // 2. Generate new pair
  const accessToken = await signToken({ userId: tokenRecord.userId, email: tokenRecord.user.email });
  const newRefreshToken = await createRefreshToken(tokenRecord.userId);

  return { accessToken, refreshToken: newRefreshToken, user: tokenRecord.user };
};
