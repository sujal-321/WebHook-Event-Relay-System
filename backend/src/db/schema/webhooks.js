import { pgTable, uuid, varchar, boolean, timestamp } from "drizzle-orm/pg-core";

export const webhook_subscriptions = pgTable("webhook_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),

  clientName: varchar("client_name", { length: 100 }).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  endpointUrl: varchar("endpoint_url", { length: 255 }).notNull(),
  secret: varchar("secret", { length: 255 }).notNull(),

  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});
