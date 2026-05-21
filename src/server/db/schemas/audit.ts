// ============================================
// AUDIT LOGS (For compliance)

import { index, jsonb, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { defaultColumns } from "./defaultKey";
import { usersTable } from "./users";

// ============================================
export const auditLogs = pgTable(
  "audit_logs",
  {
    ...defaultColumns,
    userId: varchar("user_id", { length: 36 }).references(
      () => usersTable.id,
      {
        onDelete: "set null",
      },
    ),
    action: text("action").notNull(), // CREATE, UPDATE, DELETE, VIEW, LOGIN, LOGOUT
    entityType: text("entity_type").notNull(), // booking, payment, user, etc.
    entityId: varchar("entity_id", { length: 36 }),
    oldData: jsonb("old_data"),
    newData: jsonb("new_data"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    requestId: text("request_id"),
  },
  (table) => [
    index("audit_logs_user_idx").on(table.userId),
    index("audit_logs_entity_idx").on(table.entityType, table.entityId),
    index("audit_logs_action_idx").on(table.action),
    index("audit_logs_created_at_idx").on(table.createdAt),
  ],
);

// ============================================
// ANALYTICS & REPORTING
// ============================================
export const analyticsEvents = pgTable(
  "analytics_events",
  {
    ...defaultColumns,
    userId: varchar("user_id", { length: 36 }).references(
      () => usersTable.id,
      {
        onDelete: "set null",
      },
    ),
    eventName: text("event_name").notNull(),
    eventData: jsonb("event_data"),
    pageUrl: text("page_url"),
    referrer: text("referrer"),
    sessionId: text("session_id"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
  },
  (table) => [
    index("analytics_events_name_idx").on(table.eventName),
    index("analytics_events_user_idx").on(table.userId),
    index("analytics_events_created_at_idx").on(table.createdAt),
  ],
);

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(usersTable, {
    fields: [auditLogs.userId],
    references: [usersTable.id],
  }),
}));

export const analyticsEventsRelations = relations(
  analyticsEvents,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [analyticsEvents.userId],
      references: [usersTable.id],
    }),
  }),
);
