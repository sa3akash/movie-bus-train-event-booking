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
				number: seats.number,
				seatTypeName: seatType.name,
				priceMultiplier: seats.priceMultiplier,
			})
			.from(showSeats)
			.innerJoin(seats, eq(showSeats.seatId, seats.id))
			.leftJoin(seatType, eq(seats.seatTypeId, seatType.id))
			.where(eq(showSeats.showId, showId))

		return results.map(r => ({
			...r,
			seatTypeName: r.seatTypeName ?? 'STANDARD',
		}))
	}

	static async createSeatType(data: SeatModel['createSeatTypeBody']) {
		const [newType] = await db
			.insert(seatType)
			.values({
				name: data.name,
				capacity: data.capacity ?? 1,
				priceMultiplier: data.priceMultiplier ?? '1.00',
			})
			.returning()

		return {
			id: newType.id,
			name: newType.name,
			capacity: newType.capacity,
			priceMultiplier: newType.priceMultiplier || '1.00',
		}
	}

	static async createSeats(data: SeatModel['createSeatsBody']) {
		if (data.length === 0) return []

		const newSeats = await db
			.insert(seats)
			.values(
				data.map((s) => ({
					screenId: s.screenId,
					row: s.row,
					number: s.number,
					seatTypeId: s.seatTypeId ?? null,
					gridRow: s.gridRow,
					gridColumn: s.gridColumn,
					priceMultiplier: s.priceMultiplier ?? '1.00',
				}))
			)
			.returning()

		return newSeats.map(ns => ({
			id: ns.id,
			screenId: ns.screenId,
			row: ns.row,
			number: ns.number,
			seatTypeId: ns.seatTypeId,
			gridRow: ns.gridRow,
			gridColumn: ns.gridColumn,
			priceMultiplier: ns.priceMultiplier || '1.00',
		}))
	}
}

