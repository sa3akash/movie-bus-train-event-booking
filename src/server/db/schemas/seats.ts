import { relations } from "drizzle-orm";
import { cinemaScreens, theatersTable } from "./cinemas";
import { defaultColumns } from "./defaultKey";
import {
  boolean,
  decimal,
  index,
  integer,
  pgTable,
  varchar,
} from "drizzle-orm/pg-core";
import { seatStatusEnum } from "./enum";
import { shows } from "./movie";
import { bookings } from "./booking";
import { wishlist } from "./reviews";

export const seatType = pgTable("seat_type", {
  ...defaultColumns,
  name: varchar("name", { length: 10 }).notNull(),
  capacity: integer("capacity").notNull().default(1),
  priceMultiplier: decimal("price_multiplier", {
    precision: 3,
    scale: 2,
  }).default("1.00"),
  price: integer("price").default(0).notNull(),
  color: varchar("color", { length: 10 }).default("#FFD700"),
  currency: varchar("currency", { length: 3 }).default("BDT"),
  theaterId: varchar("theater_id", { length: 36 })
    .notNull()
    .references(() => theatersTable.id, { onDelete: "cascade" }),
}, (table) => [
  index("idx_seat_type_theater_id").on(table.theaterId),
]);

export const seats = pgTable(
  "seats",
  {
    ...defaultColumns,
    screenId: varchar("screen_id", { length: 36 })
      .notNull()
      .references(() => cinemaScreens.id, { onDelete: "cascade" }),
    row: varchar("row", { length: 10 }).notNull(),
    seatNumber: integer("seat_number").notNull(),
    seatTypeId: varchar("seat_type_id", { length: 36 }).references(
      () => seatType.id,
      { onDelete: "cascade" },
    ),
    posX: decimal("pos_x", { precision: 10, scale: 2 }).default("0").notNull(),
    posY: decimal("pos_y", { precision: 10, scale: 2 }).default("0").notNull(),
    isAccessible: boolean("is_accessible").default(false).notNull(),
    rotation: decimal("rotation", { precision: 5, scale: 2 })
      .default("0")
      .notNull(),
    isActive: boolean("is_active").default(true),
  },
  (table) => [
    index("idx_seats_screen_id").on(table.screenId),
    index("idx_seats_row").on(table.row),
    index("idx_seats_seat_type_id").on(table.seatTypeId),
  ],
);

export const showSeats = pgTable(
  "show_seats",
  {
    ...defaultColumns,
    showId: varchar("show_id", { length: 36 })
      .notNull()
      .references(() => shows.id, { onDelete: "cascade" }),
    seatId: varchar("seat_id", { length: 36 })
      .notNull()
      .references(() => seats.id, { onDelete: "cascade" }),
    bookingId: varchar("booking_id", { length: 36 }).references(
      () => bookings.id,
      { onDelete: "set null" },
    ),
    status: seatStatusEnum("status").notNull().default("AVAILABLE"),
  },
  (table) => [
    index("idx_show_seats_show_id").on(table.showId),
    index("idx_show_seats_seat_id").on(table.seatId),
    index("idx_show_seats_booking_id").on(table.bookingId),
  ],
);

export const seatTypeRelations = relations(seatType, ({ many,one }) => ({
  seats: many(seats),
  waitlists: many(wishlist),
  theater: one(theatersTable, {
    fields: [seatType.theaterId],
    references: [theatersTable.id],
  }),
}));

export const seatsRelations = relations(seats, ({ one, many }) => ({
  screen: one(cinemaScreens, {
    fields: [seats.screenId],
    references: [cinemaScreens.id],
  }),
  seatType: one(seatType, {
    fields: [seats.seatTypeId],
    references: [seatType.id],
  }),
  showSeats: many(showSeats),
}));

export const showSeatsRelations = relations(showSeats, ({ one }) => ({
  show: one(shows, {
    fields: [showSeats.showId],
    references: [shows.id],
  }),
  seat: one(seats, {
    fields: [showSeats.seatId],
    references: [seats.id],
  }),
  booking: one(bookings, {
    fields: [showSeats.bookingId],
    references: [bookings.id],
  }),
}));
