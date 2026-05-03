-- ⚖️ LAWYER CASE DIARY: DATABASE HARDENING SCRIPT (RLS)
-- This script enables Row-Level Security on all tables to prevent public data exposure.

-- 1. Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Client" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Case" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Hearing" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Note" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Reminder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ApiKey" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Log" ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies (Simple Ownership Pattern)
-- Note: These policies are for defense-in-depth on the public PostgREST API.
-- Prisma (Direct Connection) will bypass these, but public attackers will be blocked.

-- USER POLICY
CREATE POLICY "Users can only see themselves" ON "User"
  FOR ALL USING (auth.uid()::text = id);

-- CLIENT POLICY
CREATE POLICY "Lawyers can only see their own clients" ON "Client"
  FOR ALL USING (auth.uid()::text = "userId");

-- CASE POLICY
CREATE POLICY "Lawyers can only see their own cases" ON "Case"
  FOR ALL USING (auth.uid()::text = "userId");

-- REMINDER POLICY
CREATE POLICY "Lawyers can only see their own reminders" ON "Reminder"
  FOR ALL USING (auth.uid()::text = "userId");

-- API KEY POLICY
CREATE POLICY "Lawyers can only see their own API keys" ON "ApiKey"
  FOR ALL USING (auth.uid()::text = "userId");

-- HEARING POLICY (Nested)
CREATE POLICY "Lawyers can see hearings for their cases" ON "Hearing"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "Case" 
      WHERE "Case".id = "Hearing"."caseId" 
      AND "Case"."userId" = auth.uid()::text
    )
  );

-- NOTE POLICY (Nested)
CREATE POLICY "Lawyers can see notes for their cases" ON "Note"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "Case" 
      WHERE "Case".id = "Note"."caseId" 
      AND "Case"."userId" = auth.uid()::text
    )
  );

-- PAYMENT POLICY (Nested)
CREATE POLICY "Lawyers can see payments for their cases" ON "Payment"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "Case" 
      WHERE "Case".id = "Payment"."caseId" 
      AND "Case"."userId" = auth.uid()::text
    )
  );
