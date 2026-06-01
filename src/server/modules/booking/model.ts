import { t, type UnwrapSchema } from 'elysia'

export const BookingModel = {
	createBookingBody: t.Object({
		showId: t.String(),
		showSeatIds: t.Array(t.String()),
	}),
	bookingResponse: t.Object({
		id: t.String(),
		bookingNumber: t.String(),
		userId: t.String(),
		showId: t.String(),
		subtotal: t.String(),
		convenienceFee: t.Nullable(t.String()),
		discountAmount: t.Nullable(t.String()),
		totalAmount: t.String(),
		status: t.String(),
		expiresAt: t.Nullable(t.Any()),
		checkedIn: t.Nullable(t.Boolean()),
	}),
	listBookingsResponse: t.Array(
		t.Object({
			id: t.String(),
			bookingNumber: t.String(),
			showId: t.String(),
			movieTitle: t.String(),
			startTime: t.Any(),
			totalAmount: t.String(),
			status: t.String(),
			checkedIn: t.Nullable(t.Boolean()),
		})
	),
	errorResponse: t.Object({
		message: t.String(),
	}),
} as const

export type BookingModel = {
	[k in keyof typeof BookingModel]: UnwrapSchema<typeof BookingModel[k]>
}
