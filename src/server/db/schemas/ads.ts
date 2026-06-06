import { pgTable, text, timestamp, boolean, integer, varchar, jsonb, numeric } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { adCategoryEnum } from "./enum";

export const ads = pgTable("ads", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  title: text("title").notNull(),
  category: adCategoryEnum("category").notNull(),
  format: text("format").default("video").notNull(), // 'video' or 'image'
  uri: text("uri").notNull(), // URL of the media
  duration: integer("duration").default(0).notNull(), // ad duration in seconds
  
  // Targeting Details
  minAge: integer("min_age"), // Null means no minimum
  maxAge: integer("max_age"), // Null means no maximum
  targetCountries: jsonb("target_countries"), // Array of country codes
  targetGenders: jsonb("target_genders"), // Array of genders
  targetCategories: jsonb("target_categories"), // Content categories to target
  targetDevices: jsonb("target_devices"), // Array: ['desktop', 'mobile', 'tablet']
  
  // Financials
  budget: numeric("budget", { precision: 12, scale: 2 }), // Total budget allocated
  spent: numeric("spent", { precision: 12, scale: 2 }).default("0"), // Total budget spent

  isSkippable: boolean("is_skippable").default(true).notNull(),
  skipOffset: integer("skip_offset").default(5).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const adTracking = pgTable("ad_tracking", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  adId: text("ad_id")
    .notNull()
    .references(() => ads.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 36 }),
  deviceId: text("device_id"),
  event: text("event").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
