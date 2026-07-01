import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

// JWT_SECRET is validated at startup in db.ts — safe to assert non-null here.
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export const hashPassword = async (password: string) => {
  // Cost 12 is the current recommendation for legal/sensitive applications.
  // Cost 10 is crackable by modern GPUs in seconds.
  return await bcrypt.hash(password, 12);
};

export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

export const signToken = async (payload: Record<string, unknown>) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h") // Short-lived Access Token (1 hour)
    .sign(JWT_SECRET);
};

export const signRefreshToken = async (payload: Record<string, unknown>) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Long-lived Refresh Token (7 days)
    .sign(JWT_SECRET);
};

export const verifyToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
};
