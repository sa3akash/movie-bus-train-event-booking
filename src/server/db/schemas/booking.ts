import { boolean, decimal, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { defaultColumns } from "./defaultKey";
import { usersTable } from "./users";
import { shows } from "./movie";
import { showSeats } from "./seats";
import { bookingStatusEnum, couponDiscountTypeEnum, paymentMethodEnum, paymentStatusEnum } from "./enum";

export const bookings = pgTable(
    "bookings",
    {
        ...defaultColumns,
        bookingNumber: varchar("booking_number", { length: 255 }).unique().notNull(),
        userId: varchar("user_id", { length: 255 })
            .references(() => usersTable.id, { onDelete: "restrict" })
            .notNull(),
        showId: varchar("show_id", { length: 255 })
            .references(() => shows.id, { onDelete: "restrict" })
            .notNull(),
        subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
        convenienceFee: decimal("convenience_fee", {
            precision: 10,
            scale: 2,
        }).default("0"),
        discountAmount: decimal("discount_amount", {
            precision: 10,
            scale: 2,
        }).default("0"),
        totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
        status: bookingStatusEnum("status").default("PENDING").notNull(),
        couponCode: text("coupon_code"),
        loyaltyPointsUsed: integer("loyalty_points_used").default(0),
        loyaltyPointsEarned: integer("loyalty_points_earned").default(0),
        expiresAt: timestamp("expires_at"), // Booking expires after 10 minutes if not paid
        checkedIn: boolean("checked_in").default(false),
        checkedInAt: timestamp("checked_in_at"),
    },
    (table) => [
        index("bookings_user_idx").on(table.userId),
        index("bookings_show_idx").on(table.showId),
        index("bookings_status_idx").on(table.status),
        index("bookings_user_status_idx").on(table.userId, table.status),
        uniqueIndex("bookings_number_idx").on(table.bookingNumber),
    ],
);

export const payments = pgTable(
    "payments",
    {
        ...defaultColumns,
        paymentNumber: text("payment_number").unique().notNull(),
        bookingId: varchar("booking_id", { length: 255 })
            .references(() => bookings.id, { onDelete: "restrict" })
            .notNull(),
        userId: varchar("user_id", { length: 255 })
            .references(() => usersTable.id, { onDelete: "restrict" })
            .notNull(),
        amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
        status: paymentStatusEnum("status").notNull().default('PENDING'),
        paymentMethod: paymentMethodEnum("payment_method"),
        transactionId: text("transaction_id"),
        gateway: text("gateway"), // Razorpay, Stripe, etc.
        gatewayResponse: jsonb("gateway_response"),
        refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
        refundReason: text("refund_reason"),
        refundedAt: timestamp("refunded_at"),
        failureReason: text("failure_reason"),
    },
    (table) => [
        index("payments_booking_idx").on(table.bookingId),
        index("payments_user_idx").on(table.userId),
        uniqueIndex("payments_transaction_idx").on(table.transactionId),
        index("payments_status_idx").on(table.status),
    ],
);

export const coupons = pgTable(
  "coupons",
  {
    ...defaultColumns,
    code: text("code").unique().notNull(),
    description: text("description"),
    discountType: couponDiscountTypeEnum("discount_type").notNull(),
    discountValue: decimal("discount_value", {
      precision: 10,
      scale: 2,
    }).notNull(),
    minBookingAmount: decimal("min_booking_amount", {
      precision: 10,
      scale: 2,
    }),
    maxDiscountAmount: decimal("max_discount_amount", {
      precision: 10,
      scale: 2,
    }),
    validFrom: timestamp("valid_from").notNull(),
    validUntil: timestamp("valid_until").notNull(),
    usageLimit: integer("usage_limit").default(1),
    usageCount: integer("usage_count").default(0),
    perUserLimit: integer("per_user_limit").default(1),
    applicableMovies: text("applicable_movies").array(), // Empty means all movies
    applicableTheaters: text("applicable_theaters").array(), // Empty means all theaters
    applicablePaymentMethods: paymentMethodEnum("applicable_payment_methods").array(),
    minTickets: integer("min_tickets").default(1),
    maxTickets: integer("max_tickets"),
    isActive: boolean("is_active").default(true),
  },
  (table) => [
      uniqueIndex("coupons_code_idx").on(table.code),
      index("coupons_valid_range_idx").on(table.validFrom, table.validUntil),
  ]
);

export const userCoupons = pgTable(
  "user_coupons",
  {
    ...defaultColumns,
    userId: varchar("user_id", { length: 255 })
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    couponId: varchar("coupon_id", { length: 255 })
      .references(() => coupons.id, { onDelete: "cascade" })
      .notNull(),
    bookingId: varchar("booking_id", { length: 255 }).references(() => bookings.id, {
      onDelete: "set null",
    }),
    usedAt: timestamp("used_at").defaultNow().notNull(),
    discountAmount: decimal("discount_amount", {
      precision: 10,
      scale: 2,
    }).notNull(),
  },
  (table) => [
    index("user_coupons_user_idx").on(table.userId),
    index("user_coupons_coupon_idx").on(table.couponId),
    uniqueIndex("user_coupons_unique_idx").on(table.userId, table.couponId, table.bookingId),
  ]
);

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [bookings.userId],
    references: [usersTable.id],
  }),
  show: one(shows, {
    fields: [bookings.showId],
    references: [shows.id],
  }),
  payments: many(payments),
  userCoupons: many(userCoupons),
  showSeats: many(showSeats),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
  user: one(usersTable, {
    fields: [payments.userId],
    references: [usersTable.id],
  }),
}));

export const couponsRelations = relations(coupons, ({ many }) => ({
  userCoupons: many(userCoupons),
}));

export const userCouponsRelations = relations(userCoupons, ({ one }) => ({
  user: one(usersTable, {
    fields: [userCoupons.userId],
    references: [usersTable.id],
  }),
  coupon: one(coupons, {
    fields: [userCoupons.couponId],
    references: [coupons.id],
  }),
  booking: one(bookings, {
    fields: [userCoupons.bookingId],
    references: [bookings.id],
  }),
}));