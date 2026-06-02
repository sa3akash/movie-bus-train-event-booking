import { db } from '@/server/db'
import { seats, showSeats, seatType } from '@/server/db/schemas'
import { eq } from 'drizzle-orm'
import { status } from 'elysia'
import type { SeatModel } from './model'

export abstract class SeatService {
	static async listShowSeats(showId: string) {
		const results = await db
			.select({
				id: showSeats.id,
				showId: showSeats.showId,
				seatId: showSeats.seatId,
				bookingId: showSeats.bookingId,
				status: showSeats.status,
				row: seats.row,
				seatNumber: seats.seatNumber,
				seatTypeName: seatType.name,
				priceMultiplier: seatType.priceMultiplier,
				price: seatType.price,
				color: seatType.color,
				currency: seatType.currency,
			})
			.from(showSeats)
			.innerJoin(seats, eq(showSeats.seatId, seats.id))
			.leftJoin(seatType, eq(seats.seatTypeId, seatType.id))
			.where(eq(showSeats.showId, showId))

		return results.map(r => ({
			...r,
			seatTypeName: r.seatTypeName ?? 'STANDARD',
			priceMultiplier: r.priceMultiplier ?? '1.00',
			price: r.price ?? 0,
			color: r.color ?? '#FFD700',
			currency: r.currency ?? 'BDT',
		}))
	}

	static async listSeatTypes(theaterId?: string) {
		const query = db.select().from(seatType)
		if (theaterId) {
			query.where(eq(seatType.theaterId, theaterId))
		}
		
		const types = await query
		return types.map(t => ({
			id: t.id,
			name: t.name,
			capacity: t.capacity,
			priceMultiplier: t.priceMultiplier || '1.00',
			price: t.price,
			color: t.color || '#FFD700',
			currency: t.currency || 'BDT',
			theaterId: t.theaterId,
		}))
	}

	static async createSeatType(data: SeatModel['createSeatTypeBody']) {
		const [newType] = await db
			.insert(seatType)
			.values({
				theaterId: data.theaterId,
				name: data.name,
				capacity: data.capacity ?? 1,
				priceMultiplier: data.priceMultiplier ?? '1.00',
				price: data.price ?? 0,
				color: data.color ?? '#FFD700',
				currency: data.currency ?? 'BDT',
			})
			.returning()

		return {
			id: newType.id,
			name: newType.name,
			capacity: newType.capacity,
			priceMultiplier: newType.priceMultiplier || '1.00',
			price: newType.price,
			color: newType.color || '#FFD700',
			currency: newType.currency || 'BDT',
			theaterId: newType.theaterId,
		}
	}

	static async updateSeatType(id: string, data: SeatModel['updateSeatTypeBody']) {
		const [existing] = await db.select().from(seatType).where(eq(seatType.id, id)).limit(1)
		if (!existing) throw status(404, { message: 'Seat type not found' })

		const [updated] = await db
			.update(seatType)
			.set({
				name: data.name ?? undefined,
				capacity: data.capacity ?? undefined,
				priceMultiplier: data.priceMultiplier ?? undefined,
				price: data.price ?? undefined,
				color: data.color ?? undefined,
				currency: data.currency ?? undefined,
			})
			.where(eq(seatType.id, id))
			.returning()

		return {
			id: updated.id,
			name: updated.name,
			capacity: updated.capacity,
			priceMultiplier: updated.priceMultiplier || '1.00',
			price: updated.price,
			color: updated.color || '#FFD700',
			currency: updated.currency || 'BDT',
			theaterId: updated.theaterId,
		}
	}

	static async deleteSeatType(id: string) {
		const [existing] = await db.select().from(seatType).where(eq(seatType.id, id)).limit(1)
		if (!existing) throw status(404, { message: 'Seat type not found' })
		await db.delete(seatType).where(eq(seatType.id, id))
		return { message: 'Seat type deleted successfully' }
	}

	static async createSeats(data: SeatModel['createSeatsBody']) {
		if (data.length === 0) return []

		const newSeats = await db
			.insert(seats)
			.values(
				data.map((s) => ({
					screenId: s.screenId,
					row: s.row,
					seatNumber: s.seatNumber,
					seatTypeId: s.seatTypeId ?? null,
					posX: s.posX,
					posY: s.posY,
					rotation: s.rotation ?? '0',
					isAccessible: s.isAccessible ?? false,
				}))
			)
			.returning()

		return newSeats.map(ns => ({
			id: ns.id,
			screenId: ns.screenId,
			row: ns.row,
			seatNumber: ns.seatNumber,
			seatTypeId: ns.seatTypeId,
			posX: ns.posX,
			posY: ns.posY,
			rotation: ns.rotation,
			isAccessible: ns.isAccessible,
		}))
	}
}

