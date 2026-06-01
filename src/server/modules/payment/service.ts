import { db } from '@/server/db'
import { bookings, payments, shows, showSeats } from '@/server/db/schemas'
import { eq, and } from 'drizzle-orm'
import { status } from 'elysia'
import type { PaymentModel } from './model'

export abstract class PaymentService {
	static async pay(userId: string, data: PaymentModel['payBody']) {
		return await db.transaction(async (tx) => {
			// Find the booking
			const [booking] = await tx
				.select()
				.from(bookings)
				.where(
					and(
						eq(bookings.id, data.bookingId),
						eq(bookings.userId, userId)
					)
				)
				.limit(1)

			if (!booking) {
				throw status(404, { message: 'Booking not found' })
			}

			if (booking.status !== 'PENDING') {
				throw status(400, { message: 'Booking is not pending' })
			}

			// Check expiration
			if (booking.expiresAt && booking.expiresAt < new Date()) {
				// Expired! Release seats.
				const seatsToRelease = await tx
					.select()
					.from(showSeats)
					.where(eq(showSeats.bookingId, booking.id))

				if (seatsToRelease.length > 0) {
					await tx
						.update(showSeats)
						.set({
							status: 'AVAILABLE',
							bookingId: null,
						})
						.where(eq(showSeats.bookingId, booking.id))

					// Retrieve show
					const [show] = await tx
						.select()
						.from(shows)
						.where(eq(shows.id, booking.showId))
						.limit(1)

					if (show) {
						await tx
							.update(shows)
							.set({
								availableSeats: show.availableSeats + seatsToRelease.length
							})
							.where(eq(shows.id, booking.showId))
					}
				}

				// Mark booking as CANCELLED
				await tx
					.update(bookings)
					.set({ status: 'CANCELLED' })
					.where(eq(bookings.id, booking.id))

				throw status(400, { message: 'Booking has expired' })
			}

			// Create payment record
			const paymentNumber = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`
			const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`

			const [newPayment] = await tx
				.insert(payments)
				.values({
					paymentNumber,
					bookingId: booking.id,
					userId,
					amount: booking.totalAmount,
					status: 'COMPLETED',
					paymentMethod: data.paymentMethod,
					transactionId,
				})
				.returning()

			// Update booking
			await tx
				.update(bookings)
				.set({ status: 'CONFIRMED' })
				.where(eq(bookings.id, booking.id))

			// Update show seats status
			await tx
				.update(showSeats)
				.set({ status: 'BOOKED' })
				.where(eq(showSeats.bookingId, booking.id))

			return {
				id: newPayment.id,
				paymentNumber: newPayment.paymentNumber,
				bookingId: newPayment.bookingId,
				userId: newPayment.userId,
				amount: newPayment.amount,
				status: newPayment.status,
				paymentMethod: newPayment.paymentMethod || 'MOCK',
				transactionId: newPayment.transactionId,
			}
		})
	}
}
