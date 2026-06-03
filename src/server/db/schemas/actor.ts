import { index, pgTable, primaryKey, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { defaultColumns } from "./defaultKey";
import { movies } from "./movie";
import { images } from "./image";

export const actors = pgTable("actors", {
  ...defaultColumns,
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  bio: text("bio"),
  imageId: varchar("image_id", { length: 36 }).references(() => images.id, { onDelete: "set null" }),
  birthDate: timestamp("birth_date"),
  birthPlace: varchar("birth_place", { length: 255 }),
}, (table) => [
  index("idx_actors_name").on(table.name),
  index("idx_actors_slug").on(table.slug),
]);

export const movieActors = pgTable("movie_actors", {
  movieId: varchar("movie_id", { length: 36 })
    .notNull()
    .references(() => movies.id, { onDelete: "cascade" }),
  actorId: varchar("actor_id", { length: 36 })
    .notNull()
    .references(() => actors.id, { onDelete: "cascade" }),
  characterName: varchar("character_name", { length: 255 }),
}, (table) => [
  index("idx_movie_actors_actor_id").on(table.actorId),
  index("idx_movie_actors_movie_id").on(table.movieId),
  primaryKey({ columns: [table.movieId, table.actorId] }),
]);

export const actorsRelations = relations(actors, ({ many, one }) => ({
  movieActors: many(movieActors),
  image: one(images, {
    fields: [actors.imageId],
    references: [images.id],
  }),
}));

export const movieActorsRelations = relations(movieActors, ({ one }) => ({
  movie: one(movies, {
    fields: [movieActors.movieId],
    references: [movies.id],
  }),
  actor: one(actors, {
    fields: [movieActors.actorId],
    references: [actors.id],
  }),
}));
