import { t, type UnwrapSchema } from 'elysia'

export const PaymentModel = {
	payBody: t.Object({
		bookingId: t.String(),
		paymentMethod: t.Union([
			t.Literal('STRIPE'),
			t.Literal('CASH'),
			t.Literal('BKASH'),
			t.Literal('NAGAD'),
			t.Literal('MOCK'),
		]),
	}),
	paymentResponse: t.Object({
		id: t.String(),
		paymentNumber: t.String(),
		bookingId: t.String(),
		userId: t.String(),
		amount: t.String(),
		status: t.String(),
		paymentMethod: t.String(),
		transactionId: t.Nullable(t.String()),
	}),
	errorResponse: t.Object({
		message: t.String(),
	}),
} as const

export type PaymentModel = {
	[k in keyof typeof PaymentModel]: UnwrapSchema<typeof PaymentModel[k]>
}
