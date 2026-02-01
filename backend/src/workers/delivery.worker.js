require("dotenv").config();

const { Worker } = require("bullmq");
const redisConfig = require("../config/redis.config");
const axios = require("axios");
const crypto = require("crypto");
const pool = require("../db/postgres");

new Worker(
  "event-delivery",
  async (job) => {
    console.log("🔄 Processing job:", job.data);

    const { eventId, webhook } = job.data;

    try {
      // 1️⃣ Fetch event payload
      const eventRes = await pool.query(
        "SELECT payload FROM events WHERE id = $1",
        [eventId]
      );

      if (eventRes.rows.length === 0) {
        throw new Error("Event not found in DB");
      }

      const payload = eventRes.rows[0].payload;

      // 2️⃣ Generate HMAC signature
      const signature = crypto
        .createHmac("sha256", webhook.secret)
        .update(JSON.stringify(payload))
        .digest("hex");

      console.log("➡️ Sending webhook to:", webhook.endpoint_url);

      // 3️⃣ Send webhook
      const res = await axios.post(
        webhook.endpoint_url,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "X-AlgoHire-Signature": signature
          },
          timeout: 5000,
          validateStatus: () => true // do not throw on non-2xx
        }
      );

      console.log("📡 Webhook HTTP status:", res.status);

      // 4️⃣ Insert delivery log (SAFE, NO DB FUNCTIONS)
      try {
        await pool.query(
          `INSERT INTO delivery_logs
           (id, event_id, webhook_id, status, response_code, retry_count)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            crypto.randomUUID(),
            eventId,
            webhook.id,
            res.status >= 200 && res.status < 300 ? "success" : "failed",
            res.status,
            job.attemptsMade
          ]
        );

        console.log("✅ delivery_logs INSERT SUCCESS");
      } catch (dbErr) {
        console.error("❌ delivery_logs INSERT FAILED");
        console.error("Message:", dbErr.message);
        console.error("Detail:", dbErr.detail);
      }

    } catch (err) {
      console.error("❌ Worker failed:", err.message);
    }
  },
  redisConfig
);

console.log("🚀 Delivery worker started");
