import express from "express";
import cors from "cors";

import eventRoutes from "./routes/events.routes.js";
import webhookRoutes from "./routes/webhooks.routes.js";

import { db } from "./db/index.js";
import { deliveryLogs } from "./db/schema/deliveryLogs.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/events", eventRoutes);
app.use("/webhooks", webhookRoutes);

app.get("/logs", async (req, res) => {
  const logs = await db
    .select()
    .from(deliveryLogs)
    .limit(50);

  res.json(logs);
});

app.post("/test-webhook", (req, res) => {
  console.log("✅ Webhook received locally!");
  res.json({ received: true });
});

export default app;
