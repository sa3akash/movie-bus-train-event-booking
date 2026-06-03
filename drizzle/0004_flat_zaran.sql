CREATE TABLE "images" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"url" varchar(500) NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"mime_type" varchar(100),
	"size" integer,
	"blurhash" text,
	"blurhash_data" text,
	"alt_text" text
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_id" varchar(36);--> statement-breakpoint
ALTER TABLE "movies" ADD COLUMN "poster_id" varchar(36);--> statement-breakpoint
ALTER TABLE "actors" ADD COLUMN "image_id" varchar(36);--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_avatar_id_images_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movies" ADD CONSTRAINT "movies_poster_id_images_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actors" ADD CONSTRAINT "actors_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movies" DROP COLUMN "poster_url";--> statement-breakpoint
ALTER TABLE "actors" DROP COLUMN "image_url";