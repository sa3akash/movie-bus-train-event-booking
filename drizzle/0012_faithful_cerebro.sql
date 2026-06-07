CREATE TABLE "user_followers" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"follower_id" varchar(36) NOT NULL,
	"following_id" varchar(36) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_reels" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"reel_id" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reels" ADD COLUMN "saves_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user_followers" ADD CONSTRAINT "user_followers_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_followers" ADD CONSTRAINT "user_followers_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_reels" ADD CONSTRAINT "saved_reels_reel_id_reels_id_fk" FOREIGN KEY ("reel_id") REFERENCES "public"."reels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_reels" ADD CONSTRAINT "saved_reels_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;