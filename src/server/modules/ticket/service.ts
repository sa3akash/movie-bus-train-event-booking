import { db } from '@/server/db'
import { bookings, userRoles, roles } from '@/server/db/schemas'
import { eq, and, or } from 'drizzle-orm'
import { status } from 'elysia'
import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'
import type { TicketModel } from './model'

export abstract class TicketService {
	static async getTicketDetails(bookingId: string, userId: string) {
		const bookingRecord = await db.query.bookings.findFirst({
			where: eq(bookings.id, bookingId),
			with: {
				user: true,
				show: {
					with: {
						movie: true,
						screen: {
							with: {
								theatre: true
							}
						}
					}
				},
				showSeats: {
					with: {
						seat: true
					}
				}
			}
		})

		if (!bookingRecord) {
			throw status(404, { message: 'Booking not found' })
		}

		// Role check
		const userRoleRecords = await db
			.select()
			.from(userRoles)
			.innerJoin(roles, eq(userRoles.roleId, roles.id))
			.where(
				and(
					eq(userRoles.userId, userId),
					or(
						eq(roles.name, 'admin'),
						eq(roles.name, 'staff')
					)
				)
			)
		const isStaffOrAdmin = userRoleRecords.length > 0

		if (bookingRecord.userId !== userId && !isStaffOrAdmin) {
			throw status(403, { message: 'Forbidden' })
		}

		const seatLabels = bookingRecord.showSeats.map(ss => `${ss.seat.row}-${ss.seat.number}`)

		return {
			id: bookingRecord.id,
			bookingNumber: bookingRecord.bookingNumber,
			movieTitle: bookingRecord.show.movie.title,
			startTime: bookingRecord.show.startTime,
			endTime: bookingRecord.show.endTime,
			screenName: bookingRecord.show.screen.name,
			theaterName: bookingRecord.show.screen.theatre.name,
			seats: seatLabels,
			status: bookingRecord.status,
			checkedIn: bookingRecord.checkedIn ?? false,
			checkedInAt: bookingRecord.checkedInAt,
			userName: bookingRecord.user.name,
			userEmail: bookingRecord.user.email,
		}
	}

