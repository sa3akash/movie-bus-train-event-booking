CREATE TABLE "reel_series" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"cover_image_id" varchar(128),
	"tags" jsonb DEFAULT '[]'::jsonb,
	"user_id" varchar(36) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reels" ADD COLUMN "series_id" varchar(36);--> statement-breakpoint
ALTER TABLE "reels" ADD COLUMN "episode_number" integer;--> statement-breakpoint
ALTER TABLE "reel_series" ADD CONSTRAINT "reel_series_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reels" ADD CONSTRAINT "reels_series_id_reel_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."reel_series"("id") ON DELETE set null ON UPDATE no action;