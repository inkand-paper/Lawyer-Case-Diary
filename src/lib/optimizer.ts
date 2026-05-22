/**
 * Optimizer Suite Integration
 * Triggers cache revalidation in the Next.js UI tier.
 *
 * IMPORTANT: Both functions are intentionally fire-and-forget.
 * Cache revalidation must NEVER block or slow down API responses.
 * If the optimizer is down, mutations still succeed.
 */

export const revalidateTag = (tag: string): void => {
  if (!process.env.OPTIMIZER_URL || !process.env.OPTIMIZER_KEY) {
    // Silently skip in dev — warn only once at startup is enough
    return;
  }

  fetch(process.env.OPTIMIZER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPTIMIZER_KEY}`,
    },
    body: JSON.stringify({ tag }),
  }).catch((err) => {
    console.error(`[OPTIMIZER] Failed for tag [${tag}]:`, err);
  });
  // No await — intentional fire-and-forget
};

/**
 * Batch revalidation — fires all in parallel, none blocking the caller.
 */
export const revalidateTags = (tags: string[]): void => {
  tags.forEach((tag) => revalidateTag(tag));
};
