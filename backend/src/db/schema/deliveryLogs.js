import { pgTable, uuid, varchar, integer, timestamp } from "drizzle-orm/pg-core";

export const deliveryLogs = pgTable("delivery_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").notNull(),
  webhookId: uuid("webhook_id").notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  retryCount: integer("retry_count").default(0),
  responseCode: integer("response_code"),
  lastAttempt: timestamp("last_attempt").defaultNow(),
});
