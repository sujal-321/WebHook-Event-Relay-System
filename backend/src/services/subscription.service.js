import { db } from "../db/index.js";
import { webhookSubscriptions } from "../db/schema/webhooks.js";
import { eq, and } from "drizzle-orm";
import redisClient from "../cache/redis.js";

export const getSubscriptionsByEvent = async (eventType) => {
  const cacheKey = `subscriptions:${eventType}`;

  // 🔁 Check Redis cache
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // 🧠 Fetch from DB using Drizzle
  const subscriptions = await db
    .select()
    .from(webhookSubscriptions)
    .where(
      and(
        eq(webhookSubscriptions.eventType, eventType),
        eq(webhookSubscriptions.isActive, true)
      )
    );

  // 💾 Cache result (5 minutes)
  await redisClient.setEx(
    cacheKey,
    300,
    JSON.stringify(subscriptions)
  );

  return subscriptions;
};
