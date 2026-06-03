import { integer, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { defaultColumns } from "./defaultKey";

export const images = pgTable("images", {
  ...defaultColumns,
  url: varchar("url", { length: 500 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }),
  size: integer("size"),
  blurhash: text("blurhash"),
  blurhashData: text("blurhash_data"),
  altText: text("alt_text"),
});
