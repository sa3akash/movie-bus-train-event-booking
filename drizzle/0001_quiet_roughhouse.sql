CREATE TABLE "actors" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"bio" text,
	"image_url" varchar(500),
	"birth_date" timestamp,
	"birth_place" varchar(255),
	CONSTRAINT "actors_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "movie_actors" (
	"movie_id" varchar(36) NOT NULL,
	"actor_id" varchar(36) NOT NULL,
	"character_name" varchar(255),
	CONSTRAINT "movie_actors_movie_id_actor_id_pk" PRIMARY KEY("movie_id","actor_id")
);
--> statement-breakpoint
ALTER TABLE "movie_actors" ADD CONSTRAINT "movie_actors_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_actors" ADD CONSTRAINT "movie_actors_actor_id_actors_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_actors_name" ON "actors" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_actors_slug" ON "actors" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_movie_actors_actor_id" ON "movie_actors" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "idx_movie_actors_movie_id" ON "movie_actors" USING btree ("movie_id");