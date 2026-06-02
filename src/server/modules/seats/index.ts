import { Elysia, t } from 'elysia'
import { SeatService } from './service'
import { SeatModel } from './model'
import { isAdmin } from '@/server/middlewares/auth'

export const seats = new Elysia({ prefix: '/seats' })
	.get(
		'/types',
		async ({ query }) => {
			return await SeatService.listSeatTypes(query?.theaterId)
		},
		{
			query: t.Optional(
				t.Object({
					theaterId: t.Optional(t.String()),
				})
			),
			response: {
				200: t.Array(SeatModel.seatTypeResponse),
			},
			detail: {
				tags: ['Seats'],
				summary: 'Get all seat types',
				description: 'Get all seat types'
			}
		}
	)
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
			detail: {
				tags: ['Seats'],
				summary: 'Get seats for a show',
				description: 'Get seats for a show'
			}
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
			detail: {
				tags: ['Seats'],
				summary: 'Create a seat type',
				description: 'Create a seat type'
			}
		}
	)
	.put(
		'/types/:id',
		async ({ params: { id }, body }) => {
			return await SeatService.updateSeatType(id, body)
		},
		{
			params: t.Object({ id: t.String() }),
			body: SeatModel.updateSeatTypeBody,
			response: {
				200: SeatModel.seatTypeResponse,
				400: SeatModel.errorResponse,
				404: SeatModel.errorResponse,
			},
			detail: {
				tags: ['Seats'],
				summary: 'Update a seat type',
				description: 'Update a seat type'
			}
		}
	)
	.delete(
		'/types/:id',
		async ({ params: { id } }) => {
			return await SeatService.deleteSeatType(id)
		},
		{
			params: t.Object({ id: t.String() }),
			response: {
				200: SeatModel.deleteResponse,
				404: SeatModel.errorResponse,
			},
			detail: {
				tags: ['Seats'],
				summary: 'Delete a seat type',
				description: 'Delete a seat type'
			}
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
			detail: {
				tags: ['Seats'],
				summary: 'Create seats',
				description: 'Create seats'
			}
		}
	)
