import { Worker } from "bullmq";
import axios from "axios";
import crypto from "crypto";

import { db } from "../db/index.js";
import { events } from "../db/schema/events.js";
import { deliveryLogs } from "../db/schema/deliveryLogs.js";
import { eq } from "drizzle-orm";

import redisConfig from "../config/redis.config.js";
import logger from "../logger/index.js";

const worker = new Worker(
  "event-delivery",
  async (job) => {
    const { eventId, webhook } = job.data;

    try {
      logger.info("Processing delivery job", {
        jobId: job.id,
        eventId,
        webhookId: webhook.id,
        attempt: job.attemptsMade + 1,
      });

      // 🔎 Fetch event payload
      const [event] = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId));

      if (!event) {
        throw new Error(`Event not found: ${eventId}`);
      }

      // 🔐 Generate HMAC signature
      const signature = crypto
        .createHmac("sha256", webhook.secret)
        .update(JSON.stringify(event.payload))
        .digest("hex");

      // 🚀 Deliver webhook
      const response = await axios.post(webhook.endpointUrl, event.payload, {
        headers: {
          "Content-Type": "application/json",
          "X-AlgoHire-Signature": signature,
        },
        timeout: 5000,
      });

      // 📝 Log success
      await db.insert(deliveryLogs).values({
        eventId,
        webhookId: webhook.id,
        status: "success",
        responseCode: response.status,
        retryCount: job.attemptsMade,
      });

      logger.info("Webhook delivered successfully", {
        eventId,
        webhookId: webhook.id,
        status: response.status,
      });
    } catch (err) {
      logger.error("Webhook delivery failed", {
        jobId: job.id,
        eventId,
        webhookId: webhook.id,
        error: err.message,
      });

      // 📝 Log failure
      await db.insert(deliveryLogs).values({
        eventId,
        webhookId: webhook.id,
        status: "failed",
        responseCode: err.response?.status ?? null,
        retryCount: job.attemptsMade,
      });

      // ❗ IMPORTANT: rethrow to allow BullMQ retry
      throw err;
    }
  },
  redisConfig
);

worker.on("failed", (job, err) => {
  logger.warn("Job failed and will retry", {
    jobId: job.id,
    attempts: job.attemptsMade,
    error: err.message,
  });
});

worker.on("completed", (job) => {
  logger.info("Job completed", {
    jobId: job.id,
  });
});

logger.info("🚀 Delivery worker started");
