import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { adCategoryEnum } from "./enum";

export const ads = pgTable("ads", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  title: text("title").notNull(),
  category: adCategoryEnum("category").notNull(),
  uri: text("uri").notNull(),
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
