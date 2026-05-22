import { NextResponse } from "next/server";
import Stripe from "stripe";
import db from "@/lib/db";
import { headers } from "next/headers";
import { logger } from "@/lib/services/logger.service";

// Provide a dummy key during build-time if the env var is missing
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
  apiVersion: "2025-02-24.acacia",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * Maps Stripe price IDs to our internal plan names.
 * Add new price IDs here when you create new plans in the Stripe dashboard.
 */
function resolvePlanFromSession(session: Stripe.Checkout.Session): string {
  const priceId =
    (session as any).line_items?.data?.[0]?.price?.id ?? "";

  if (priceId === process.env.STRIPE_ULTIMATE_PRICE_ID) return "ULTIMATE";
  if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) return "EXECUTIVE";

  // Fallback: detect from metadata if set during checkout session creation
  if (session.metadata?.plan) return session.metadata.plan;

  return "ESSENTIAL";
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature") as string;
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  let event: Stripe.Event;

  // ── Signature Verification ───────────────────────────────────────────────
  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // Log attempted webhook forgeries for security auditing
    logger.error("Stripe webhook signature verification failed", err, {
      ip,
      partialSignature: sig?.substring(0, 30),
    });
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
  }

  // ── Idempotency: skip already-processed events ───────────────────────────
  // Stripe retries webhooks on network failures — we must be idempotent.
  const alreadyProcessed = await db.log.findFirst({
    where: { message: `stripe:${event.id}` },
  });
  if (alreadyProcessed) {
    return NextResponse.json({ received: true, skipped: true });
  }

  // ── Event Handling ───────────────────────────────────────────────────────
  try {
    switch (event.type) {
      // ── Subscription Started / Upgraded ─────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;

        if (!userId) {
          logger.warn("Stripe checkout.session.completed missing client_reference_id", {
            sessionId: session.id,
          });
          break;
        }

        const plan = resolvePlanFromSession(session);

        await db.$transaction([
          db.subscription.upsert({
            where: { userId },
            update: {
              stripeCustomerId: session.customer as string,
              stripeSubId: session.subscription as string,
              status: "active",
              plan,
            },
            create: {
              userId,
              stripeCustomerId: session.customer as string,
              stripeSubId: session.subscription as string,
              status: "active",
              plan,
            },
          }),
          db.user.update({
            where: { id: userId },
            data: { plan },
          }),
        ]);

        logger.info("Subscription activated", { userId, plan, sessionId: session.id });
        break;
      }

      // ── Subscription Cancelled ───────────────────────────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const subscription = await db.subscription.findFirst({
          where: { stripeSubId: sub.id },
        });

        if (!subscription) break;

        await db.$transaction([
          db.subscription.update({
            where: { id: subscription.id },
            data: { status: "canceled", plan: "ESSENTIAL" },
          }),
          db.user.update({
            where: { id: subscription.userId },
            data: { plan: "ESSENTIAL" },
          }),
        ]);

        logger.warn("Subscription cancelled — user downgraded to ESSENTIAL", {
          userId: subscription.userId,
          stripeSubId: sub.id,
        });
        break;
      }

      // ── Payment Failed ───────────────────────────────────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const stripeCustomerId = invoice.customer as string;

        const subscription = await db.subscription.findFirst({
          where: { stripeCustomerId },
        });

        if (subscription) {
          await db.subscription.update({
            where: { id: subscription.id },
            data: { status: "past_due" },
          });

          logger.warn("Stripe payment failed — subscription marked past_due", {
            userId: subscription.userId,
            stripeCustomerId,
          });
        }
        break;
      }

      default:
        // Unhandled event types are fine — log with low priority
        logger.info(`Stripe webhook received (unhandled): ${event.type}`, {
          eventId: event.id,
        });
    }

    // Mark event as processed (idempotency record via existing Log table)
    logger.info(`stripe:${event.id}`, { type: event.type });

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Stripe webhook handler failed", error, { eventId: event.id, type: event.type });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
