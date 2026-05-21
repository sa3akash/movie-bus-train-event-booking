import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { defaultColumns } from "./defaultKey";
import { usersTable } from "./users";
import { movies, shows } from "./movie";
import { bookings } from "./booking";
import { seatType } from "./seats";
import { userTierEnum, waitlistStatusEnum } from "./enum";

export const reviews = pgTable(
  "reviews",
  {
    ...defaultColumns,
    userId: varchar("user_id", { length: 36 })
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    movieId: varchar("movie_id", { length: 36 })
      .references(() => movies.id, { onDelete: "cascade" })
      .notNull(),
    bookingId: varchar("booking_id", { length: 36 }).references(() => bookings.id, {
      onDelete: "set null",
    }),
    rating: integer("rating").notNull(), // 1-5
    title: text("title"),
    comment: text("comment"),
    isVerifiedPurchase: boolean("is_verified_purchase").default(false),
    likesCount: integer("likes_count").default(0),
    reportedCount: integer("reported_count").default(0),
    isApproved: boolean("is_approved").default(true),
  },
  (table) => [
    index("reviews_movie_idx").on(table.movieId),
    index("reviews_rating_idx").on(table.rating),
    uniqueIndex("reviews_user_movie_unique_idx").on(
      table.userId,
      table.movieId,
    ),
  ],
);

export const reviewLikes = pgTable(
  "review_likes",
  {
    ...defaultColumns,
    reviewId: varchar("review_id", { length: 36 })
      .references(() => reviews.id, { onDelete: "cascade" })
      .notNull(),
    userId: varchar("user_id", { length: 36 })
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    index("review_likes_review_idx").on(table.reviewId),
    uniqueIndex("review_likes_unique_idx").on(table.reviewId, table.userId),
  ],
);

export const wishlist = pgTable(
  "waitlist",
  {
    ...defaultColumns,
    showId: varchar("show_id", { length: 36 })
      .references(() => shows.id, { onDelete: "cascade" })
      .notNull(),
    userId: varchar("user_id", { length: 36 })
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    seatPreference: varchar("seat_preference", { length: 36 }).references(() => seatType.id),
    numberOfSeats: integer("number_of_seats").notNull(),
    status: waitlistStatusEnum("status").default("ACTIVE").notNull(),
    notifiedAt: timestamp("notified_at"),
    expiresAt: timestamp("expires_at"),
  },
  (table) => [
    index("waitlist_show_idx").on(table.showId),
    index("waitlist_user_idx").on(table.userId),
    index("waitlist_status_idx").on(table.status),
  ],
);

// ============================================
// USER REWARDS & LOYALTY
// ============================================
export const userRewards = pgTable(
  "user_rewards",
  {
    ...defaultColumns,
    userId: varchar("user_id", { length: 36 })
      .references(() => usersTable.id, { onDelete: "cascade" })
      .unique()
      .notNull(),
    points: integer("points").default(0).notNull(),
    lifetimePoints: integer("lifetime_points").default(0).notNull(),
    tier: userTierEnum("tier").default("BRONZE").notNull(),
    tierValidUntil: timestamp("tier_valid_until"),
    nextTierPoints: integer("next_tier_points"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("user_rewards_tier_idx").on(table.tier),
    index("user_rewards_points_idx").on(table.points),
  ]
);

export const rewardTransactions = pgTable(
  "reward_transactions",
  {
    ...defaultColumns,
    userId: varchar("user_id", { length: 36 })
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    bookingId: varchar("booking_id", { length: 36 }).references(() => bookings.id, {
      onDelete: "set null",
    }),
    points: integer("points").notNull(), // Positive for earning, negative for redemption
    type: text("type").notNull(), // EARNED, REDEEMED, EXPIRED, ADJUSTED
    description: text("description"),
    balanceAfter: integer("balance_after").notNull(),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("reward_transactions_user_idx").on(table.userId),
    index("reward_transactions_booking_idx").on(table.bookingId),
  ],
);

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [reviews.userId],
    references: [usersTable.id],
  }),
  movie: one(movies, {
    fields: [reviews.movieId],
    references: [movies.id],
  }),
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
  likes: many(reviewLikes),
}));

export const reviewLikesRelations = relations(reviewLikes, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewLikes.reviewId],
    references: [reviews.id],
  }),
  user: one(usersTable, {
    fields: [reviewLikes.userId],
    references: [usersTable.id],
  }),
}));

export const waitlistRelations = relations(wishlist, ({ one }) => ({
  show: one(shows, {
    fields: [wishlist.showId],
    references: [shows.id],
  }),
  user: one(usersTable, {
    fields: [wishlist.userId],
    references: [usersTable.id],
  }),
  seatType: one(seatType, {
    fields: [wishlist.seatPreference],
    references: [seatType.id],
  }),
}));

export const userRewardsRelations = relations(userRewards, ({ one }) => ({
  user: one(usersTable, {
    fields: [userRewards.userId],
    references: [usersTable.id],
  }),
}));

export const rewardTransactionsRelations = relations(rewardTransactions, ({ one }) => ({
  user: one(usersTable, {
    fields: [rewardTransactions.userId],
    references: [usersTable.id],
  }),
  booking: one(bookings, {
    fields: [rewardTransactions.bookingId],
    references: [bookings.id],
  }),
}));