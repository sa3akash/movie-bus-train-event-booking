CREATE TABLE "bus_brands" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"logo_url" varchar(500),
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "bus_brands_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "bus_trips" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"route_id" varchar(36) NOT NULL,
	"bus_id" varchar(36) NOT NULL,
	"departure_time" timestamp with time zone NOT NULL,
	"arrival_time" timestamp with time zone NOT NULL,
	"status" varchar(50) DEFAULT 'SCHEDULED' NOT NULL,
	"base_price" numeric(10, 2) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bus_types" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"is_ac" boolean DEFAULT false NOT NULL,
	"total_seats" integer DEFAULT 0 NOT NULL,
	"seat_layout" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "bus_types_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "buses_booking" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"trip_id" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"booking_pnr" varchar(20) NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"payment_status" varchar(50) DEFAULT 'PENDING' NOT NULL,
	"status" varchar(50) DEFAULT 'CONFIRMED' NOT NULL,
	"booked_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "buses_booking_booking_pnr_unique" UNIQUE("booking_pnr")
);
--> statement-breakpoint
CREATE TABLE "buses_seats" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"bus_id" varchar(36) NOT NULL,
	"seat_type_id" varchar(36),
	"row" varchar(10) NOT NULL,
	"seat_number" integer NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"pos_x" numeric(10, 2) DEFAULT '0' NOT NULL,
	"pos_y" numeric(10, 2) DEFAULT '0' NOT NULL,
	"rotation" numeric(5, 2) DEFAULT '0' NOT NULL,
	"is_accessible" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "buses_seat_booking" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"booking_id" varchar(36) NOT NULL,
	"seat_id" varchar(36) NOT NULL,
	"seat_number" varchar(10) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"status" varchar(50) DEFAULT 'CONFIRMED' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bus_seat_types" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"capacity" integer DEFAULT 1 NOT NULL,
	"price_multiplier" numeric(3, 2) DEFAULT '1.00',
	"color" varchar(10) DEFAULT '#FFD700',
	"bus_type_id" varchar(36) NOT NULL,
	CONSTRAINT "bus_seat_types_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "buses" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"registration_no" varchar(255) NOT NULL,
	"brand_id" varchar(36) NOT NULL,
	"type_id" varchar(36) NOT NULL,
	"model" varchar(255),
	"year" integer,
	"features" jsonb DEFAULT '[]'::jsonb,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'ACTIVE' NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "buses_registration_no_unique" UNIQUE("registration_no"),
	CONSTRAINT "buses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "counter_staff" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"counter_id" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"role" varchar(50) DEFAULT 'STAFF' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "counters" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"location_id" varchar(36) NOT NULL,
	"brand_id" varchar(36) NOT NULL,
	"address" text,
	"contact_phone" varchar(20),
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "counters_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"type" varchar(50) DEFAULT 'CITY' NOT NULL,
	"parent_location_id" varchar(36),
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "locations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "routes" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"origin_id" varchar(36) NOT NULL,
	"destination_id" varchar(36) NOT NULL,
	"distance_km" numeric(10, 2),
	"estimated_duration_mins" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "routes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "coach_types" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"code" varchar(10) NOT NULL,
	"description" text,
	"total_seats" integer DEFAULT 0 NOT NULL,
	"seat_layout" jsonb,
	CONSTRAINT "coach_types_slug_unique" UNIQUE("slug"),
	CONSTRAINT "coach_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "stations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(20) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"city" varchar(100) NOT NULL,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "stations_code_unique" UNIQUE("code"),
	CONSTRAINT "stations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "train_bookings" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"trip_id" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"pnr" varchar(20) NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"payment_status" varchar(50) DEFAULT 'PENDING' NOT NULL,
	"status" varchar(50) DEFAULT 'CONFIRMED' NOT NULL,
	"booked_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "train_bookings_pnr_unique" UNIQUE("pnr")
);
--> statement-breakpoint
CREATE TABLE "train_coaches" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"train_id" varchar(36) NOT NULL,
	"coach_type_id" varchar(36) NOT NULL,
	"coach_name" varchar(50) NOT NULL,
	"sequence_order" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "train_operators" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"code" varchar(20) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "train_operators_slug_unique" UNIQUE("slug"),
	CONSTRAINT "train_operators_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "train_routes" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"origin_station_id" varchar(36) NOT NULL,
	"destination_station_id" varchar(36) NOT NULL,
	"distance_km" numeric(10, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "train_routes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "train_seat_bookings" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"booking_id" varchar(36) NOT NULL,
	"seat_id" varchar(36) NOT NULL,
	"coach_name_snapshot" varchar(50) NOT NULL,
	"seat_number_snapshot" varchar(20) NOT NULL,
	"price_paid" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "train_seats" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"coach_id" varchar(36) NOT NULL,
	"seat_number" varchar(20) NOT NULL,
	"row" varchar(10) NOT NULL,
	"berth_level" integer DEFAULT 1 NOT NULL,
	"pos_x" numeric(10, 2) DEFAULT '0' NOT NULL,
	"pos_y" numeric(10, 2) DEFAULT '0' NOT NULL,
	"rotation" numeric(5, 2) DEFAULT '0' NOT NULL,
	"is_accessible" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "train_trips" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"route_id" varchar(36) NOT NULL,
	"train_id" varchar(36) NOT NULL,
	"departure_time" timestamp with time zone NOT NULL,
	"arrival_time" timestamp with time zone NOT NULL,
	"status" varchar(50) DEFAULT 'SCHEDULED' NOT NULL,
	"base_price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trains" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"train_number" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"operator_id" varchar(36) NOT NULL,
	"status" varchar(50) DEFAULT 'ACTIVE' NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "trains_train_number_unique" UNIQUE("train_number"),
	CONSTRAINT "trains_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "event_bookings" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"show_id" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"booking_reference" varchar(20) NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"payment_status" varchar(50) DEFAULT 'PENDING' NOT NULL,
	"status" varchar(50) DEFAULT 'CONFIRMED' NOT NULL,
	"booked_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "event_bookings_booking_reference_unique" UNIQUE("booking_reference")
);
--> statement-breakpoint
CREATE TABLE "event_organizers" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"website" varchar(255),
	"contact_email" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "event_organizers_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "event_shows" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"event_id" varchar(36) NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"doors_open_time" timestamp with time zone,
	"status" varchar(50) DEFAULT 'SCHEDULED' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_tickets" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"booking_id" varchar(36) NOT NULL,
	"ticket_tier_id" varchar(36) NOT NULL,
	"venue_seat_id" varchar(36),
	"ticket_code" varchar(100) NOT NULL,
	"is_checked_in" boolean DEFAULT false NOT NULL,
	"checked_in_at" timestamp,
	"price_paid" numeric(10, 2) NOT NULL,
	CONSTRAINT "event_tickets_ticket_code_unique" UNIQUE("ticket_code")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"organizer_id" varchar(36) NOT NULL,
	"venue_id" varchar(36) NOT NULL,
	"banner_url" varchar(500),
	"status" varchar(50) DEFAULT 'DRAFT' NOT NULL,
	"category" varchar(100),
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ticket_tiers" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"event_id" varchar(36) NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"max_capacity" integer NOT NULL,
	"seat_assignment_type" varchar(50) DEFAULT 'OPEN_FLOOR' NOT NULL,
	"per_user_limit" integer DEFAULT 4 NOT NULL,
	"sales_start_time" timestamp with time zone,
	"sales_end_time" timestamp with time zone,
	CONSTRAINT "ticket_tiers_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "venue_seats" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"venue_id" varchar(36) NOT NULL,
	"ticket_tier_id" varchar(36),
	"row" varchar(10) NOT NULL,
	"seat_number" integer NOT NULL,
	"pos_x" numeric(10, 2) DEFAULT '0' NOT NULL,
	"pos_y" numeric(10, 2) DEFAULT '0' NOT NULL,
	"rotation" numeric(5, 2) DEFAULT '0' NOT NULL,
	"is_accessible" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "venues" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"address" text,
	"city" varchar(100) NOT NULL,
	"country" varchar(100) NOT NULL,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"max_capacity" integer NOT NULL,
	CONSTRAINT "venues_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "bus_trips" ADD CONSTRAINT "bus_trips_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bus_trips" ADD CONSTRAINT "bus_trips_bus_id_buses_id_fk" FOREIGN KEY ("bus_id") REFERENCES "public"."buses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buses_booking" ADD CONSTRAINT "buses_booking_trip_id_bus_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."bus_trips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buses_booking" ADD CONSTRAINT "buses_booking_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buses_seats" ADD CONSTRAINT "buses_seats_bus_id_buses_id_fk" FOREIGN KEY ("bus_id") REFERENCES "public"."buses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buses_seats" ADD CONSTRAINT "buses_seats_seat_type_id_bus_seat_types_id_fk" FOREIGN KEY ("seat_type_id") REFERENCES "public"."bus_seat_types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buses_seat_booking" ADD CONSTRAINT "buses_seat_booking_booking_id_buses_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."buses_booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buses_seat_booking" ADD CONSTRAINT "buses_seat_booking_seat_id_buses_seats_id_fk" FOREIGN KEY ("seat_id") REFERENCES "public"."buses_seats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bus_seat_types" ADD CONSTRAINT "bus_seat_types_bus_type_id_bus_types_id_fk" FOREIGN KEY ("bus_type_id") REFERENCES "public"."bus_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buses" ADD CONSTRAINT "buses_brand_id_bus_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."bus_brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buses" ADD CONSTRAINT "buses_type_id_bus_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."bus_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "counter_staff" ADD CONSTRAINT "counter_staff_counter_id_counters_id_fk" FOREIGN KEY ("counter_id") REFERENCES "public"."counters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "counter_staff" ADD CONSTRAINT "counter_staff_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "counters" ADD CONSTRAINT "counters_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "counters" ADD CONSTRAINT "counters_brand_id_bus_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."bus_brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_origin_id_locations_id_fk" FOREIGN KEY ("origin_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_destination_id_locations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "train_bookings" ADD CONSTRAINT "train_bookings_trip_id_train_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."train_trips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "train_bookings" ADD CONSTRAINT "train_bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "train_coaches" ADD CONSTRAINT "train_coaches_train_id_trains_id_fk" FOREIGN KEY ("train_id") REFERENCES "public"."trains"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "train_coaches" ADD CONSTRAINT "train_coaches_coach_type_id_coach_types_id_fk" FOREIGN KEY ("coach_type_id") REFERENCES "public"."coach_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "train_routes" ADD CONSTRAINT "train_routes_origin_station_id_stations_id_fk" FOREIGN KEY ("origin_station_id") REFERENCES "public"."stations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "train_routes" ADD CONSTRAINT "train_routes_destination_station_id_stations_id_fk" FOREIGN KEY ("destination_station_id") REFERENCES "public"."stations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "train_seat_bookings" ADD CONSTRAINT "train_seat_bookings_booking_id_train_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."train_bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "train_seat_bookings" ADD CONSTRAINT "train_seat_bookings_seat_id_train_seats_id_fk" FOREIGN KEY ("seat_id") REFERENCES "public"."train_seats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "train_seats" ADD CONSTRAINT "train_seats_coach_id_train_coaches_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."train_coaches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "train_trips" ADD CONSTRAINT "train_trips_route_id_train_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."train_routes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "train_trips" ADD CONSTRAINT "train_trips_train_id_trains_id_fk" FOREIGN KEY ("train_id") REFERENCES "public"."trains"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trains" ADD CONSTRAINT "trains_operator_id_train_operators_id_fk" FOREIGN KEY ("operator_id") REFERENCES "public"."train_operators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_bookings" ADD CONSTRAINT "event_bookings_show_id_event_shows_id_fk" FOREIGN KEY ("show_id") REFERENCES "public"."event_shows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_bookings" ADD CONSTRAINT "event_bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_shows" ADD CONSTRAINT "event_shows_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_tickets" ADD CONSTRAINT "event_tickets_booking_id_event_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."event_bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_tickets" ADD CONSTRAINT "event_tickets_ticket_tier_id_ticket_tiers_id_fk" FOREIGN KEY ("ticket_tier_id") REFERENCES "public"."ticket_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_tickets" ADD CONSTRAINT "event_tickets_venue_seat_id_venue_seats_id_fk" FOREIGN KEY ("venue_seat_id") REFERENCES "public"."venue_seats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_event_organizers_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."event_organizers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_tiers" ADD CONSTRAINT "ticket_tiers_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "venue_seats" ADD CONSTRAINT "venue_seats_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "venue_seats" ADD CONSTRAINT "venue_seats_ticket_tier_id_ticket_tiers_id_fk" FOREIGN KEY ("ticket_tier_id") REFERENCES "public"."ticket_tiers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_bus_brands_name" ON "bus_brands" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_bus_brands_slug" ON "bus_brands" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_bus_brands_is_active" ON "bus_brands" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_bus_trips_route_id" ON "bus_trips" USING btree ("route_id");--> statement-breakpoint
CREATE INDEX "idx_bus_trips_bus_id" ON "bus_trips" USING btree ("bus_id");--> statement-breakpoint
CREATE INDEX "idx_bus_trips_departure_time" ON "bus_trips" USING btree ("departure_time");--> statement-breakpoint
CREATE INDEX "idx_bus_types_name" ON "bus_types" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_bus_types_slug" ON "bus_types" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_buses_booking_trip_id" ON "buses_booking" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "idx_buses_booking_user_id" ON "buses_booking" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_buses_seats_bus_layout" ON "buses_seats" USING btree ("bus_id","level");--> statement-breakpoint
CREATE INDEX "idx_buses_seat_booking_booking_id" ON "buses_seat_booking" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "idx_buses_seat_booking_seat_id" ON "buses_seat_booking" USING btree ("seat_id");--> statement-breakpoint
CREATE INDEX "idx_bus_seat_types_bus_type_id" ON "bus_seat_types" USING btree ("bus_type_id");--> statement-breakpoint
CREATE INDEX "idx_buses_registration_no" ON "buses" USING btree ("registration_no");--> statement-breakpoint
CREATE INDEX "idx_buses_slug" ON "buses" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_buses_brand_id" ON "buses" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "idx_buses_type_id" ON "buses" USING btree ("type_id");--> statement-breakpoint
CREATE INDEX "idx_counter_staff_counter_id" ON "counter_staff" USING btree ("counter_id");--> statement-breakpoint
CREATE INDEX "idx_counters_location_id" ON "counters" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "idx_counters_brand_id" ON "counters" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "idx_locations_slug" ON "locations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_routes_origin_id" ON "routes" USING btree ("origin_id");--> statement-breakpoint
CREATE INDEX "idx_routes_destination_id" ON "routes" USING btree ("destination_id");--> statement-breakpoint
CREATE INDEX "idx_coach_types_slug" ON "coach_types" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_stations_code" ON "stations" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_stations_slug" ON "stations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_train_bookings_trip_id" ON "train_bookings" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "idx_train_bookings_pnr" ON "train_bookings" USING btree ("pnr");--> statement-breakpoint
CREATE INDEX "idx_train_coaches_train_id" ON "train_coaches" USING btree ("train_id");--> statement-breakpoint
CREATE INDEX "idx_train_operators_slug" ON "train_operators" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_train_routes_origin" ON "train_routes" USING btree ("origin_station_id");--> statement-breakpoint
CREATE INDEX "idx_train_routes_destination" ON "train_routes" USING btree ("destination_station_id");--> statement-breakpoint
CREATE INDEX "idx_train_seat_bookings_master" ON "train_seat_bookings" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "idx_train_seat_bookings_seat" ON "train_seat_bookings" USING btree ("seat_id");--> statement-breakpoint
CREATE INDEX "idx_train_seats_layout" ON "train_seats" USING btree ("coach_id","berth_level");--> statement-breakpoint
CREATE INDEX "idx_train_trips_train_id" ON "train_trips" USING btree ("train_id");--> statement-breakpoint
CREATE INDEX "idx_train_trips_departure" ON "train_trips" USING btree ("departure_time");--> statement-breakpoint
CREATE INDEX "idx_trains_number" ON "trains" USING btree ("train_number");--> statement-breakpoint
CREATE INDEX "idx_trains_slug" ON "trains" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_event_bookings_show_id" ON "event_bookings" USING btree ("show_id");--> statement-breakpoint
CREATE INDEX "idx_event_bookings_user_id" ON "event_bookings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_event_organizers_slug" ON "event_organizers" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_event_shows_event_id" ON "event_shows" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_event_shows_start" ON "event_shows" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "idx_event_tickets_booking" ON "event_tickets" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "idx_event_tickets_tier" ON "event_tickets" USING btree ("ticket_tier_id");--> statement-breakpoint
CREATE INDEX "idx_event_tickets_code" ON "event_tickets" USING btree ("ticket_code");--> statement-breakpoint
CREATE INDEX "idx_events_slug" ON "events" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_events_organizer" ON "events" USING btree ("organizer_id");--> statement-breakpoint
CREATE INDEX "idx_ticket_tiers_event_id" ON "ticket_tiers" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_venue_seats_coords" ON "venue_seats" USING btree ("venue_id","pos_x","pos_y");--> statement-breakpoint
CREATE INDEX "idx_venue_seats_tier" ON "venue_seats" USING btree ("ticket_tier_id");--> statement-breakpoint
CREATE INDEX "idx_venues_slug" ON "venues" USING btree ("slug");