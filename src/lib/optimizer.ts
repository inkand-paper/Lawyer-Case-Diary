/**
 * Optimizer Suite Integration
 * Triggers instant cache revalidation in the Next.js UI tier.
 */

export const revalidateTag = async (tag: string) => {
  if (!process.env.OPTIMIZER_URL || !process.env.OPTIMIZER_KEY) {
    console.warn("⚠️ Optimizer not configured. Skipping revalidation for tag:", tag);
    return;
  }

  try {
    const res = await fetch(process.env.OPTIMIZER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPTIMIZER_KEY}`,
      },
      body: JSON.stringify({ tag }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ Optimizer failed for tag [${tag}]:`, errorText);
    } else {
      console.log(`⚡ Optimizer triggered successfully for tag: ${tag}`);
    }
  } catch (err) {
    console.error(`❌ Optimizer error for tag [${tag}]:`, err);
  }
};

/**
 * Batch revalidation utility
 */
export const revalidateTags = async (tags: string[]) => {
  await Promise.all(tags.map((tag) => revalidateTag(tag)));
};
