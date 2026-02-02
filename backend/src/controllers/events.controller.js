import { db } from "../db/index.js";
import { events } from "../db/schema/events.js";
import { webhook_subscriptions } from "../db/schema/webhooks.js";
import { eq } from "drizzle-orm";
import eventQueue from "../queue/event.queue.js";
import redisClient from "../cache/redis.js";

export const createEvent = async (req, res) => {
  try {
    const { event_type, payload, idempotency_key } = req.body;

    if (!event_type || !idempotency_key) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 🔁 Idempotency check
    const existing = await db
      .select()
      .from(events)
      .where(eq(events.idempotencyKey, idempotency_key));

    if (existing.length) {
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

    // 📦 Fetch subscribers
    const subscriptions = await db
      .select()
      .from(webhook_subscriptions)
      .where(eq(webhook_subscriptions.eventType, event_type));

    // 🚀 Queue delivery jobs
    for (const webhook of subscriptions) {
      await eventQueue.add("deliver", {
        eventId: event.id,
        webhook,
      });
    }

    res.status(201).json({ event_id: event.id });
  } catch (err) {
    console.error("Create event error:", err);
    res.status(500).json({ error: "Failed to create event" });
  }
};
