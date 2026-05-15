import db from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * Production Idempotency Handler
 * Ensures that if a client sends the same Idempotency-Key twice,
 * they receive the cached response instead of creating duplicate records.
 */

export async function getIdempotentResponse(userId: string, idempotencyKey: string) {
  const record = await db.idempotencyRecord.findUnique({
    where: {
      userId_idempotencyKey: { userId, idempotencyKey }
    }
  });

  if (record) {
    // Check if expired (e.g. 24 hours)
    if (new Date() > record.expiresAt) {
      await db.idempotencyRecord.delete({ where: { id: record.id } });
      return null;
    }
    
    return new NextResponse(record.responseBody, {
      status: record.statusCode,
      headers: {
        "Content-Type": "application/json",
        "X-Idempotency-Cache": "HIT"
      }
    });
  }
  return null;
}

export async function saveIdempotentResponse(
  userId: string, 
  idempotencyKey: string, 
  response: NextResponse
) {
  const responseBody = await response.clone().text();
  const statusCode = response.status;
  
  // Set expiration to 24 hours
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.idempotencyRecord.upsert({
    where: {
      userId_idempotencyKey: { userId, idempotencyKey }
    },
    update: {
      responseBody,
      statusCode,
      expiresAt
    },
    create: {
      userId,
      idempotencyKey,
      responseBody,
      statusCode,
      expiresAt
    }
  });
}
