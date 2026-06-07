import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { defaultColumns } from "./defaultKey";
import { bookings, userCoupons } from "./booking";
import { reviews, wishlist, reviewLikes, userRewards, rewardTransactions } from "./reviews";
import { auditLogs, analyticsEvents } from "./audit";
import { images } from "./image";
import { reels, reelLikes, reelComments, reelShares, reelCommentLikes, savedReels } from "./reels";

export const roles = pgTable("roles", {
  ...defaultColumns,

  name: varchar("name", { length: 100 }).notNull().unique(),

  description: varchar("description", { length: 255 }),

  isSystem: boolean("is_system").default(false), // admin/system roles lock
});

export const permissions = pgTable("permissions", {
  ...defaultColumns,

  key: varchar("key", { length: 150 }).notNull().unique(),
  // BOOK_TICKET, CANCEL_BOOKING, MANAGE_MOVIE

  module: varchar("module", { length: 100 }), 
  // booking, movie, admin

  description: varchar("description", { length: 255 }),
});

export const rolePermissions = pgTable("role_permissions", {
  roleId: varchar("role_id", { length: 36 })
    .notNull()
    .references(() => roles.id, { onDelete: "cascade" }),

  permissionId: varchar("permission_id", { length: 36 })
    .notNull()
    .references(() => permissions.id, { onDelete: "cascade" }),
}, (t) => [
  primaryKey({ columns: [t.roleId, t.permissionId] }),
  index("idx_role_permissions_permission_id").on(t.permissionId),
]);

export const userRoles = pgTable("user_roles", {
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  roleId: varchar("role_id", { length: 36 })
    .notNull()
    .references(() => roles.id, { onDelete: "cascade" }),

  assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow(),

}, (t) => [
  primaryKey({ columns: [t.userId, t.roleId] }),
  index("idx_user_roles_role_id").on(t.roleId),
]);


export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),
    permission: one(permissions, {
      fields: [rolePermissions.permissionId],
      references: [permissions.id],
    }),
  }),
);



export const usersTable = pgTable("users", {
  ...defaultColumns,
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  avatarId: varchar("avatar_id", { length: 36 }).references(() => images.id, { onDelete: "set null" }),

  isEmailVerified: boolean("is_email_verified").default(false),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
}, (t) => [
  index("idx_users_deleted_at").on(t.deletedAt),
]);

export const userSessionTable = pgTable("user_sessions", {
  ...defaultColumns,
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  refreshTokenHash: varchar("refresh_token_hash", { length: 255 }).notNull().unique(),
  deviceId: varchar("device_id", { length: 100 }),
  userAgent: varchar("user_agent", { length: 512 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  isRevoked: boolean("is_revoked").default(false),
}, (t) => [
  index("idx_sessions_user").on(t.userId),
  index("idx_sessions_expiry").on(t.expiresAt),
]);

export const userFollowers = pgTable("user_followers", {
  ...defaultColumns,
  followerId: varchar("follower_id", { length: 36 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  followingId: varchar("following_id", { length: 36 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const userVerificationTable = pgTable("user_verification", {
  ...defaultColumns,

  userId: varchar("user_id", { length: 36 })
    .references(() => usersTable.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(),
  // EMAIL_VERIFY, RESET_PASSWORD
  identifier: varchar("identifier", { length: 255 }),

  codeHash: varchar("code_hash", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
}, (t) => [
  index("idx_verification_user").on(t.userId),
  index("idx_verification_expiry").on(t.expiresAt),
]);


export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(usersTable, {
    fields: [userRoles.userId],
    references: [usersTable.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));

export const userSessionsRelations = relations(userSessionTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [userSessionTable.userId],
    references: [usersTable.id],
  }),
}));

export const userVerificationRelations = relations(userVerificationTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [userVerificationTable.userId],
    references: [usersTable.id],
  }),
}));

export const usersRelations = relations(usersTable, ({ many, one }) => ({
  sessions: many(userSessionTable),
  roles: many(userRoles),
  verifications: many(userVerificationTable),
  bookings: many(bookings),
  wishlist: many(wishlist),
  reviews: many(reviews),
  userCoupons: many(userCoupons),
  reviewLikes: many(reviewLikes),
  rewards: one(userRewards),
  rewardTransactions: many(rewardTransactions),
  auditLogs: many(auditLogs),
  analyticsEvents: many(analyticsEvents),
  avatar: one(images, {
    fields: [usersTable.avatarId],
    references: [images.id],
  }),
  reels: many(reels),
  reelLikes: many(reelLikes),
  reelComments: many(reelComments),
  reelShares: many(reelShares),
  reelCommentLikes: many(reelCommentLikes),
  savedReels: many(savedReels),
  followers: many(userFollowers, { relationName: "followers" }),
  following: many(userFollowers, { relationName: "following" }),
}));

export const userFollowersRelations = relations(userFollowers, ({ one }) => ({
  follower: one(usersTable, {
    fields: [userFollowers.followerId],
    references: [usersTable.id],
    relationName: "following",
  }),
  following: one(usersTable, {
    fields: [userFollowers.followingId],
    references: [usersTable.id],
    relationName: "followers",
  }),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(userRoles),
  permissions: many(rolePermissions),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  roles: many(rolePermissions),
}));