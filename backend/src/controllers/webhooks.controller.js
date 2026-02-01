const { v4: uuidv4 } = require("uuid");
const pool = require("../db/postgres");
const redisClient = require("../cache/redis");

exports.registerWebhook = async (req, res) => {
  try {
    const { client_name, event_type, endpoint_url } = req.body;

    // 🔎 Debug (you can remove later)
    console.log("Incoming body:", req.body);

    if (!client_name || !event_type || !endpoint_url) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const id = uuidv4();
    const secret = uuidv4();

    await pool.query(
      `INSERT INTO webhook_subscriptions
       (id, client_name, event_type, endpoint_url, secret)
       VALUES ($1,$2,$3,$4,$5)`,
      [id, client_name, event_type, endpoint_url, secret]
    );

    // Clear cache for this event type
    await redisClient.del(`subscriptions:${event_type}`);

    res.status(201).json({
      webhook_id: id,
      secret
    });
  } catch (err) {
    console.error("Register webhook error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
