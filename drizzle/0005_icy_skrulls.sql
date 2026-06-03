CREATE TYPE "public"."ad_category" AS ENUM('PRE_ROLL', 'MID_ROLL', 'POST_ROLL');--> statement-breakpoint
CREATE TABLE "videos" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"original_key" text NOT NULL,
	"original_url" text NOT NULL,
	"status" varchar(32) DEFAULT 'PENDING' NOT NULL,
	"resolutions" jsonb,
	"hls_url" text,
	"dash_url" text,
	"duration" varchar(32),
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ads" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category" "ad_category" NOT NULL,
	"uri" text NOT NULL,
	"is_skippable" boolean DEFAULT true NOT NULL,
	"skip_offset" integer DEFAULT 5 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
