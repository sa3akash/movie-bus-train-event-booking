import { createId } from "@paralleldrive/cuid2";
import { timestamp, varchar } from "drizzle-orm/pg-core";

export const generateId = {
  id: varchar("id", { length: 36 })
    .$defaultFn(() => createId())
    .primaryKey(),
};

export const generateTimestamp = {
  createdAt: timestamp("created_at", {
    mode: "date",
  })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
  })
    .$onUpdateFn(() => new Date())
    .$defaultFn(() => new Date())
    .notNull(),
};

export const defaultColumns = {
  ...generateId,
  ...generateTimestamp,
};
