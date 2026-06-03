import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const videos = pgTable("videos", {
  id: varchar("id", { length: 128 })
    .$defaultFn(() => createId())
    .primaryKey(),
  originalKey: text("original_key").notNull(),
  originalUrl: text("original_url").notNull(),
  status: varchar("status", { length: 32 }).notNull().default("PENDING"), // PENDING, PROCESSING, COMPLETED, FAILED
  resolutions: jsonb("resolutions").$type<string[]>(),
  hlsUrl: text("hls_url"),
  dashUrl: text("dash_url"),
  duration: varchar("duration", { length: 32 }),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
