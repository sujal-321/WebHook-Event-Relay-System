import { Worker } from "bullmq";
import axios from "axios";
import crypto from "crypto";

import { db } from "../db/index.js";
import { events } from "../db/schema/events.js";
import { deliveryLogs } from "../db/schema/deliveryLogs.js";
import { eq } from "drizzle-orm";

import redisConfig from "../config/redis.config.js";

new Worker(
  "event-delivery",
  async (job) => {
    const { eventId, webhook } = job.data;

    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId));

    const signature = crypto
      .createHmac("sha256", webhook.secret)
      .update(JSON.stringify(event.payload))
      .digest("hex");

    const res = await axios.post(webhook.endpointUrl, event.payload, {
      headers: {
        "X-AlgoHire-Signature": signature,
      },
    });

    await db.insert(deliveryLogs).values({
      eventId,
      webhookId: webhook.id,
      status: "success",
      responseCode: res.status,
      retryCount: job.attemptsMade,
    });
  },
  redisConfig
);

console.log("🚀 Delivery worker started");
