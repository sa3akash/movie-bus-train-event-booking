import { boolean, decimal, index, integer, jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { defaultColumns } from "./defaultKey";
import { screenTypeEnum } from "./enum";
import { relations } from "drizzle-orm";
import { shows } from "./movie";
import { seats } from "./seats";

export const cineplexChain = pgTable("cineplex_chain", {
  ...defaultColumns,
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  totalCinemas: integer("total_cinemas").notNull().default(0),
  logoUrl: varchar("logo_url", { length: 500 }),
  website: text("website"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  isActive: boolean("is_active").notNull().default(true),
  deletedAt: timestamp("deleted_at"),
}, (table) => [
  index("idx_cineplex_chain_name").on(table.name),
  index("idx_cineplex_chain_total_cinemas").on(table.totalCinemas),
  index("idx_cineplex_chain_is_active").on(table.isActive),
  index("idx_cineplex_chain_deleted_at").on(table.deletedAt),
]);

export const theatersTable = pgTable("theaters", {
  ...defaultColumns,
  cineplexChainId: varchar("cineplex_chain_id", { length: 36 }).references(() => cineplexChain.id),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  address: text("address"),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  facilities: jsonb('facilities').$type<string[]>().default([]),
  pincode: varchar("pincode", { length: 6 }),
  country: varchar("country", { length: 100 }).notNull().default("Bangladesh"),
  phone: varchar("phone", { length: 15 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 255 }),
  logoUrl: varchar("logo_url", { length: 500 }),
  totalScreens: integer("total_screens").notNull().default(0),
  contactNumber: text("contact_number"),
  parkingAvailable: boolean("parking_available").default(false),
  wheelchairAccessible: boolean("wheelchair_accessible").default(false),
  foodAllowed: boolean("food_allowed").default(true),
  isActive: boolean("is_active").notNull().default(true),
  deletedAt: timestamp("deleted_at"),
}, (table) => [
  index("idx_theaters_city").on(table.city),
  index("idx_theaters_state").on(table.state),
  index("idx_theaters_cineplex_chain_id").on(table.cineplexChainId),
  index("idx_theaters_is_active").on(table.isActive),
  index("idx_theaters_deleted_at").on(table.deletedAt),
]);

export const theaterImages = pgTable("theater_images", {
  ...defaultColumns,
  theaterId: varchar("theater_id", { length: 36 }).notNull().references(() => theatersTable.id),
  src: varchar("src", { length: 500 }).notNull(),
  alt: varchar("alt", { length: 255 }).notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  blurDataURL: varchar("blur_data_url", { length: 500 }),
  blurHash: varchar("blur_hash", { length: 255 }),
});

export const cinemaScreens = pgTable("cinema_screens", {
  ...defaultColumns,
  theatreId: varchar("theatre_id", { length: 36 }).notNull().references(() => theatersTable.id),
  name: varchar("name", { length: 255 }).notNull(),
  screenType: screenTypeEnum("screen_type").notNull().default("STANDARD"),
  totalSeats: integer("total_seats").notNull().default(0),
  seatLayout: jsonb("seat_layout").$type<{
    rows: number;
    columns: number;
    seats: {
      row: string;
      seatNumber: number;
      x: number;
      y: number;
    }[];
  }>(),
  isActive: boolean("is_active").notNull().default(true),
  deletedAt: timestamp("deleted_at"),
}, (table) => [
  index("idx_cinema_screens_theatre_id").on(table.theatreId),
  index("idx_cinema_screens_screen_type").on(table.screenType),
  index("idx_cinema_screens_deleted_at").on(table.deletedAt),
]);

export const cineplexChainRelations = relations(cineplexChain, ({ many }) => ({
  theaters: many(theatersTable),
}));

export const theatersRelations = relations(theatersTable, ({ many, one }) => ({
  screens: many(cinemaScreens),
  cineplexChain: one(cineplexChain, {
    fields: [theatersTable.cineplexChainId],
    references: [cineplexChain.id],
  }),
  images: many(theaterImages)
}));

export const theaterImagesRelations = relations(theaterImages, ({ one }) => ({
  theater: one(theatersTable, {
    fields: [theaterImages.theaterId],
    references: [theatersTable.id],
  }),
}));

export const cinemaScreensRelations = relations(cinemaScreens, ({ one, many }) => ({
  theatre: one(theatersTable, {
    fields: [cinemaScreens.theatreId],
    references: [theatersTable.id],
  }),
  shows: many(shows),
  seats: many(seats),
}));
