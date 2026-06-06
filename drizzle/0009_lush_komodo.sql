ALTER TABLE "videos" ADD COLUMN "thumbnails" jsonb;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "blurhashes" jsonb;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "blur_data_urls" jsonb;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "storyboard_url" text;