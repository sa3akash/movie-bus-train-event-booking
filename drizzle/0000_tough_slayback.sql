CREATE TYPE "public"."booking_status" AS ENUM('CONFIRMED', 'CANCELLED', 'PENDING', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."coupon_discount_type" AS ENUM('PERCENTAGE', 'FIXED');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('MALE', 'FEMALE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."movie_status" AS ENUM('COMING_SOON', 'NOW_SHOWING', 'RELEASED', 'NOT_PLAYING', 'UP_COMING');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('STRIPE', 'CASH', 'BKASH', 'NAGAD', 'MOCK');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."screen_type" AS ENUM('STANDARD', 'IMAX', 'DOLBY', '4DX', 'VIP', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."seat_status" AS ENUM('AVAILABLE', 'BOOKED', 'BLOCKED', 'LOCKED', 'MAINTENANCE', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."show_status" AS ENUM('SCHEDULED', 'CANCELLED', 'ONGOING', 'UPCOMING', 'COMPLETED', 'NOT_PLAYING');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('OPEN', 'CLOSED', 'PENDING', 'IN_PROGRESS', 'RESOLVED');--> statement-breakpoint
CREATE TYPE "public"."user_tier" AS ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND');--> statement-breakpoint
CREATE TYPE "public"."waitlist_status" AS ENUM('ACTIVE', 'NOTIFIED', 'EXPIRED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"key" varchar(150) NOT NULL,
	"module" varchar(100),
	"description" varchar(255),
	CONSTRAINT "permissions_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" varchar(36) NOT NULL,
	"permission_id" varchar(36) NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(255),
	"is_system" boolean DEFAULT false,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" varchar(36) NOT NULL,
	"role_id" varchar(36) NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"refresh_token_hash" varchar(255) NOT NULL,
	"device_id" varchar(100),
	"user_agent" varchar(512),
	"ip_address" varchar(45),
	"expires_at" timestamp with time zone NOT NULL,
	"is_revoked" boolean DEFAULT false,
	CONSTRAINT "user_sessions_refresh_token_hash_unique" UNIQUE("refresh_token_hash")
);
--> statement-breakpoint
CREATE TABLE "user_verification" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"user_id" varchar(36),
	"type" varchar(50) NOT NULL,
	"identifier" varchar(255),
	"code_hash" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"is_email_verified" boolean DEFAULT false,
	"password_hash" varchar(255) NOT NULL,
	"deleted_at" timestamp with time zone,
	"failed_login_attempts" integer DEFAULT 0,
	"locked_until" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "cinema_screens" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"theatre_id" varchar(36) NOT NULL,
	"name" varchar(255) NOT NULL,
	"screen_type" "screen_type" DEFAULT 'STANDARD' NOT NULL,
	"total_seats" integer DEFAULT 0 NOT NULL,
	"seat_layout" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "cineplex_chain" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"total_cinemas" integer DEFAULT 0 NOT NULL,
	"logo_url" varchar(500),
	"website" text,
	"contact_email" text,
	"contact_phone" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "cineplex_chain_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "theater_images" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"theater_id" varchar(36) NOT NULL,
	"src" varchar(500) NOT NULL,
	"alt" varchar(255) NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"blur_data_url" varchar(500),
	"blur_hash" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "theaters" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"cineplex_chain_id" varchar(36),
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"address" text,
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"facilities" jsonb DEFAULT '[]'::jsonb,
	"pincode" varchar(6),
	"country" varchar(100) DEFAULT 'Bangladesh' NOT NULL,
	"phone" varchar(15),
	"email" varchar(255),
	"website" varchar(255),
	"logo_url" varchar(500),
	"total_screens" integer DEFAULT 0 NOT NULL,
	"contact_number" text,
	"parking_available" boolean DEFAULT false,
	"wheelchair_accessible" boolean DEFAULT false,
	"food_allowed" boolean DEFAULT true,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "theaters_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"user_id" varchar(36),
	"event_name" text NOT NULL,
	"event_data" jsonb,
	"page_url" text,
	"referrer" text,
	"session_id" text,
	"ip_address" text,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"user_id" varchar(36),
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" varchar(36),
	"old_data" jsonb,
	"new_data" jsonb,
	"ip_address" text,
	"user_agent" text,
	"request_id" text
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"booking_number" varchar(255) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"show_id" varchar(36) NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"convenience_fee" numeric(10, 2) DEFAULT '0',
	"discount_amount" numeric(10, 2) DEFAULT '0',
	"total_amount" numeric(10, 2) NOT NULL,
	"status" "booking_status" DEFAULT 'PENDING' NOT NULL,
	"coupon_code" text,
	"loyalty_points_used" integer DEFAULT 0,
	"loyalty_points_earned" integer DEFAULT 0,
	"expires_at" timestamp,
	"checked_in" boolean DEFAULT false,
	"checked_in_at" timestamp,
	CONSTRAINT "bookings_booking_number_unique" UNIQUE("booking_number")
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"discount_type" "coupon_discount_type" NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"min_booking_amount" numeric(10, 2),
	"max_discount_amount" numeric(10, 2),
	"valid_from" timestamp NOT NULL,
	"valid_until" timestamp NOT NULL,
	"usage_limit" integer DEFAULT 1,
	"usage_count" integer DEFAULT 0,
	"per_user_limit" integer DEFAULT 1,
	"applicable_movies" text[],
	"applicable_theaters" text[],
	"applicable_payment_methods" "payment_method"[],
	"min_tickets" integer DEFAULT 1,
	"max_tickets" integer,
	"is_active" boolean DEFAULT true,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"payment_number" text NOT NULL,
	"booking_id" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"payment_method" "payment_method",
	"transaction_id" text,
	"gateway" text,
	"gateway_response" jsonb,
	"refund_amount" numeric(10, 2),
	"refund_reason" text,
	"refunded_at" timestamp,
	"failure_reason" text,
	CONSTRAINT "payments_payment_number_unique" UNIQUE("payment_number")
);
--> statement-breakpoint
CREATE TABLE "user_coupons" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"coupon_id" varchar(36) NOT NULL,
	"booking_id" varchar(36),
	"used_at" timestamp DEFAULT now() NOT NULL,
	"discount_amount" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "genres" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "genres_name_unique" UNIQUE("name"),
	CONSTRAINT "genres_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "movie_to_genres" (
	"movie_id" varchar(36) NOT NULL,
	"genre_id" varchar(36) NOT NULL,
	CONSTRAINT "movie_to_genres_movie_id_genre_id_pk" PRIMARY KEY("movie_id","genre_id")
);
--> statement-breakpoint
CREATE TABLE "movies" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"genre" jsonb DEFAULT '[]'::jsonb,
	"language" varchar(50),
	"release_date" timestamp NOT NULL,
	"duration" integer NOT NULL,
	"rating" numeric(3, 2) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"status" "movie_status" DEFAULT 'COMING_SOON' NOT NULL,
	"poster_url" varchar(500),
	"trailer_url" varchar(500),
	"cast" jsonb,
	"crew" jsonb,
	"average_rating" numeric(3, 2),
	"total_reviews" integer DEFAULT 0,
	"is_now_showing" boolean DEFAULT false,
	"is_coming_soon" boolean DEFAULT false,
	"deleted_at" timestamp,
	CONSTRAINT "movies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "shows" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"movie_id" varchar(36) NOT NULL,
	"screen_id" varchar(36) NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"base_price" numeric(10, 2) NOT NULL,
	"status" "show_status" DEFAULT 'SCHEDULED' NOT NULL,
	"available_seats" integer NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "review_likes" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"review_id" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"movie_id" varchar(36) NOT NULL,
	"booking_id" varchar(36),
	"rating" integer NOT NULL,
	"title" text,
	"comment" text,
	"is_verified_purchase" boolean DEFAULT false,
	"likes_count" integer DEFAULT 0,
	"reported_count" integer DEFAULT 0,
	"is_approved" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "reward_transactions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"booking_id" varchar(36),
	"points" integer NOT NULL,
	"type" text NOT NULL,
	"description" text,
	"balance_after" integer NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_rewards" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"lifetime_points" integer DEFAULT 0 NOT NULL,
	"tier" "user_tier" DEFAULT 'BRONZE' NOT NULL,
	"tier_valid_until" timestamp,
	"next_tier_points" integer,
	CONSTRAINT "user_rewards_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "waitlist" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"show_id" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"seat_preference" varchar(36),
	"number_of_seats" integer NOT NULL,
	"status" "waitlist_status" DEFAULT 'ACTIVE' NOT NULL,
	"notified_at" timestamp,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "seat_type" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"name" varchar(10) NOT NULL,
	"capacity" integer DEFAULT 1 NOT NULL,
	"price_multiplier" numeric(3, 2) DEFAULT '1.00'
);
--> statement-breakpoint
CREATE TABLE "seats" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"screen_id" varchar(36) NOT NULL,
	"row" varchar(10) NOT NULL,
	"number" integer NOT NULL,
	"name" varchar(10),
	"seat_type_id" varchar(36),
	"capacity" integer DEFAULT 1 NOT NULL,
	"pos_x" numeric(10, 2) DEFAULT '0' NOT NULL,
	"pos_y" numeric(10, 2) DEFAULT '0' NOT NULL,
	"is_accessible" boolean DEFAULT false NOT NULL,
	"rotation" numeric(5, 2) DEFAULT '0' NOT NULL,
	"grid_row" integer DEFAULT 0 NOT NULL,
	"grid_column" integer DEFAULT 0 NOT NULL,
	"price_multiplier" numeric(3, 2) DEFAULT '1.00' NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "show_seats" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"show_id" varchar(36) NOT NULL,
	"seat_id" varchar(36) NOT NULL,
	"booking_id" varchar(36),
	"status" "seat_status" DEFAULT 'AVAILABLE' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_verification" ADD CONSTRAINT "user_verification_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cinema_screens" ADD CONSTRAINT "cinema_screens_theatre_id_theaters_id_fk" FOREIGN KEY ("theatre_id") REFERENCES "public"."theaters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theater_images" ADD CONSTRAINT "theater_images_theater_id_theaters_id_fk" FOREIGN KEY ("theater_id") REFERENCES "public"."theaters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theaters" ADD CONSTRAINT "theaters_cineplex_chain_id_cineplex_chain_id_fk" FOREIGN KEY ("cineplex_chain_id") REFERENCES "public"."cineplex_chain"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_show_id_shows_id_fk" FOREIGN KEY ("show_id") REFERENCES "public"."shows"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_coupons" ADD CONSTRAINT "user_coupons_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_coupons" ADD CONSTRAINT "user_coupons_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_coupons" ADD CONSTRAINT "user_coupons_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_to_genres" ADD CONSTRAINT "movie_to_genres_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_to_genres" ADD CONSTRAINT "movie_to_genres_genre_id_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shows" ADD CONSTRAINT "shows_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shows" ADD CONSTRAINT "shows_screen_id_cinema_screens_id_fk" FOREIGN KEY ("screen_id") REFERENCES "public"."cinema_screens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_likes" ADD CONSTRAINT "review_likes_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_likes" ADD CONSTRAINT "review_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_transactions" ADD CONSTRAINT "reward_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_transactions" ADD CONSTRAINT "reward_transactions_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_rewards" ADD CONSTRAINT "user_rewards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlist" ADD CONSTRAINT "waitlist_show_id_shows_id_fk" FOREIGN KEY ("show_id") REFERENCES "public"."shows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlist" ADD CONSTRAINT "waitlist_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlist" ADD CONSTRAINT "waitlist_seat_preference_seat_type_id_fk" FOREIGN KEY ("seat_preference") REFERENCES "public"."seat_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seats" ADD CONSTRAINT "seats_screen_id_cinema_screens_id_fk" FOREIGN KEY ("screen_id") REFERENCES "public"."cinema_screens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seats" ADD CONSTRAINT "seats_seat_type_id_seat_type_id_fk" FOREIGN KEY ("seat_type_id") REFERENCES "public"."seat_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "show_seats" ADD CONSTRAINT "show_seats_show_id_shows_id_fk" FOREIGN KEY ("show_id") REFERENCES "public"."shows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "show_seats" ADD CONSTRAINT "show_seats_seat_id_seats_id_fk" FOREIGN KEY ("seat_id") REFERENCES "public"."seats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "show_seats" ADD CONSTRAINT "show_seats_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_role_permissions_permission_id" ON "role_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE INDEX "idx_user_roles_role_id" ON "user_roles" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "idx_sessions_user" ON "user_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_sessions_expiry" ON "user_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_verification_user" ON "user_verification" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_verification_expiry" ON "user_verification" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_users_deleted_at" ON "users" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_cinema_screens_theatre_id" ON "cinema_screens" USING btree ("theatre_id");--> statement-breakpoint
