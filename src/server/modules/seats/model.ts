import { t, type UnwrapSchema } from 'elysia'

export const SeatModel = {
	seatTypeResponse: t.Object({
		id: t.String(),
		name: t.String(),
		capacity: t.Number(),
		priceMultiplier: t.String(),
	}),
	seatResponse: t.Object({
		id: t.String(),
		screenId: t.String(),
		row: t.String(),
		number: t.Number(),
		seatTypeId: t.Nullable(t.String()),
		gridRow: t.Number(),
		gridColumn: t.Number(),
		priceMultiplier: t.String(),
	}),
	showSeatResponse: t.Object({
		id: t.String(),
		showId: t.String(),
		seatId: t.String(),
		bookingId: t.Nullable(t.String()),
		status: t.String(),
		row: t.String(),
		number: t.Number(),
		seatTypeName: t.String(),
		priceMultiplier: t.String(),
	}),
	listShowSeatsResponse: t.Array(
		t.Object({
			id: t.String(),
			showId: t.String(),
			seatId: t.String(),
			bookingId: t.Nullable(t.String()),
			status: t.String(),
			row: t.String(),
			number: t.Number(),
			seatTypeName: t.String(),
			priceMultiplier: t.String(),
		})
	),
	createSeatTypeBody: t.Object({
		name: t.String(),
		capacity: t.Optional(t.Number()),
		priceMultiplier: t.Optional(t.String()),
	}),
	createSeatsBody: t.Array(
		t.Object({
			screenId: t.String(),
			row: t.String(),
			number: t.Number(),
			seatTypeId: t.Optional(t.String()),
			gridRow: t.Number(),
			gridColumn: t.Number(),
			priceMultiplier: t.Optional(t.String()),
		})
	),
	errorResponse: t.Object({
		message: t.String(),
	}),
} as const

export type SeatModel = {
	[k in keyof typeof SeatModel]: UnwrapSchema<typeof SeatModel[k]>
}
