const { v4: uuidv4 } = require("uuid");
const pool = require("../db/postgres");
const eventQueue = require("../queue/event.queue");
const { getSubscriptionsByEvent } = require("../services/subscription.service");

exports.createEvent = async (req, res) => {
  try {
    const { event_type, payload, idempotency_key } = req.body;

    // 1️⃣ Basic validation
    if (!event_type || !idempotency_key) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // 2️⃣ Idempotency check
    const existing = await pool.query(
      "SELECT id FROM events WHERE idempotency_key = $1",
      [idempotency_key]
    );

    if (existing.rows.length > 0) {
      return res.status(200).json({
        message: "Duplicate event ignored",
        event_id: existing.rows[0].id
      });
    }

    // 3️⃣ Create event ID
    const eventId = uuidv4();

    // 4️⃣ Save event to DB
    await pool.query(
      `INSERT INTO events (id, event_type, payload, idempotency_key)
       VALUES ($1, $2, $3, $4)`,
      [eventId, event_type, payload || {}, idempotency_key]
    );

    // 5️⃣ Fetch active webhook subscriptions
    const subscriptions = await getSubscriptionsByEvent(event_type);
    console.log("Creating event:", event_type);


    // 6️⃣ Push delivery jobs to Redis queue
    for (const webhook of subscriptions) {
        console.log("Queueing job for webhook:", webhook.id);
      await eventQueue.add("deliver", {
        eventId,
        webhook
      });
    }
    console.log("Subscriptions found:", subscriptions.length);


    // 7️⃣ Respond
    res.status(201).json({
      event_id: eventId,
      deliveries_queued: subscriptions.length
    });
  } catch (err) {
    console.error("Create Event Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
