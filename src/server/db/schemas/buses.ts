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

// --- BRANDS (Operators) ---
export const busBrands = pgTable(
  "bus_brands",
  {
    ...defaultColumns,
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    logoUrl: varchar("logo_url", { length: 500 }),
    isActive: boolean("is_active").notNull().default(true),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("idx_bus_brands_name").on(table.name),
    index("idx_bus_brands_slug").on(table.slug),
    index("idx_bus_brands_is_active").on(table.isActive),
  ],
);

// --- BUS TYPES (Global Layout Blueprints) ---
export const busTypes = pgTable(
  "bus_types",
  {
    ...defaultColumns,
    name: varchar("name", { length: 255 }).notNull(), // e.g., "Sleeper AC", "Seater Non-AC"
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    isAC: boolean("is_ac").notNull().default(false),
    totalSeats: integer("total_seats").notNull().default(0),
    seatLayout: jsonb("seat_layout").$type<{
      rows: number;
      columns: number;
      seats: {
        row: string;
        seatNumber: string; // Changed number to string (e.g., "A1", "B2")
        x: number;
        y: number;
        type?: "seat" | "sleeper" | "empty";
      }[];
    }>(),
    isActive: boolean("is_active").notNull().default(true),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("idx_bus_types_name").on(table.name),
    index("idx_bus_types_slug").on(table.slug),
  ],
);

// --- FLEET (Physical Buses) ---
export const busesTable = pgTable(
  "buses",
  {
    ...defaultColumns,
    registrationNo: varchar("registration_no", { length: 255 }).notNull().unique(),
    brandId: varchar("brand_id", { length: 36 }).notNull().references(() => busBrands.id),
    typeId: varchar("type_id", { length: 36 }).notNull().references(() => busTypes.id),
    model: varchar("model", { length: 255 }),
    year: integer("year"),
    features: jsonb("features").$type<string[]>().default([]),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    status: varchar("status", { length: 50 }).notNull().default("ACTIVE"), // ACTIVE, MAINTENANCE, RETIRED
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("idx_buses_registration_no").on(table.registrationNo),
    index("idx_buses_slug").on(table.slug),
    index("idx_buses_brand_id").on(table.brandId),
    index("idx_buses_type_id").on(table.typeId),
  ],
);

