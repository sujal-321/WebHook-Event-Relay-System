const express = require('express');
const cors = require ('cors');
const eventRoutes = require("./routes/events.routes");
const webhookRoutes = require("./routes/webhooks.routes");



const app = express();

app.use(cors());
app.use(express.json());

app.use("/events", eventRoutes);
app.use("/webhooks", webhookRoutes);
const pool = require("./db/postgres");

app.get("/logs", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         id,
         event_id,
         webhook_id,
         status,
         retry_count,
         response_code,
         last_attempt
       FROM delivery_logs
       ORDER BY last_attempt DESC
       LIMIT 50`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Logs fetch error:", err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});
app.post("/test-webhook", (req, res) => {
  console.log("✅ Webhook received locally!");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);

  res.status(200).json({ received: true });
});



module.exports = app;
