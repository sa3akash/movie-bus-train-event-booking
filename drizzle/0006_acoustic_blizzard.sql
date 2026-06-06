CREATE TABLE "ad_tracking" (
	"id" text PRIMARY KEY NOT NULL,
	"ad_id" text NOT NULL,
	"user_id" varchar(36),
	"device_id" text,
	"event" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ads" ADD COLUMN "duration" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "ad_tracking" ADD CONSTRAINT "ad_tracking_ad_id_ads_id_fk" FOREIGN KEY ("ad_id") REFERENCES "public"."ads"("id") ON DELETE cascade ON UPDATE no action;