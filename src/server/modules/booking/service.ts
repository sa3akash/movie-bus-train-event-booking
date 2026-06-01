import { db } from '@/server/db'
import { bookings, shows, showSeats, seats, movies } from '@/server/db/schemas'
import { eq, and, inArray } from 'drizzle-orm'
import { status } from 'elysia'
import type { BookingModel } from './model'

export abstract class BookingService {
	static async createBooking(userId: string, data: BookingModel['createBookingBody']) {
		return await db.transaction(async (tx) => {
			// 1. Get show details
			const [show] = await tx
				.select()
				.from(shows)
				.where(eq(shows.id, data.showId))
				.limit(1)

			if (!show) {
				throw status(400, { message: 'Show not found' })
			}

			// 2. Fetch selected show seats and join with seats to get price multiplier
			const selectedSeats = await tx
				.select({
					showSeatId: showSeats.id,
					status: showSeats.status,
					priceMultiplier: seats.priceMultiplier,
				})
				.from(showSeats)
				.innerJoin(seats, eq(showSeats.seatId, seats.id))
				.where(
					and(
						eq(showSeats.showId, data.showId),
						inArray(showSeats.id, data.showSeatIds)
					)
				)

			if (selectedSeats.length !== data.showSeatIds.length) {
				throw status(400, { message: 'Some selected seats are invalid for this show' })
			}

			// 3. Verify all selected seats are AVAILABLE
			const unavailable = selectedSeats.filter(s => s.status !== 'AVAILABLE')
			if (unavailable.length > 0) {
				throw status(400, { message: 'Some of the selected seats are already reserved' })
			}

			// 4. Calculate total amount
			const basePrice = parseFloat(show.basePrice)
			let subtotal = 0
			for (const seat of selectedSeats) {
				const mult = parseFloat(seat.priceMultiplier)
				subtotal += basePrice * mult
			}

			const convenienceFee = 5.00 // flat convenience fee
			const totalAmount = subtotal + convenienceFee

			const bookingNumber = `BK-${Date.now()}-${Math.floor(Math.random() * 1000)}`
			const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

			// 5. Create booking
			const [newBooking] = await tx
				.insert(bookings)
				.values({
					bookingNumber,
					userId,
					showId: data.showId,
					subtotal: subtotal.toFixed(2),
					convenienceFee: convenienceFee.toFixed(2),
					discountAmount: '0.00',
					totalAmount: totalAmount.toFixed(2),
					status: 'PENDING',
					expiresAt,
				})
				.returning()

			// 6. Lock show seats and associate with booking
			await tx
				.update(showSeats)
				.set({
					status: 'LOCKED',
					bookingId: newBooking.id,
				})
				.where(inArray(showSeats.id, data.showSeatIds))

			// 7. Decrement available seats in show
			await tx
				.update(shows)
				.set({
					availableSeats: show.availableSeats - data.showSeatIds.length
				})
				.where(eq(shows.id, data.showId))

			return newBooking
		})
	}

	static async listUserBookings(userId: string) {
		const results = await db
			.select({
				id: bookings.id,
				bookingNumber: bookings.bookingNumber,
				showId: bookings.showId,
				movieTitle: movies.title,
				startTime: shows.startTime,
				totalAmount: bookings.totalAmount,
				status: bookings.status,
				checkedIn: bookings.checkedIn,
			})
			.from(bookings)
			.innerJoin(shows, eq(bookings.showId, shows.id))
			.innerJoin(movies, eq(shows.movieId, movies.id))
			.where(eq(bookings.userId, userId))

		return results
	}

	static async cancelBooking(userId: string, bookingId: string) {
		return await db.transaction(async (tx) => {
			const [booking] = await tx
				.select()
				.from(bookings)
				.where(
					and(
						eq(bookings.id, bookingId),
						eq(bookings.userId, userId)
					)
				)
				.limit(1)

			if (!booking) {
				throw status(404, { message: 'Booking not found' })
			}

			if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
				throw status(400, { message: 'Booking cannot be cancelled from its current state' })
			}

			// Get all seats associated with this booking
			const bookedSeats = await tx
				.select()
				.from(showSeats)
				.where(eq(showSeats.bookingId, bookingId))

			// 1. Release the seats
			if (bookedSeats.length > 0) {
				await tx
					.update(showSeats)
					.set({
						status: 'AVAILABLE',
						bookingId: null,
					})
					.where(eq(showSeats.bookingId, bookingId))
			}

			// 2. Increment show availability
			const [show] = await tx
				.select()
				.from(shows)
				.where(eq(shows.id, booking.showId))
				.limit(1)

			if (show) {
				await tx
					.update(shows)
					.set({
						availableSeats: show.availableSeats + bookedSeats.length
					})
					.where(eq(shows.id, booking.showId))
			}

			// 3. Mark booking as cancelled
			const [cancelledBooking] = await tx
				.update(bookings)
				.set({ status: 'CANCELLED' })
				.where(eq(bookings.id, bookingId))
				.returning()

			return cancelledBooking
		})
	}
}
