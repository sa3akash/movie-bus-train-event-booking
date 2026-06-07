CREATE TABLE "reel_purchases" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"reel_id" varchar(36) NOT NULL,
	"series_id" varchar(36),
	"amount" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reel_watch_history" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"reel_id" varchar(36) NOT NULL,
	"series_id" varchar(36),
	"progress_seconds" integer DEFAULT 0,
	"is_completed" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "reel_series" ADD COLUMN "cast" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "reel_series" ADD COLUMN "director" varchar(128);--> statement-breakpoint
ALTER TABLE "reel_series" ADD COLUMN "release_year" integer;--> statement-breakpoint
ALTER TABLE "reel_series" ADD COLUMN "language" varchar(50) DEFAULT 'en';--> statement-breakpoint
ALTER TABLE "reel_series" ADD COLUMN "age_rating" varchar(20);--> statement-breakpoint
ALTER TABLE "reel_series" ADD COLUMN "total_revenue" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "reel_purchases" ADD CONSTRAINT "reel_purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reel_purchases" ADD CONSTRAINT "reel_purchases_reel_id_reels_id_fk" FOREIGN KEY ("reel_id") REFERENCES "public"."reels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reel_purchases" ADD CONSTRAINT "reel_purchases_series_id_reel_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."reel_series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reel_watch_history" ADD CONSTRAINT "reel_watch_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reel_watch_history" ADD CONSTRAINT "reel_watch_history_reel_id_reels_id_fk" FOREIGN KEY ("reel_id") REFERENCES "public"."reels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reel_watch_history" ADD CONSTRAINT "reel_watch_history_series_id_reel_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."reel_series"("id") ON DELETE cascade ON UPDATE no action;