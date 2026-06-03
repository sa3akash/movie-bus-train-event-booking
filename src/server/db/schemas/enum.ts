import { pgEnum } from "drizzle-orm/pg-core";


export const bookingStatusEnum = pgEnum("booking_status", [
  "CONFIRMED",
  "CANCELLED",
  "PENDING",
  "FAILED",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
]);

export const ticketStatusEnum = pgEnum("ticket_status", [
  "OPEN",
  "CLOSED",
  "PENDING",
  "IN_PROGRESS",
  "RESOLVED",
]);

export const genderEnum = pgEnum("gender", ["MALE", "FEMALE", "OTHER"]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "STRIPE",
  "CASH",
  "BKASH",
  "NAGAD",
  "MOCK",
]);

export const seatStatusEnum = pgEnum("seat_status", [
  "AVAILABLE",
  "BOOKED",
  "BLOCKED",
  "LOCKED",
  "MAINTENANCE",
  "OTHER",
]);

export const screenTypeEnum = pgEnum("screen_type", [
  "STANDARD",
  "IMAX",
  "DOLBY",
  "4DX",
  "VIP",
  "OTHER",
]);

export const movieStatusEnum = pgEnum("movie_status", [
  "COMING_SOON",
  "NOW_SHOWING",
  "RELEASED",
  "NOT_PLAYING",
  "UP_COMING",
]);

export const showStatusEnum = pgEnum("show_status", [
  "SCHEDULED",
  "CANCELLED",
  "ONGOING",
  "UPCOMING",
  "COMPLETED",
  "NOT_PLAYING",
]);

export const couponDiscountTypeEnum = pgEnum("coupon_discount_type", [
  "PERCENTAGE",
  "FIXED",
]);

// export const seatPreferenceEnum = pgEnum("seat_preference_enum", [
//   "STANDARD",
//   "PREMIUM",
//   "VIP",
//   "RECLINER",
//   "WHEELCHAIR",
// ]);

export const waitlistStatusEnum = pgEnum("waitlist_status", [
  "ACTIVE",
  "NOTIFIED",
  "EXPIRED",
  "CANCELLED",
]);


export const userTierEnum = pgEnum("user_tier", [
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "DIAMOND",
]);

export const adCategoryEnum = pgEnum("ad_category", [
  "PRE_ROLL",
  "MID_ROLL",
  "POST_ROLL",
]);