	static async generateTicketPDF(bookingId: string, userId: string): Promise<Buffer> {
		const bookingRecord = await db.query.bookings.findFirst({
			where: eq(bookings.id, bookingId),
			with: {
				user: true,
				show: {
					with: {
						movie: true,
						screen: {
							with: {
								theatre: true
							}
						}
					}
				},
				showSeats: {
					with: {
						seat: true
					}
				}
			}
		})

		if (!bookingRecord) {
			throw status(404, { message: 'Booking not found' })
		}

		// Role check
		const userRoleRecords = await db
			.select()
			.from(userRoles)
			.innerJoin(roles, eq(userRoles.roleId, roles.id))
			.where(
				and(
					eq(userRoles.userId, userId),
					or(
						eq(roles.name, 'admin'),
						eq(roles.name, 'staff')
					)
				)
			)
		const isStaffOrAdmin = userRoleRecords.length > 0

		if (bookingRecord.userId !== userId && !isStaffOrAdmin) {
			throw status(403, { message: 'Forbidden' })
		}

		if (bookingRecord.status !== 'CONFIRMED') {
			throw status(400, { message: 'Ticket has not been confirmed/paid yet' })
		}

		return new Promise<Buffer>((resolve, reject) => {
			const doc = new PDFDocument({ margin: 50 })
			const chunks: Buffer[] = []

			doc.on('data', chunk => chunks.push(chunk))
			doc.on('end', () => resolve(Buffer.concat(chunks)))
			doc.on('error', err => reject(err))

			// Title
			doc.fillColor('#111827').fontSize(24).text('MOVIE TICKET & INVOICE', { align: 'center' })
			doc.moveDown()

			// Line separator
			doc.strokeColor('#e5e7eb').lineWidth(1)
			doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
			doc.moveDown()

			// Order details
			doc.fontSize(12).fillColor('#4b5563')
			doc.text(`Booking Number: ${bookingRecord.bookingNumber}`)
			doc.text(`Ticket Status: ${bookingRecord.status}`)
			doc.text(`Issued On: ${new Date(bookingRecord.createdAt).toLocaleString()}`)
			doc.moveDown()

			// Show Details
			doc.fontSize(16).fillColor('#111827').text('Show Information', { underline: true })
			doc.fontSize(12).fillColor('#4b5563')
			doc.moveDown(0.5)
			doc.text(`Movie: ${bookingRecord.show.movie.title}`)
			doc.text(`Theater: ${bookingRecord.show.screen.theatre.name}`)
			doc.text(`Screen: ${bookingRecord.show.screen.name}`)
			doc.text(`Start Time: ${new Date(bookingRecord.show.startTime).toLocaleString()}`)
			doc.text(`End Time: ${new Date(bookingRecord.show.endTime).toLocaleString()}`)
			doc.moveDown()

			// Seat Details
			const seatLabels = bookingRecord.showSeats.map(ss => `${ss.seat.row}-${ss.seat.number}`).join(', ')
			doc.fontSize(14).fillColor('#111827').text(`Selected Seats: ${seatLabels}`)
			doc.moveDown()

			// Customer details
			doc.fontSize(16).text('Customer Details', { underline: true })
			doc.fontSize(12).fillColor('#4b5563')
			doc.moveDown(0.5)
			doc.text(`Name: ${bookingRecord.user.name}`)
			doc.text(`Email: ${bookingRecord.user.email}`)
			doc.moveDown()

			// Payment details
			doc.fontSize(16).fillColor('#111827').text('Payment Breakdown', { underline: true })
			doc.fontSize(12).fillColor('#4b5563')
			doc.moveDown(0.5)
			doc.text(`Subtotal: $${bookingRecord.subtotal}`)
			doc.text(`Convenience Fee: $${bookingRecord.convenienceFee}`)
			doc.text(`Discount: -$${bookingRecord.discountAmount}`)
			doc.fontSize(14).fillColor('#111827').text(`Total Paid: $${bookingRecord.totalAmount}`)
			doc.moveDown()

			doc.strokeColor('#e5e7eb').lineWidth(1)
			doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()
			doc.moveDown()

			doc.fontSize(11).fillColor('#9ca3af').text('Please present this PDF or show the QR code on your mobile device at the entrance of the cinema hall.', { align: 'center' })

			doc.end()
		})
	}

	static async generateTicketQRCode(bookingId: string, userId: string): Promise<Buffer> {
		const bookingRecord = await db.query.bookings.findFirst({
			where: eq(bookings.id, bookingId),
			with: {
				user: true
			}
		})

		if (!bookingRecord) {
			throw status(404, { message: 'Booking not found' })
		}

		// Role check
		const userRoleRecords = await db
			.select()
			.from(userRoles)
			.innerJoin(roles, eq(userRoles.roleId, roles.id))
			.where(
				and(
					eq(userRoles.userId, userId),
					or(
						eq(roles.name, 'admin'),
						eq(roles.name, 'staff')
					)
				)
			)
		const isStaffOrAdmin = userRoleRecords.length > 0

		if (bookingRecord.userId !== userId && !isStaffOrAdmin) {
			throw status(403, { message: 'Forbidden' })
		}

		if (bookingRecord.status !== 'CONFIRMED') {
			throw status(400, { message: 'Ticket has not been confirmed/paid yet' })
		}

		const data = JSON.stringify({
			bookingId: bookingRecord.id,
			bookingNumber: bookingRecord.bookingNumber,
			userId: bookingRecord.userId
		})

		return await QRCode.toBuffer(data, { type: 'png', margin: 2, width: 250 })
	}

	static async checkIn(bookingId: string) {
		return await db.transaction(async (tx) => {
			const [bookingRecord] = await tx
				.select()
				.from(bookings)
				.where(eq(bookings.id, bookingId))
				.limit(1)

			if (!bookingRecord) {
				throw status(404, { message: 'Booking not found' })
			}

			if (bookingRecord.status !== 'CONFIRMED') {
				throw status(400, { message: 'Ticket has not been paid or confirmed' })
			}

			if (bookingRecord.checkedIn) {
				throw status(400, { message: 'Ticket has already been checked in' })
			}

			const now = new Date()

			await tx
				.update(bookings)
				.set({
					checkedIn: true,
					checkedInAt: now,
				})
				.where(eq(bookings.id, bookingId))

			return {
				message: 'Check-in successful',
				checkedInAt: now,
			}
		})
	}
}
