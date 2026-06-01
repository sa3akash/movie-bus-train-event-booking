import { t, type UnwrapSchema } from 'elysia'

export const TicketModel = {
	ticketDetailsResponse: t.Object({
		id: t.String(),
		bookingNumber: t.String(),
		movieTitle: t.String(),
		startTime: t.Any(),
		endTime: t.Any(),
		screenName: t.String(),
		theaterName: t.String(),
		seats: t.Array(t.String()),
		status: t.String(),
		checkedIn: t.Boolean(),
		checkedInAt: t.Nullable(t.Any()),
		userName: t.String(),
		userEmail: t.String(),
	}),
	checkInResponse: t.Object({
		message: t.String(),
		checkedInAt: t.Any(),
	}),
	errorResponse: t.Object({
		message: t.String(),
	}),
} as const

export type TicketModel = {
	[k in keyof typeof TicketModel]: UnwrapSchema<typeof TicketModel[k]>
}
