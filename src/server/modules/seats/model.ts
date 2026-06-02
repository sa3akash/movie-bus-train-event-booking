import { t, type UnwrapSchema } from 'elysia'

export const SeatModel = {
	seatTypeResponse: t.Object({
		id: t.String(),
		name: t.String(),
		capacity: t.Number(),
		priceMultiplier: t.String(),
		price: t.Number(),
		color: t.String(),
		currency: t.String(),
		theaterId: t.String(),
	}),
	seatResponse: t.Object({
		id: t.String(),
		screenId: t.String(),
		row: t.String(),
		seatNumber: t.Number(),
		seatTypeId: t.Nullable(t.String()),
		posX: t.String(),
		posY: t.String(),
		isAccessible: t.Boolean(),
		rotation: t.String(),
	}),
	showSeatResponse: t.Object({
		id: t.String(),
		showId: t.String(),
		seatId: t.String(),
		bookingId: t.Nullable(t.String()),
		status: t.String(),
		row: t.String(),
		seatNumber: t.Number(),
		seatTypeName: t.String(),
		priceMultiplier: t.String(),
		price: t.Number(),
		color: t.String(),
		currency: t.String(),
	}),
	listShowSeatsResponse: t.Array(
		t.Object({
			id: t.String(),
			showId: t.String(),
			seatId: t.String(),
			bookingId: t.Nullable(t.String()),
			status: t.String(),
			row: t.String(),
			seatNumber: t.Number(),
			seatTypeName: t.String(),
			priceMultiplier: t.String(),
			price: t.Number(),
			color: t.String(),
			currency: t.String(),
		})
	),
	createSeatTypeBody: t.Object({
		name: t.String(),
		theaterId: t.String(),
		capacity: t.Optional(t.Number()),
		priceMultiplier: t.Optional(t.String()),
		price: t.Optional(t.Number()),
		color: t.Optional(t.String()),
		currency: t.Optional(t.String()),
	}),
	updateSeatTypeBody: t.Object({
		name: t.Optional(t.String()),
		capacity: t.Optional(t.Number()),
		priceMultiplier: t.Optional(t.String()),
		price: t.Optional(t.Number()),
		color: t.Optional(t.String()),
		currency: t.Optional(t.String()),
	}),
	deleteResponse: t.Object({
		message: t.String(),
	}),
	createSeatsBody: t.Array(
		t.Object({
			screenId: t.String(),
			row: t.String(),
			seatNumber: t.Number(),
			seatTypeId: t.Optional(t.String()),
			posX: t.String(),
			posY: t.String(),
			rotation: t.Optional(t.String()),
			isAccessible: t.Optional(t.Boolean()),
		})
	),
	errorResponse: t.Object({
		message: t.String(),
	}),
} as const

export type SeatModel = {
	[k in keyof typeof SeatModel]: UnwrapSchema<typeof SeatModel[k]>
}
