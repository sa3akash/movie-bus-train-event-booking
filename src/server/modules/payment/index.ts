import { Elysia, t } from 'elysia'
import { PaymentService } from './service'
import { PaymentModel } from './model'
import { isAuthenticated } from '@/server/middlewares/auth'

export const payment = new Elysia({ prefix: '/payment' })
	.use(isAuthenticated)
	.post(
		'/pay',
		async ({ user, body }) => {
			return await PaymentService.pay(user!.id, body)
		},
		{
			body: PaymentModel.payBody,
			response: {
				200: PaymentModel.paymentResponse,
				400: PaymentModel.errorResponse,
				404: PaymentModel.errorResponse,
			},
		}
	)