// --- SEAT TYPES (Scoped per Bus Type or globally, here tied to bus type for reuse) ---
export const busesSeatTypes = pgTable(
  "bus_seat_types",
  {
    ...defaultColumns,
    name: varchar("name", { length: 255 }).notNull(), // e.g., "Business Sleeper", "Economy Seater"
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    capacity: integer("capacity").notNull().default(1),
    priceMultiplier: decimal("price_multiplier", { precision: 3, scale: 2 }).default("1.00"),
    color: varchar("color", { length: 10 }).default("#FFD700"),
    // Fixed: Tied to busType instead of physical bus for consistency, or keep if tiering unique fleets.
    busTypeId: varchar("bus_type_id", { length: 36 })
      .notNull()
      .references(() => busTypes.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("idx_bus_seat_types_bus_type_id").on(table.busTypeId),
  ],
);

// --- PHYSICAL SEATS INSTANCES ---
export const busesSeat = pgTable(
  "buses_seats",
  {
    ...defaultColumns,
    busId: varchar("bus_id", { length: 36 })
      .notNull()
      .references(() => busesTable.id, { onDelete: "cascade" }),
    
    seatTypeId: varchar("seat_type_id", { length: 36 })
      .references(() => busesSeatTypes.id, { onDelete: "set null" }),

    row: varchar("row", { length: 10 }).notNull(),             // e.g., "A", "B"
    seatNumber: integer("seat_number").notNull(),              // e.g., 1, 2, 3
    
    // Level supports stacked layouts (1 = Lower Deck / Lower Berth, 2 = Upper Deck / Upper Berth)
    level: integer("level").default(1).notNull(),

    // Geometric Canvas Metrics (Relative to the physical bus shell dimensions)
    posX: decimal("pos_x", { precision: 10, scale: 2 }).default("0").notNull(),
    posY: decimal("pos_y", { precision: 10, scale: 2 }).default("0").notNull(),
    rotation: decimal("rotation", { precision: 5, scale: 2 }).default("0").notNull(), // Handles angled seating
    
    isAccessible: boolean("is_accessible").default(false).notNull(),
    isActive: boolean("is_active").default(true),
  },
  (table) => [
    index("idx_buses_seats_bus_layout").on(table.busId, table.level),
  ],
);

// --- GEOGRAPHY & ROUTES ---
export const locationsTable = pgTable(
  "locations",
  {
    ...defaultColumns,
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    type: varchar("type", { length: 50 }).notNull().default("CITY"), // CITY, BOARDING_POINT
    parentLocationId: varchar("parent_location_id", { length: 36 }), 
    latitude: decimal("latitude", { precision: 10, scale: 8 }),
    longitude: decimal("longitude", { precision: 11, scale: 8 }),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => [
    index("idx_locations_slug").on(table.slug),
  ],
);

export const countersTable = pgTable(
  "counters",
  {
    ...defaultColumns,
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    locationId: varchar("location_id", { length: 36 }).notNull().references(() => locationsTable.id),
    brandId: varchar("brand_id", { length: 36 }).notNull().references(() => busBrands.id),
    address: text("address"),
    contactPhone: varchar("contact_phone", { length: 20 }),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => [
    index("idx_counters_location_id").on(table.locationId),
    index("idx_counters_brand_id").on(table.brandId),
  ],
);

export const counterStaff = pgTable(
  "counter_staff",
  {
    ...defaultColumns,
    counterId: varchar("counter_id", { length: 36 }).notNull().references(() => countersTable.id),
    userId: varchar("user_id", { length: 36 }).notNull().references(() => usersTable.id),
    role: varchar("role", { length: 50 }).notNull().default("STAFF"), // MANAGER, AGENT
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => [
    index("idx_counter_staff_counter_id").on(table.counterId),
  ],
);

export const routesTable = pgTable(
  "routes",
  {
    ...defaultColumns,
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    originId: varchar("origin_id", { length: 36 }).notNull().references(() => locationsTable.id),
    destinationId: varchar("destination_id", { length: 36 }).notNull().references(() => locationsTable.id),
    distanceKm: decimal("distance_km", { precision: 10, scale: 2 }),
    estimatedDurationMins: integer("estimated_duration_mins"),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => [
    index("idx_routes_origin_id").on(table.originId),
    index("idx_routes_destination_id").on(table.destinationId),
  ],
);

// --- SCHEDULING (The actual Trip runtime) ---
export const busTrips = pgTable(
  "bus_trips",
  {
    ...defaultColumns,
    routeId: varchar("route_id", { length: 36 }).notNull().references(() => routesTable.id),
    busId: varchar("bus_id", { length: 36 }).notNull().references(() => busesTable.id),
    departureTime: timestamp("departure_time", { withTimezone: true }).notNull(), // Added Timezone support
    arrivalTime: timestamp("arrival_time", { withTimezone: true }).notNull(),
    status: varchar("status", { length: 50 }).notNull().default("SCHEDULED"), // SCHEDULED, ON_TIME, DELAYED, CANCELLED, COMPLETED
    basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(), // Base rate for the trip
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => [
    index("idx_bus_trips_route_id").on(table.routeId),
    index("idx_bus_trips_bus_id").on(table.busId),
    index("idx_bus_trips_departure_time").on(table.departureTime),
  ],
);

// --- BOOKINGS & RESERVATIONS (Fixed Table Intent) ---
export const busesBooking = pgTable(
  "buses_booking",
  {
    ...defaultColumns,
    tripId: varchar("trip_id", { length: 36 }).notNull().references(() => busTrips.id), // Fixed: Now points to the specific Trip schedule instance
    userId: varchar("user_id", { length: 36 }).notNull().references(() => usersTable.id), // Added: Who is booking?
    bookingPnr: varchar("booking_pnr", { length: 20 }).notNull().unique(), // Added: Custom confirmation code (PNR)
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(), // Added: Total transaction cost
    paymentStatus: varchar("payment_status", { length: 50 }).notNull().default("PENDING"), // Added: PENDING, PAID, REFUNDED
    status: varchar("status", { length: 50 }).notNull().default("CONFIRMED"), // RESERVED, CONFIRMED, CANCELLED
    bookedAt: timestamp("booked_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_buses_booking_trip_id").on(table.tripId),
    index("idx_buses_booking_user_id").on(table.userId),
  ],
);

export const busesSeatBooking = pgTable(
  "buses_seat_booking",
  {
    ...defaultColumns,
    bookingId: varchar("booking_id", { length: 36 }).notNull().references(() => busesBooking.id, { onDelete: "cascade" }),
    seatId: varchar("seat_id", { length: 36 }).notNull().references(() => busesSeat.id),
    seatNumber: varchar("seat_number", { length: 10 }).notNull(), // Cache snapshot for fast lookup
    price: decimal("price", { precision: 10, scale: 2 }).notNull(), // Final calculated price paid for this seat
    status: varchar("status", { length: 50 }).notNull().default("CONFIRMED"), 
  },
  (table) => [
    index("idx_buses_seat_booking_booking_id").on(table.bookingId),
    index("idx_buses_seat_booking_seat_id").on(table.seatId),
  ],
);

// --- RELATIONS ---
export const busBrandsRelations = relations(busBrands, ({ many }) => ({
  buses: many(busesTable),
  counters: many(countersTable),
}));

export const busTypesRelations = relations(busTypes, ({ many }) => ({
  buses: many(busesTable),
  seatTypes: many(busesSeatTypes),
}));

export const busesSeatTypesRelations = relations(busesSeatTypes, ({ one }) => ({
  busType: one(busTypes, {
    fields: [busesSeatTypes.busTypeId],
    references: [busTypes.id],
  }),
}));

export const busesSeatRelations = relations(busesSeat, ({ one }) => ({
  bus: one(busesTable, {
    fields: [busesSeat.busId],
    references: [busesTable.id],
  }),
  seatType: one(busesSeatTypes, {
    fields: [busesSeat.seatTypeId],
    references: [busesSeatTypes.id],
  }),
}));

export const busesRelations = relations(busesTable, ({ one, many }) => ({
  brand: one(busBrands, { fields: [busesTable.brandId], references: [busBrands.id] }),
  type: one(busTypes, { fields: [busesTable.typeId], references: [busTypes.id] }),
  trips: many(busTrips),
  seats: many(busesSeat),
}));

export const locationsRelations = relations(locationsTable, ({ one, many }) => ({
  counters: many(countersTable),
  routesAsOrigin: many(routesTable, { relationName: "origin" }),
  routesAsDestination: many(routesTable, { relationName: "destination" }),
  parent: one(locationsTable, {
    fields: [locationsTable.parentLocationId],
    references: [locationsTable.id],
    relationName: "parentLocation",
  }),
  children: many(locationsTable, { relationName: "parentLocation" }),
}));

export const countersRelations = relations(countersTable, ({ one, many }) => ({
  location: one(locationsTable, { fields: [countersTable.locationId], references: [locationsTable.id] }),
  brand: one(busBrands, { fields: [countersTable.brandId], references: [busBrands.id] }),
  staff: many(counterStaff),
}));

export const counterStaffRelations = relations(counterStaff, ({ one }) => ({
  counter: one(countersTable, { fields: [counterStaff.counterId], references: [countersTable.id] }),
  user: one(usersTable, { fields: [counterStaff.userId], references: [usersTable.id] }),
}));

export const routesRelations = relations(routesTable, ({ one, many }) => ({
  origin: one(locationsTable, { fields: [routesTable.originId], references: [locationsTable.id], relationName: "origin" }),
  destination: one(locationsTable, { fields: [routesTable.destinationId], references: [locationsTable.id], relationName: "destination" }),
  trips: many(busTrips),
}));

export const busTripsRelations = relations(busTrips, ({ one, many }) => ({
  route: one(routesTable, { fields: [busTrips.routeId], references: [routesTable.id] }),
  bus: one(busesTable, { fields: [busTrips.busId], references: [busesTable.id] }),
  bookings: many(busesBooking),
}));

export const busesBookingRelations = relations(busesBooking, ({ one, many }) => ({
  trip: one(busTrips, { fields: [busesBooking.tripId], references: [busTrips.id] }),
  user: one(usersTable, { fields: [busesBooking.userId], references: [usersTable.id] }),
  seatBookings: many(busesSeatBooking),
}));

export const busesSeatBookingRelations = relations(busesSeatBooking, ({ one }) => ({
  booking: one(busesBooking, { fields: [busesSeatBooking.bookingId], references: [busesBooking.id] }),
  seat: one(busesSeat, { fields: [busesSeatBooking.seatId], references: [busesSeat.id] }),
}));