import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

import { defaultColumns } from "./defaultKey";

export const usersTable = pgTable("users", {
  ...defaultColumns,
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});
