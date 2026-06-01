import { Elysia, t } from 'elysia'
import { SeatService } from './service'
import { SeatModel } from './model'
import { isAdmin } from '@/server/middlewares/auth'

export const seats = new Elysia({ prefix: '/seats' })
	.get(
		'/show/:showId',
		async ({ params: { showId } }) => {
			return await SeatService.listShowSeats(showId)
		},
		{
			params: t.Object({
				showId: t.String(),
			}),
			response: {
				200: SeatModel.listShowSeatsResponse,
			},
		}
	)
	// Admin protected routes
	.use(isAdmin)
	.post(
		'/types',
		async ({ body }) => {
			return await SeatService.createSeatType(body)
		},
		{
			body: SeatModel.createSeatTypeBody,
			response: {
				200: SeatModel.seatTypeResponse,
				400: SeatModel.errorResponse,
			},
		}
	)
	.post(
		'/',
		async ({ body }) => {
			return await SeatService.createSeats(body)
		},
		{
			body: SeatModel.createSeatsBody,
			response: {
				200: t.Array(SeatModel.seatResponse),
				400: SeatModel.errorResponse,
			},
		}
	)
