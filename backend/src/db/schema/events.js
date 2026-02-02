import { pgTable, uuid, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  payload: jsonb("payload"),
  idempotencyKey: varchar("idempotency_key", { length: 100 }).unique(),
  createdAt: timestamp("created_at").defaultNow(),
});
