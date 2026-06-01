import { Elysia, t } from 'elysia'
import { BookingService } from './service'
import { BookingModel } from './model'
import { isAuthenticated } from '@/server/middlewares/auth'

export const booking = new Elysia({ prefix: '/booking' })
	.use(isAuthenticated)
	.post(
		'/',
		async ({ user, body }) => {
			return await BookingService.createBooking(user!.id, body)
		},
		{
			body: BookingModel.createBookingBody,
			response: {
				200: BookingModel.bookingResponse,
				400: BookingModel.errorResponse,
			},
		}
	)
	.get(
		'/',
		async ({ user }) => {
			return await BookingService.listUserBookings(user!.id)
		},
		{
			response: {
				200: BookingModel.listBookingsResponse,
			},
		}
	)
	.post(
		'/:id/cancel',
		async ({ user, params: { id } }) => {
			return await BookingService.cancelBooking(user!.id, id)
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			response: {
				200: BookingModel.bookingResponse,
				400: BookingModel.errorResponse,
				404: BookingModel.errorResponse,
			},
		}
	)
