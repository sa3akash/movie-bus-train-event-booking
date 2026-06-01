import { boolean, decimal, index, integer, jsonb, pgTable, primaryKey, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { defaultColumns } from "./defaultKey";
import { movieStatusEnum, showStatusEnum } from "./enum";
import { cinemaScreens } from "./cinemas";
import { bookings } from "./booking";
import { showSeats } from "./seats";
import { reviews, wishlist } from "./reviews";
import { movieActors } from "./actor";

export const genres = pgTable("genres", {
  ...defaultColumns,
  name: text("name").unique().notNull(),
  slug: text("slug").unique().notNull(),
},(table)=>[
    index("idx_genres_slug").on(table.slug),
    index("idx_genres_name").on(table.name),
]);

export const movies = pgTable("movies", {
    ...defaultColumns,
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    genre: jsonb('genre').$type<string[]>().default([]),
    language: varchar('language', { length: 50 }),
    releaseDate: timestamp("release_date").notNull(),
    duration: integer("duration").notNull(), // minutes
    rating: decimal("rating", { precision: 3, scale: 2 }).notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    status: movieStatusEnum("status").notNull().default("COMING_SOON"),
    posterUrl: varchar("poster_url", { length: 500 }),
    trailerUrl: varchar("trailer_url", { length: 500 }),
    cast: jsonb("cast"), // [{name, role, image}]
    crew: jsonb("crew"), // [{name, role}]
    averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
    totalReviews: integer("total_reviews").default(0),
    isNowShowing: boolean("is_now_showing").default(false),
    isComingSoon: boolean("is_coming_soon").default(false),
    deletedAt: timestamp("deleted_at"),
}, (table)=>[
    index("idx_movies_title").on(table.title),
    index("idx_movies_slug").on(table.slug),
    index("idx_movies_release_date").on(table.releaseDate),
    index("idx_movies_rating").on(table.rating),
    index("idx_movies_price").on(table.price),
    index("idx_movies_deleted_at").on(table.deletedAt),
])

export const movieToGenres = pgTable("movie_to_genres", {
    movieId: varchar("movie_id", { length: 36 }).notNull().references(() => movies.id, { onDelete: "cascade" }),
    genreId: varchar("genre_id", { length: 36 }).notNull().references(() => genres.id, { onDelete: "cascade" }),
}, (table) => [
    index("idx_movie_to_genres_genre_id").on(table.genreId),
    primaryKey({ columns: [table.movieId, table.genreId] }),
]);

export const shows = pgTable('shows', {
    ...defaultColumns,
    movieId: varchar("movie_id", { length: 36 }).notNull().references(()=>movies.id, { onDelete: "cascade" }),
    screenId: varchar("screen_id", { length: 36 }).notNull().references(()=>cinemaScreens.id, { onDelete: "cascade" }),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
    status: showStatusEnum("status").notNull().default("SCHEDULED"),
    availableSeats: integer('available_seats').notNull(),
    deletedAt: timestamp("deleted_at"),
},(table)=>[
    index("idx_shows_movie_id").on(table.movieId),
    index("idx_shows_screen_id").on(table.screenId),
    index("idx_shows_start_time").on(table.startTime),
    index("idx_shows_deleted_at").on(table.deletedAt),
])

export const genresRelations = relations(genres, ({ many }) => ({
  movieToGenres: many(movieToGenres),
}));

export const moviesRelations = relations(movies, ({ many }) => ({
  shows: many(shows),
  reviews: many(reviews),
  movieToGenres: many(movieToGenres),
  movieActors: many(movieActors),
}));

export const movieToGenresRelations = relations(movieToGenres, ({ one }) => ({
  movie: one(movies, {
    fields: [movieToGenres.movieId],
    references: [movies.id],
  }),
  genre: one(genres, {
    fields: [movieToGenres.genreId],
    references: [genres.id],
  }),
}));

export const showsRelations = relations(shows, ({ one, many }) => ({
  movie: one(movies, {
    fields: [shows.movieId],
    references: [movies.id],
  }),
  screen: one(cinemaScreens, {
    fields: [shows.screenId],
    references: [cinemaScreens.id],
  }),
  showSeats: many(showSeats),
  bookings: many(bookings),
  waitlist: many(wishlist),
}));
