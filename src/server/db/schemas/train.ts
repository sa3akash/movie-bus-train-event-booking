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

// --- OPERATORS / LINES (e.g., Bangladesh Railway) ---
export const trainOperators = pgTable(
  "train_operators",
  {
    ...defaultColumns,
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    code: varchar("code", { length: 20 }).notNull().unique(), // e.g., "BR"
    isActive: boolean("is_active").notNull().default(true),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [index("idx_train_operators_slug").on(table.slug)],
);

// --- COACH TYPES (Global Blueprints like Shovon, Snigdha, AC Berth) ---
export const coachTypes = pgTable(
  "coach_types",
  {
    ...defaultColumns,
    name: varchar("name", { length: 255 }).notNull(), // e.g., "AC Chair", "Sleeper Berth", "Shovon Elegance"
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    code: varchar("code", { length: 10 }).notNull().unique(), // e.g., "SNIGDHA", "AC_B"
    description: text("description"),
    totalSeats: integer("total_seats").notNull().default(0),
    seatLayout: jsonb("seat_layout").$type<{
      rows: number;
      columns: number;
      seats: {
        row: string;
        seatNumber: string; // e.g., "A-1", "B-12"
        type: "window" | "aisle" | "middle" | "upper_berth" | "lower_berth";
      }[];
    }>(),
  },
  (table) => [index("idx_coach_types_slug").on(table.slug)],
);

// --- TRAINS (The physical or named locomotives) ---
export const trainsTable = pgTable(
  "trains",
  {
    ...defaultColumns,
    trainNumber: varchar("train_number", { length: 50 }).notNull().unique(), // e.g., "701" (Suborno Express)
    name: varchar("name", { length: 255 }).notNull(), // e.g., "Suborno Express"
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    operatorId: varchar("operator_id", { length: 36 })
      .notNull()
      .references(() => trainOperators.id),
    status: varchar("status", { length: 50 }).notNull().default("ACTIVE"), // ACTIVE, MAINTENANCE, OUT_OF_SERVICE
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("idx_trains_number").on(table.trainNumber),
    index("idx_trains_slug").on(table.slug),
  ],
);

// --- TRAIN COACHES (The structural individual cars attached to a train) ---
export const trainCoaches = pgTable(
  "train_coaches",
  {
    ...defaultColumns,
    trainId: varchar("train_id", { length: 36 })
      .notNull()
      .references(() => trainsTable.id, { onDelete: "cascade" }),
    coachTypeId: varchar("coach_type_id", { length: 36 })
      .notNull()
      .references(() => coachTypes.id),
    coachName: varchar("coach_name", { length: 50 }).notNull(), // e.g., "KA", "KHA", "COACH-A"
    sequenceOrder: integer("sequence_order").notNull().default(1), // Physical order arrangement in the train line
    isActive: boolean("is_active").default(true),
  },
  (table) => [index("idx_train_coaches_train_id").on(table.trainId)],
);

// --- TRAIN SEATS (Individual inventory structural items) ---
export const trainSeats = pgTable(
  "train_seats",
  {
    ...defaultColumns,
    coachId: varchar("coach_id", { length: 36 })
      .notNull()
      .references(() => trainCoaches.id, { onDelete: "cascade" }),
    seatNumber: varchar("seat_number", { length: 20 }).notNull(), // e.g., "A-1"

    row: varchar("row", { length: 10 }).notNull(), // e.g., "Cabin-1", "Row-A"

    // Tracks vertical stacking in Sleeper coaches:
    // 1 = Floor/Lower, 2 = Middle, 3 = Upper
    berthLevel: integer("berth_level").default(1).notNull(),

    // Geometric Canvas Metrics (Relative to the specific coach dimensions)
    posX: decimal("pos_x", { precision: 10, scale: 2 }).default("0").notNull(),
    posY: decimal("pos_y", { precision: 10, scale: 2 }).default("0").notNull(),
    rotation: decimal("rotation", { precision: 5, scale: 2 })
      .default("0")
      .notNull(),

    isAccessible: boolean("is_accessible").default(false).notNull(),
    isActive: boolean("is_active").default(true),
  },
  (table) => [
    index("idx_train_seats_layout").on(table.coachId, table.berthLevel),
  ],
);

// --- GEOGRAPHY (Stations replaces Locations) ---
export const stationsTable = pgTable(
  "stations",
  {
    ...defaultColumns,
    name: varchar("name", { length: 255 }).notNull(), // e.g., "Kamalapur Railway Station"
    code: varchar("code", { length: 20 }).notNull().unique(), // e.g., "DAC", "CTG"
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    city: varchar("city", { length: 100 }).notNull(),
    latitude: decimal("latitude", { precision: 10, scale: 8 }),
    longitude: decimal("longitude", { precision: 11, scale: 8 }),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => [
    index("idx_stations_code").on(table.code),
    index("idx_stations_slug").on(table.slug),
  ],
);

// --- ROUTES ---
export const trainRoutes = pgTable(
  "train_routes",
  {
    ...defaultColumns,
    name: varchar("name", { length: 255 }).notNull(), // e.g., "Dhaka - Chittagong Line"
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    originStationId: varchar("origin_station_id", { length: 36 })
      .notNull()
      .references(() => stationsTable.id),
    destinationStationId: varchar("destination_station_id", { length: 36 })
      .notNull()
      .references(() => stationsTable.id),
    distanceKm: decimal("distance_km", { precision: 10, scale: 2 }),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => [
    index("idx_train_routes_origin").on(table.originStationId),
    index("idx_train_routes_destination").on(table.destinationStationId),
  ],
);

// --- TRIP INSTANCE RUNTIME SCHEDULES ---
export const trainTrips = pgTable(
  "train_trips",
  {
    ...defaultColumns,
    routeId: varchar("route_id", { length: 36 })
      .notNull()
      .references(() => trainRoutes.id),
    trainId: varchar("train_id", { length: 36 })
      .notNull()
      .references(() => trainsTable.id),
    departureTime: timestamp("departure_time", {
      withTimezone: true,
    }).notNull(),
    arrivalTime: timestamp("arrival_time", { withTimezone: true }).notNull(),
    status: varchar("status", { length: 50 }).notNull().default("SCHEDULED"), // SCHEDULED, DELAYED, CANCELLED, ARRIVED
    basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(), // Base rate for distance floor
  },
  (table) => [
    index("idx_train_trips_train_id").on(table.trainId),
    index("idx_train_trips_departure").on(table.departureTime),
  ],
);

// --- TICKETS / MASTER TRANSACTIONS ---
export const trainBookings = pgTable(
  "train_bookings",
  {
    ...defaultColumns,
    tripId: varchar("trip_id", { length: 36 })
      .notNull()
      .references(() => trainTrips.id),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => usersTable.id),
    pnr: varchar("pnr", { length: 20 }).notNull().unique(), // The Passenger Name Record (Ticket ID)
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    paymentStatus: varchar("payment_status", { length: 50 })
      .notNull()
      .default("PENDING"), // PENDING, PAID, FAILED
    status: varchar("status", { length: 50 }).notNull().default("CONFIRMED"), // CONFIRMED, CANCELLED
    bookedAt: timestamp("booked_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_train_bookings_trip_id").on(table.tripId),
    index("idx_train_bookings_pnr").on(table.pnr),
  ],
);

// --- SEAT LEVEL ALLOCATIONS ---
export const trainSeatBookings = pgTable(
  "train_seat_bookings",
  {
    ...defaultColumns,
    bookingId: varchar("booking_id", { length: 36 })
      .notNull()
      .references(() => trainBookings.id, { onDelete: "cascade" }),
    seatId: varchar("seat_id", { length: 36 })
      .notNull()
      .references(() => trainSeats.id),
    coachNameSnapshot: varchar("coach_name_snapshot", { length: 50 }).notNull(), // e.g., Cached "KA"
    seatNumberSnapshot: varchar("seat_number_snapshot", {
      length: 20,
    }).notNull(), // e.g., Cached "A-1"
    pricePaid: decimal("price_paid", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => [
    index("idx_train_seat_bookings_master").on(table.bookingId),
    index("idx_train_seat_bookings_seat").on(table.seatId),
  ],
);

// --- ORM RELATIONSHIPS ---
export const trainOperatorsRelations = relations(
  trainOperators,
  ({ many }) => ({
    trains: many(trainsTable),
  }),
);

export const coachTypesRelations = relations(coachTypes, ({ many }) => ({
  coaches: many(trainCoaches),
}));

export const trainsRelations = relations(trainsTable, ({ one, many }) => ({
  operator: one(trainOperators, {
    fields: [trainsTable.operatorId],
    references: [trainOperators.id],
  }),
  coaches: many(trainCoaches),
  trips: many(trainTrips),
}));

export const trainCoachesRelations = relations(
  trainCoaches,
  ({ one, many }) => ({
    train: one(trainsTable, {
      fields: [trainCoaches.trainId],
      references: [trainsTable.id],
    }),
    type: one(coachTypes, {
      fields: [trainCoaches.coachTypeId],
      references: [coachTypes.id],
    }),
    seats: many(trainSeats),
  }),
);

export const trainSeatsRelations = relations(trainSeats, ({ one }) => ({
  coach: one(trainCoaches, {
    fields: [trainSeats.coachId],
    references: [trainCoaches.id],
  }),
}));

export const stationsRelations = relations(stationsTable, ({ many }) => ({
  routesAsOrigin: many(trainRoutes, { relationName: "origin_station" }),
  routesAsDestination: many(trainRoutes, {
    relationName: "destination_station",
  }),
}));

export const trainRoutesRelations = relations(trainRoutes, ({ one, many }) => ({
  originStation: one(stationsTable, {
    fields: [trainRoutes.originStationId],
    references: [stationsTable.id],
    relationName: "origin_station",
  }),
  destinationStation: one(stationsTable, {
    fields: [trainRoutes.destinationStationId],
    references: [stationsTable.id],
    relationName: "destination_station",
  }),
  trips: many(trainTrips),
}));

export const trainTripsRelations = relations(trainTrips, ({ one, many }) => ({
  route: one(trainRoutes, {
    fields: [trainTrips.routeId],
    references: [trainRoutes.id],
  }),
  train: one(trainsTable, {
    fields: [trainTrips.trainId],
    references: [trainsTable.id],
  }),
  bookings: many(trainBookings),
}));

export const trainBookingsRelations = relations(
  trainBookings,
  ({ one, many }) => ({
    trip: one(trainTrips, {
      fields: [trainBookings.tripId],
      references: [trainTrips.id],
    }),
    user: one(usersTable, {
      fields: [trainBookings.userId],
      references: [usersTable.id],
    }),
    seatBookings: many(trainSeatBookings),
  }),
);

export const trainSeatBookingsRelations = relations(
  trainSeatBookings,
  ({ one }) => ({
    booking: one(trainBookings, {
      fields: [trainSeatBookings.bookingId],
      references: [trainBookings.id],
    }),
    seat: one(trainSeats, {
      fields: [trainSeatBookings.seatId],
      references: [trainSeats.id],
    }),
  }),
);
