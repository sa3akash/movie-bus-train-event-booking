ALTER TABLE "reel_series" ADD COLUMN "trailer_video_id" varchar(128);--> statement-breakpoint
ALTER TABLE "reel_series" ADD COLUMN "genre" varchar(100);--> statement-breakpoint
ALTER TABLE "reel_series" ADD COLUMN "status" varchar(50) DEFAULT 'ONGOING';--> statement-breakpoint
ALTER TABLE "reel_series" ADD COLUMN "total_episodes" integer;--> statement-breakpoint
ALTER TABLE "reel_series" ADD COLUMN "is_premium" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "reel_series" ADD COLUMN "default_price_per_episode" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "reel_series" ADD COLUMN "total_views_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "reel_series" ADD COLUMN "total_likes_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "reels" ADD COLUMN "season_number" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "reels" ADD COLUMN "episode_title" varchar(255);--> statement-breakpoint
ALTER TABLE "reels" ADD COLUMN "is_premium" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "reels" ADD COLUMN "unlock_price" integer;