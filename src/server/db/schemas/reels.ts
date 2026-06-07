import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { defaultColumns } from "./defaultKey";
import { usersTable } from "./users";
import { videos } from "./video";

export const reelSeries = pgTable("reel_series", {
  ...defaultColumns,
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  coverImageId: varchar("cover_image_id", { length: 128 }),
  trailerVideoId: varchar("trailer_video_id", { length: 128 }),
  
  genre: varchar("genre", { length: 100 }),
  tags: jsonb("tags").$type<string[]>().default([]),
  
  // Advanced Metadata
  cast: jsonb("cast").$type<string[]>().default([]),
  director: varchar("director", { length: 128 }),
  releaseYear: integer("release_year"),
  language: varchar("language", { length: 50 }).default("en"),
  ageRating: varchar("age_rating", { length: 20 }), // e.g., PG-13, R, TV-MA
  
  status: varchar("status", { length: 50 }).default("ONGOING"),
  totalEpisodes: integer("total_episodes"),
  
  isPremium: boolean("is_premium").default(false),
  defaultPricePerEpisode: integer("default_price_per_episode").default(0),
  
  totalViewsCount: integer("total_views_count").default(0),
  totalLikesCount: integer("total_likes_count").default(0),
  totalRevenue: integer("total_revenue").default(0),
  
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const reels = pgTable("reels", {
  ...defaultColumns,
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  videoId: varchar("video_id", { length: 128 })
    .notNull()
    .references(() => videos.id, { onDelete: "cascade" }),
  
  caption: text("caption"),
  
  // Visibility & Permissions
  visibility: varchar("visibility", { length: 20 }).default("PUBLIC"), // PUBLIC, FRIENDS, PRIVATE, ARCHIVED
  allowComments: boolean("allow_comments").default(true),
  allowRemixing: boolean("allow_remixing").default(true),
  isSponsored: boolean("is_sponsored").default(false),
  
  // Metadata
  hashtags: jsonb("hashtags").$type<string[]>().default([]),
  mentions: jsonb("mentions").$type<string[]>().default([]),
  audioId: varchar("audio_id", { length: 128 }),
  locationId: varchar("location_id", { length: 128 }),
  
  // Series (Drama / ReelShort)
  seriesId: varchar("series_id", { length: 36 }).references(() => reelSeries.id, { onDelete: "set null" }),
  seasonNumber: integer("season_number").default(1),
  episodeNumber: integer("episode_number"),
  episodeTitle: varchar("episode_title", { length: 255 }),
  
  isPremium: boolean("is_premium").default(false),
  unlockPrice: integer("unlock_price"),

  // Denormalized Counters
  viewsCount: integer("views_count").default(0),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  sharesCount: integer("shares_count").default(0),
  savesCount: integer("saves_count").default(0),
});

export const reelLikes = pgTable("reel_likes", {
  ...defaultColumns,
  reelId: varchar("reel_id", { length: 36 })
    .notNull()
    .references(() => reels.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const savedReels = pgTable("saved_reels", {
  ...defaultColumns,
  reelId: varchar("reel_id", { length: 36 })
    .notNull()
    .references(() => reels.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const reelShares = pgTable("reel_shares", {
  ...defaultColumns,
  reelId: varchar("reel_id", { length: 36 })
    .notNull()
    .references(() => reels.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 36 })
    .references(() => usersTable.id, { onDelete: "set null" }),
  platform: varchar("platform", { length: 50 }).default("copy_link"),
});

export const reelComments = pgTable("reel_comments", {
  ...defaultColumns,
  reelId: varchar("reel_id", { length: 36 })
    .notNull()
    .references(() => reels.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  parentId: varchar("parent_id", { length: 36 }), // For nested replies
  content: text("content").notNull(),
  likesCount: integer("likes_count").default(0),
});

export const reelCommentLikes = pgTable("reel_comment_likes", {
  ...defaultColumns,
  commentId: varchar("comment_id", { length: 36 })
    .notNull()
    .references(() => reelComments.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const reelsRelations = relations(reels, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [reels.userId],
    references: [usersTable.id],
  }),
  video: one(videos, {
    fields: [reels.videoId],
    references: [videos.id],
  }),
  series: one(reelSeries, {
    fields: [reels.seriesId],
    references: [reelSeries.id],
  }),
  likes: many(reelLikes),
  comments: many(reelComments),
  shares: many(reelShares),
  saves: many(savedReels),
}));

export const reelLikesRelations = relations(reelLikes, ({ one }) => ({
  reel: one(reels, {
    fields: [reelLikes.reelId],
    references: [reels.id],
  }),
  user: one(usersTable, {
    fields: [reelLikes.userId],
    references: [usersTable.id],
  }),
}));

export const savedReelsRelations = relations(savedReels, ({ one }) => ({
  reel: one(reels, {
    fields: [savedReels.reelId],
    references: [reels.id],
  }),
  user: one(usersTable, {
    fields: [savedReels.userId],
    references: [usersTable.id],
  }),
}));

export const reelSharesRelations = relations(reelShares, ({ one }) => ({
  reel: one(reels, {
    fields: [reelShares.reelId],
    references: [reels.id],
  }),
  user: one(usersTable, {
    fields: [reelShares.userId],
    references: [usersTable.id],
  }),
}));

export const reelCommentsRelations = relations(reelComments, ({ one, many }) => ({
  reel: one(reels, {
    fields: [reelComments.reelId],
    references: [reels.id],
  }),
  user: one(usersTable, {
    fields: [reelComments.userId],
    references: [usersTable.id],
  }),
  parent: one(reelComments, {
    fields: [reelComments.parentId],
    references: [reelComments.id],
    relationName: "replies",
  }),
  replies: many(reelComments, { relationName: "replies" }),
  likes: many(reelCommentLikes),
}));

export const reelCommentLikesRelations = relations(reelCommentLikes, ({ one }) => ({
  comment: one(reelComments, {
    fields: [reelCommentLikes.commentId],
    references: [reelComments.id],
  }),
  user: one(usersTable, {
    fields: [reelCommentLikes.userId],
    references: [usersTable.id],
  }),
}));

export const reelSeriesRelations = relations(reelSeries, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [reelSeries.userId],
    references: [usersTable.id],
  }),
  episodes: many(reels),
}));

export const reelWatchHistory = pgTable("reel_watch_history", {
  ...defaultColumns,
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  reelId: varchar("reel_id", { length: 36 })
    .notNull()
    .references(() => reels.id, { onDelete: "cascade" }),
  seriesId: varchar("series_id", { length: 36 })
    .references(() => reelSeries.id, { onDelete: "cascade" }),
  
  progressSeconds: integer("progress_seconds").default(0),
  isCompleted: boolean("is_completed").default(false),
});

export const reelPurchases = pgTable("reel_purchases", {
  ...defaultColumns,
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  reelId: varchar("reel_id", { length: 36 })
    .notNull()
    .references(() => reels.id, { onDelete: "cascade" }),
  seriesId: varchar("series_id", { length: 36 })
    .references(() => reelSeries.id, { onDelete: "cascade" }),
    
  amount: integer("amount").notNull(),
});

export const reelWatchHistoryRelations = relations(reelWatchHistory, ({ one }) => ({
  user: one(usersTable, {
    fields: [reelWatchHistory.userId],
    references: [usersTable.id],
  }),
  reel: one(reels, {
    fields: [reelWatchHistory.reelId],
    references: [reels.id],
  }),
  series: one(reelSeries, {
    fields: [reelWatchHistory.seriesId],
    references: [reelSeries.id],
  }),
}));

export const reelPurchasesRelations = relations(reelPurchases, ({ one }) => ({
  user: one(usersTable, {
    fields: [reelPurchases.userId],
    references: [usersTable.id],
  }),
  reel: one(reels, {
    fields: [reelPurchases.reelId],
    references: [reels.id],
  }),
  series: one(reelSeries, {
    fields: [reelPurchases.seriesId],
    references: [reelSeries.id],
  }),
}));