CREATE INDEX "idx_cinema_screens_screen_type" ON "cinema_screens" USING btree ("screen_type");--> statement-breakpoint
CREATE INDEX "idx_cinema_screens_deleted_at" ON "cinema_screens" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_cineplex_chain_name" ON "cineplex_chain" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_cineplex_chain_total_cinemas" ON "cineplex_chain" USING btree ("total_cinemas");--> statement-breakpoint
CREATE INDEX "idx_cineplex_chain_is_active" ON "cineplex_chain" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_cineplex_chain_deleted_at" ON "cineplex_chain" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_theaters_city" ON "theaters" USING btree ("city");--> statement-breakpoint
CREATE INDEX "idx_theaters_state" ON "theaters" USING btree ("state");--> statement-breakpoint
CREATE INDEX "idx_theaters_cineplex_chain_id" ON "theaters" USING btree ("cineplex_chain_id");--> statement-breakpoint
CREATE INDEX "idx_theaters_is_active" ON "theaters" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_theaters_deleted_at" ON "theaters" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "analytics_events_name_idx" ON "analytics_events" USING btree ("event_name");--> statement-breakpoint
CREATE INDEX "analytics_events_user_idx" ON "analytics_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "analytics_events_created_at_idx" ON "analytics_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_user_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "bookings_show_idx" ON "bookings" USING btree ("show_id");--> statement-breakpoint
CREATE INDEX "bookings_status_idx" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bookings_user_status_idx" ON "bookings" USING btree ("user_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_number_idx" ON "bookings" USING btree ("booking_number");--> statement-breakpoint
CREATE UNIQUE INDEX "coupons_code_idx" ON "coupons" USING btree ("code");--> statement-breakpoint
CREATE INDEX "coupons_valid_range_idx" ON "coupons" USING btree ("valid_from","valid_until");--> statement-breakpoint
CREATE INDEX "payments_booking_idx" ON "payments" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "payments_user_idx" ON "payments" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_transaction_idx" ON "payments" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "user_coupons_coupon_idx" ON "user_coupons" USING btree ("coupon_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_coupons_unique_idx" ON "user_coupons" USING btree ("user_id","coupon_id","booking_id");--> statement-breakpoint
CREATE INDEX "idx_genres_slug" ON "genres" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_genres_name" ON "genres" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_movie_to_genres_genre_id" ON "movie_to_genres" USING btree ("genre_id");--> statement-breakpoint
CREATE INDEX "idx_movies_title" ON "movies" USING btree ("title");--> statement-breakpoint
CREATE INDEX "idx_movies_slug" ON "movies" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_movies_release_date" ON "movies" USING btree ("release_date");--> statement-breakpoint
CREATE INDEX "idx_movies_rating" ON "movies" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "idx_movies_price" ON "movies" USING btree ("price");--> statement-breakpoint
CREATE INDEX "idx_movies_deleted_at" ON "movies" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_shows_movie_id" ON "shows" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "idx_shows_screen_id" ON "shows" USING btree ("screen_id");--> statement-breakpoint
CREATE INDEX "idx_shows_start_time" ON "shows" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "idx_shows_deleted_at" ON "shows" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "review_likes_review_idx" ON "review_likes" USING btree ("review_id");--> statement-breakpoint
CREATE UNIQUE INDEX "review_likes_unique_idx" ON "review_likes" USING btree ("review_id","user_id");--> statement-breakpoint
CREATE INDEX "reviews_movie_idx" ON "reviews" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "reviews_rating_idx" ON "reviews" USING btree ("rating");--> statement-breakpoint
CREATE UNIQUE INDEX "reviews_user_movie_unique_idx" ON "reviews" USING btree ("user_id","movie_id");--> statement-breakpoint
CREATE INDEX "reward_transactions_user_idx" ON "reward_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reward_transactions_booking_idx" ON "reward_transactions" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "user_rewards_tier_idx" ON "user_rewards" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "user_rewards_points_idx" ON "user_rewards" USING btree ("points");--> statement-breakpoint
CREATE INDEX "waitlist_show_idx" ON "waitlist" USING btree ("show_id");--> statement-breakpoint
CREATE INDEX "waitlist_user_idx" ON "waitlist" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "waitlist_status_idx" ON "waitlist" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_seats_screen_id" ON "seats" USING btree ("screen_id");--> statement-breakpoint
CREATE INDEX "idx_seats_row" ON "seats" USING btree ("row");--> statement-breakpoint
CREATE INDEX "idx_seats_seat_type_id" ON "seats" USING btree ("seat_type_id");--> statement-breakpoint
CREATE INDEX "idx_show_seats_show_id" ON "show_seats" USING btree ("show_id");--> statement-breakpoint
CREATE INDEX "idx_show_seats_seat_id" ON "show_seats" USING btree ("seat_id");--> statement-breakpoint
CREATE INDEX "idx_show_seats_booking_id" ON "show_seats" USING btree ("booking_id");