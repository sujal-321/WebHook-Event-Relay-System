import crypto from "crypto";
import { db } from "../db/index.js";
import { webhook_subscriptions } from "../db/schema/webhooks.js";
import redisClient from "../cache/redis.js";

/**
 * POST /webhooks
 */
export const registerWebhook = async (req, res) => {
  try {
    const { client_name, event_type, endpoint_url } = req.body;

    if (!client_name || !event_type || !endpoint_url) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const secret = crypto.randomUUID();

    const [webhook] = await db
      .insert(webhook_subscriptions)
      .values({
        clientName: client_name,
        eventType: event_type,
        endpointUrl: endpoint_url,
        secret,
        isActive: true,
      })
      .returning();

    await redisClient.del(`subscriptions:${event_type}`);

    res.status(201).json({
      webhook_id: webhook.id,
      secret,
    });
  } catch (err) {
    console.error("Register webhook error:", err);
    res.status(500).json({ error: "Failed to register webhook" });
  }
};

/**
 * GET /webhooks
 */
export const getWebhooks = async (_req, res) => {
  try {
    const webhooks = await db.select().from(webhookSubscriptions);
    res.json(webhooks);
  } catch (err) {
    console.error("Get webhooks error:", err);
    res.status(500).json({ error: "Failed to fetch webhooks" });
  }
};
