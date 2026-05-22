/**
 * Environment Variable Validation
 * Validates all required env vars at startup.
 * Throws a fatal error if any are missing — prevents silent misconfiguration.
 */

const REQUIRED_ENV_VARS = [
  "DATABASE_URL",
  "JWT_SECRET",
  "NEXT_PUBLIC_APP_URL",
] as const;

// Optional but warned about
const RECOMMENDED_ENV_VARS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_ULTIMATE_PRICE_ID",
  "STRIPE_PREMIUM_PRICE_ID",
  "RESEND_API_KEY",
] as const;

export function validateEnv() {
  const missing: string[] = [];

  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `FATAL: Missing required environment variables:\n  ${missing.join("\n  ")}\n\nSet these in your .env file or deployment environment before starting.`
    );
  }

  // Warn about recommended vars
  for (const varName of RECOMMENDED_ENV_VARS) {
    if (!process.env[varName]) {
      console.warn(`[ENV] ⚠️  Recommended env var not set: ${varName}`);
    }
  }
}

// Validate immediately when this module is imported in production
if (process.env.NODE_ENV === "production") {
  validateEnv();
}
