ALTER TABLE "seats" DROP CONSTRAINT "seats_seat_type_id_seat_type_id_fk";
--> statement-breakpoint
ALTER TABLE "seat_type" ADD COLUMN "price" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "seat_type" ADD COLUMN "color" varchar(10) DEFAULT '#FFD700';--> statement-breakpoint
ALTER TABLE "seat_type" ADD COLUMN "currency" varchar(3) DEFAULT 'BDT';--> statement-breakpoint
ALTER TABLE "seat_type" ADD COLUMN "theater_id" varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE "seats" ADD COLUMN "seat_number" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "seat_type" ADD CONSTRAINT "seat_type_theater_id_theaters_id_fk" FOREIGN KEY ("theater_id") REFERENCES "public"."theaters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seats" ADD CONSTRAINT "seats_seat_type_id_seat_type_id_fk" FOREIGN KEY ("seat_type_id") REFERENCES "public"."seat_type"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_theater_images_theater_id" ON "theater_images" USING btree ("theater_id");--> statement-breakpoint
CREATE INDEX "reviews_booking_idx" ON "reviews" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "waitlist_seat_pref_idx" ON "waitlist" USING btree ("seat_preference");--> statement-breakpoint
CREATE INDEX "idx_seat_type_theater_id" ON "seat_type" USING btree ("theater_id");--> statement-breakpoint
ALTER TABLE "seats" DROP COLUMN "number";--> statement-breakpoint
ALTER TABLE "seats" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "seats" DROP COLUMN "capacity";--> statement-breakpoint
ALTER TABLE "seats" DROP COLUMN "grid_row";--> statement-breakpoint
ALTER TABLE "seats" DROP COLUMN "grid_column";--> statement-breakpoint
ALTER TABLE "seats" DROP COLUMN "price_multiplier";