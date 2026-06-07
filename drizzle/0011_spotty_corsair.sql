CREATE TABLE "reel_comment_likes" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"comment_id" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reel_shares" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"reel_id" varchar(36) NOT NULL,
	"user_id" varchar(36),
	"platform" varchar(50) DEFAULT 'copy_link'
);
--> statement-breakpoint
ALTER TABLE "reel_comments" ADD COLUMN "parent_id" varchar(36);--> statement-breakpoint
ALTER TABLE "reel_comments" ADD COLUMN "likes_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "reels" ADD COLUMN "visibility" varchar(20) DEFAULT 'PUBLIC';--> statement-breakpoint
ALTER TABLE "reels" ADD COLUMN "allow_comments" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "reels" ADD COLUMN "allow_remixing" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "reels" ADD COLUMN "is_sponsored" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "reels" ADD COLUMN "hashtags" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "reels" ADD COLUMN "mentions" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "reels" ADD COLUMN "audio_id" varchar(128);--> statement-breakpoint
ALTER TABLE "reels" ADD COLUMN "location_id" varchar(128);--> statement-breakpoint
ALTER TABLE "reels" ADD COLUMN "likes_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "reels" ADD COLUMN "comments_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "reels" ADD COLUMN "shares_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "reel_comment_likes" ADD CONSTRAINT "reel_comment_likes_comment_id_reel_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."reel_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reel_comment_likes" ADD CONSTRAINT "reel_comment_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reel_shares" ADD CONSTRAINT "reel_shares_reel_id_reels_id_fk" FOREIGN KEY ("reel_id") REFERENCES "public"."reels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reel_shares" ADD CONSTRAINT "reel_shares_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;