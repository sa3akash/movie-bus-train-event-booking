import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { defaultColumns } from "./defaultKey";
import { relations } from "drizzle-orm";
import { usersTable } from "./users";

// --- ORGANIZERS / HOSTS ---
export const eventOrganizers = pgTable(
  "event_organizers",
  {
    ...defaultColumns,
    name: varchar("name", { length: 255 }).notNull(), // e.g., "Live Nation", "TechCon Corp"
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    website: varchar("website", { length: 255 }),
    contactEmail: varchar("contact_email", { length: 255 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => [
    index("idx_event_organizers_slug").on(table.slug),
  ],
);

// --- VENUES (Physical or Virtual Locations) ---
export const venuesTable = pgTable(
  "venues",
  {
    ...defaultColumns,
    name: varchar("name", { length: 255 }).notNull(), // e.g., "Madison Square Garden", "Zoom"
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    address: text("address"),
    city: varchar("city", { length: 100 }).notNull(),
    country: varchar("country", { length: 100 }).notNull(),
    latitude: decimal("latitude", { precision: 10, scale: 8 }),
    longitude: decimal("longitude", { precision: 11, scale: 8 }),
    maxCapacity: integer("max_capacity").notNull(), // Total safety threshold
  },
  (table) => [
    index("idx_venues_slug").on(table.slug),
  ],
);

// --- EVENTS (The Master Listing) ---
export const eventsTable = pgTable(
  "events",
  {
    ...defaultColumns,
    title: varchar("title", { length: 255 }).notNull(), // e.g., "Rock Fest 2026"
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    organizerId: varchar("organizer_id", { length: 36 }).notNull().references(() => eventOrganizers.id),
    venueId: varchar("venue_id", { length: 36 }).notNull().references(() => venuesTable.id),
    bannerUrl: varchar("banner_url", { length: 500 }),
    status: varchar("status", { length: 50 }).notNull().default("DRAFT"), // DRAFT, PUBLISHED, POSTPONED, CANCELLED
    category: varchar("category", { length: 100 }), // e.g., CONCERT, CONFERENCE, SPORTS
  },
  (table) => [
    index("idx_events_slug").on(table.slug),
    index("idx_events_organizer").on(table.organizerId),
  ],
);

// --- EVENT PERFORMANCES / SHOWTIMES (For multi-day or multi-slot events) ---
export const eventShows = pgTable(
  "event_shows",
  {
    ...defaultColumns,
    eventId: varchar("event_id", { length: 36 }).notNull().references(() => eventsTable.id, { onDelete: "cascade" }),
    startTime: timestamp("start_time", { withTimezone: true }).notNull(),
    endTime: timestamp("end_time", { withTimezone: true }).notNull(),
    doorsOpenTime: timestamp("doors_open_time", { withTimezone: true }),
    status: varchar("status", { length: 50 }).notNull().default("SCHEDULED"), // SCHEDULED, LIVE, COMPLETED, DELAYED
  },
  (table) => [
    index("idx_event_shows_event_id").on(table.eventId),
    index("idx_event_shows_start").on(table.startTime),
  ],
);

// --- TICKET TIERS & ACCESS LEVELS ---
export const ticketTiers = pgTable(
  "ticket_tiers",
  {
    ...defaultColumns,
    eventId: varchar("event_id", { length: 36 }).notNull().references(() => eventsTable.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(), // e.g., "VIP Backstage Pass", "General Admission"
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    maxCapacity: integer("max_capacity").notNull(), // Maximum tickets sellable for this tier
    seatAssignmentType: varchar("seat_assignment_type", { length: 50 }).notNull().default("OPEN_FLOOR"), // OPEN_FLOOR (GA) or ASSIGNED (Specific Seats)
    perUserLimit: integer("per_user_limit").default(4).notNull(), // Prevent scalping
    salesStartTime: timestamp("sales_start_time", { withTimezone: true }),
    salesEndTime: timestamp("sales_end_time", { withTimezone: true }),
  },
  (table) => [
    index("idx_ticket_tiers_event_id").on(table.eventId),
  ],
);

// --- VENUE SEATS (Only utilized if tier assignment type is 'ASSIGNED') ---
export const venueSeats = pgTable(
  "venue_seats",
  {
    ...defaultColumns,
    venueId: varchar("venue_id", { length: 36 })
      .notNull()
      .references(() => venuesTable.id, { onDelete: "cascade" }),
    
    // Links the coordinate block directly to a pricing/access tier
    ticketTierId: varchar("ticket_tier_id", { length: 36 })
      .references(() => ticketTiers.id, { onDelete: "cascade" }),

    row: varchar("row", { length: 10 }).notNull(),             // e.g., "A", "VIP-Front"
    seatNumber: integer("seat_number").notNull(),              // e.g., 101, 102
    
    // Canvas Positioning Metrics (Relative to Venue Container Viewport)
    posX: decimal("pos_x", { precision: 10, scale: 2 }).default("0").notNull(),
    posY: decimal("pos_y", { precision: 10, scale: 2 }).default("0").notNull(),
    rotation: decimal("rotation", { precision: 5, scale: 2 }).default("0").notNull(), // Degree curves
    
    isAccessible: boolean("is_accessible").default(false).notNull(), // ADA Compliance
    isActive: boolean("is_active").default(true),
  },
  (table) => [
    index("idx_venue_seats_coords").on(table.venueId, table.posX, table.posY),
    index("idx_venue_seats_tier").on(table.ticketTierId),
  ],
);

// --- BOOKINGS / ORDER HEADERS ---
export const eventBookings = pgTable(
  "event_bookings",
  {
    ...defaultColumns,
    showId: varchar("show_id", { length: 36 }).notNull().references(() => eventShows.id),
    userId: varchar("user_id", { length: 36 }).notNull().references(() => usersTable.id),
    bookingReference: varchar("booking_reference", { length: 20 }).notNull().unique(), // Order ID / Booking Ref
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    paymentStatus: varchar("payment_status", { length: 50 }).notNull().default("PENDING"), // PENDING, PAID, REFUNDED
    status: varchar("status", { length: 50 }).notNull().default("CONFIRMED"), // CONFIRMED, CANCELLED
    bookedAt: timestamp("booked_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_event_bookings_show_id").on(table.showId),
    index("idx_event_bookings_user_id").on(table.userId),
  ],
);

// --- TICKET LEVEL LINE ITEMS (The individual entry tokens) ---
export const eventTickets = pgTable(
  "event_tickets",
  {
    ...defaultColumns,
    bookingId: varchar("booking_id", { length: 36 }).notNull().references(() => eventBookings.id, { onDelete: "cascade" }),
    ticketTierId: varchar("ticket_tier_id", { length: 36 }).notNull().references(() => ticketTiers.id),
    venueSeatId: varchar("venue_seat_id", { length: 36 }).references(() => venueSeats.id), // Nullable if Open Floor / GA
    ticketCode: varchar("ticket_code", { length: 100 }).notNull().unique(), // The secure cryptographic string for the QR code scanning
    isCheckedIn: boolean("is_checked_in").default(false).notNull(), // Gate access verification tracker
    checkedInAt: timestamp("checked_in_at"),
    pricePaid: decimal("price_paid", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => [
    index("idx_event_tickets_booking").on(table.bookingId),
    index("idx_event_tickets_tier").on(table.ticketTierId),
    index("idx_event_tickets_code").on(table.ticketCode),
  ],
);


// --- RELATIONS ---
export const eventOrganizersRelations = relations(eventOrganizers, ({ many }) => ({
  events: many(eventsTable),
}));

export const venuesRelations = relations(venuesTable, ({ many }) => ({
  events: many(eventsTable),
  seats: many(venueSeats),
}));

export const eventsRelations = relations(eventsTable, ({ one, many }) => ({
  organizer: one(eventOrganizers, { fields: [eventsTable.organizerId], references: [eventOrganizers.id] }),
  venue: one(venuesTable, { fields: [eventsTable.venueId], references: [venuesTable.id] }),
  shows: many(eventShows),
  tiers: many(ticketTiers),
}));

export const eventShowsRelations = relations(eventShows, ({ one, many }) => ({
  event: one(eventsTable, { fields: [eventShows.eventId], references: [eventsTable.id] }),
  bookings: many(eventBookings),
}));

export const ticketTiersRelations = relations(ticketTiers, ({ one, many }) => ({
  event: one(eventsTable, { fields: [ticketTiers.eventId], references: [eventsTable.id] }),
  tickets: many(eventTickets),
}));

export const venueSeatsRelations = relations(venueSeats, ({ one, many }) => ({
  venue: one(venuesTable, { fields: [venueSeats.venueId], references: [venuesTable.id] }),
  tickets: many(eventTickets),
}));

export const eventBookingsRelations = relations(eventBookings, ({ one, many }) => ({
  show: one(eventShows, { fields: [eventBookings.showId], references: [eventShows.id] }),
  user: one(usersTable, { fields: [eventBookings.userId], references: [usersTable.id] }),
  tickets: many(eventTickets),
}));

export const eventTicketsRelations = relations(eventTickets, ({ one }) => ({
  booking: one(eventBookings, { fields: [eventTickets.bookingId], references: [eventBookings.id] }),
  tier: one(ticketTiers, { fields: [eventTickets.ticketTierId], references: [ticketTiers.id] }),
  seat: one(venueSeats, { fields: [eventTickets.venueSeatId], references: [venueSeats.id] }),
}));