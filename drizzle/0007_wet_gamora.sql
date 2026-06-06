ALTER TABLE "ads" ADD COLUMN "format" text DEFAULT 'video' NOT NULL;--> statement-breakpoint
ALTER TABLE "ads" ADD COLUMN "min_age" integer;--> statement-breakpoint
ALTER TABLE "ads" ADD COLUMN "max_age" integer;--> statement-breakpoint
ALTER TABLE "ads" ADD COLUMN "target_countries" jsonb;--> statement-breakpoint
ALTER TABLE "ads" ADD COLUMN "target_genders" jsonb;--> statement-breakpoint
ALTER TABLE "ads" ADD COLUMN "target_categories" jsonb;--> statement-breakpoint
ALTER TABLE "ads" ADD COLUMN "target_devices" jsonb;--> statement-breakpoint
ALTER TABLE "ads" ADD COLUMN "budget" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "ads" ADD COLUMN "spent" numeric(12, 2) DEFAULT '0';