CREATE TABLE "reel_comments" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"reel_id" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reel_likes" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"reel_id" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reels" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"video_id" varchar(128) NOT NULL,
	"caption" text,
	"views_count" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "storyboards" jsonb;--> statement-breakpoint
ALTER TABLE "reel_comments" ADD CONSTRAINT "reel_comments_reel_id_reels_id_fk" FOREIGN KEY ("reel_id") REFERENCES "public"."reels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reel_comments" ADD CONSTRAINT "reel_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reel_likes" ADD CONSTRAINT "reel_likes_reel_id_reels_id_fk" FOREIGN KEY ("reel_id") REFERENCES "public"."reels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reel_likes" ADD CONSTRAINT "reel_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reels" ADD CONSTRAINT "reels_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reels" ADD CONSTRAINT "reels_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;