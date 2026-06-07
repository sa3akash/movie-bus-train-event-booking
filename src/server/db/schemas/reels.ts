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
