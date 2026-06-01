import { Elysia, t } from 'elysia'
import { TicketService } from './service'
import { TicketModel } from './model'
import { isAuthenticated, isAdminOrStaff } from '@/server/middlewares/auth'

export const ticket = new Elysia({ prefix: '/ticket' })
	.use(isAuthenticated)
	.get(
		'/:bookingId',
		async ({ user, params: { bookingId } }) => {
			return await TicketService.getTicketDetails(bookingId, user!.id)
		},
		{
			params: t.Object({
				bookingId: t.String(),
			}),
			response: {
				200: TicketModel.ticketDetailsResponse,
				400: TicketModel.errorResponse,
				403: TicketModel.errorResponse,
				404: TicketModel.errorResponse,
			},
		}
	)
	.get(
		'/:bookingId/pdf',
		async ({ user, params: { bookingId }, set }) => {
			const buffer = await TicketService.generateTicketPDF(bookingId, user!.id)
			set.headers['content-type'] = 'application/pdf'
			set.headers['content-disposition'] = `attachment; filename="ticket-${bookingId}.pdf"`
			return buffer
		},
		{
			params: t.Object({
				bookingId: t.String(),
			}),
		}
	)
	.get(
		'/:bookingId/qrcode',
		async ({ user, params: { bookingId }, set }) => {
			const buffer = await TicketService.generateTicketQRCode(bookingId, user!.id)
			set.headers['content-type'] = 'image/png'
			return buffer
		},
		{
			params: t.Object({
				bookingId: t.String(),
			}),
		}
	)
	.use(isAdminOrStaff)
	.post(
		'/:bookingId/check-in',
		async ({ params: { bookingId } }) => {
			return await TicketService.checkIn(bookingId)
		},
		{
			params: t.Object({
				bookingId: t.String(),
			}),
			response: {
				200: TicketModel.checkInResponse,
				400: TicketModel.errorResponse,
				404: TicketModel.errorResponse,
			},
		}
	)
