import { db } from "../db/index.js";
import { events } from "../db/schema/events.js";
import { webhook_subscriptions } from "../db/schema/webhooks.js";
import { eq } from "drizzle-orm";
import eventQueue from "../queue/event.queue.js";
import redisClient from "../cache/redis.js";
import logger from "../logger/index.js";

export const createEvent = async (req, res) => {
  try {
    const { event_type, payload, idempotency_key } = req.body;

    if (!event_type || !idempotency_key) {
      logger.warn("Create event failed: missing fields", req.body);
      return res.status(400).json({ error: "Missing required fields" });
    }

    logger.info(`Creating event: ${event_type}`);

    // 🔁 Idempotency check
    const existing = await db
      .select()
      .from(events)
      .where(eq(events.idempotencyKey, idempotency_key));

    if (existing.length) {
      logger.info(`Duplicate event ignored: ${idempotency_key}`);
      return res.json({ message: "Duplicate event ignored" });
    }

    // 💾 Insert event
    const [event] = await db
      .insert(events)
      .values({
        eventType: event_type,
        payload,
        idempotencyKey: idempotency_key,
      })
      .returning();

    logger.info(`Event created`, { eventId: event.id });

    // 📦 Fetch subscribers (cache-first is optional later)
    const subscriptions = await db
      .select()
      .from(webhook_subscriptions)
      .where(eq(webhook_subscriptions.eventType, event_type));

    logger.info(`Found ${subscriptions.length} subscriptions`);

    // 🚀 Queue delivery jobs
    for (const webhook of subscriptions) {
      await eventQueue.add("deliver", {
        eventId: event.id,
        webhook,
      });

      logger.info("Queued webhook delivery", {
        eventId: event.id,
        webhookId: webhook.id,
      });
    }

    res.status(201).json({ event_id: event.id });
  } catch (err) {
    logger.error("Create event error", err);
    res.status(500).json({ error: "Failed to create event" });
  }
};
