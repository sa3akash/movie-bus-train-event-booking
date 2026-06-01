import { db } from '@/server/db'
import { theatersTable, cinemaScreens, cineplexChain } from '@/server/db/schemas'
import { eq, and, ilike, isNull } from 'drizzle-orm'
import { status } from 'elysia'
import type { CinemaModel } from './model'

export abstract class CinemaService {
	static async listChains() {
		return await db
			.select()
			.from(cineplexChain)
			.where(isNull(cineplexChain.deletedAt))
	}

	static async createChain(data: CinemaModel['createChainBody']) {
		const existing = await db
			.select()
			.from(cineplexChain)
			.where(eq(cineplexChain.slug, data.slug))
			.limit(1)

		if (existing.length > 0) {
			throw status(400, { message: 'Chain slug already exists' })
		}

		const [newChain] = await db
			.insert(cineplexChain)
			.values({
				name: data.name,
				slug: data.slug,
				description: data.description ?? null,
				logoUrl: data.logoUrl ?? null,
				website: data.website ?? null,
				contactEmail: data.contactEmail ?? null,
				contactPhone: data.contactPhone ?? null,
				isActive: true,
			})
			.returning()

		return newChain
	}

	static async updateChain(id: string, data: CinemaModel['updateChainBody']) {
		const [chain] = await db
			.select()
			.from(cineplexChain)
			.where(eq(cineplexChain.id, id))
			.limit(1)

		if (!chain) {
			throw status(404, { message: 'Chain not found' })
		}

		if (data.slug && data.slug !== chain.slug) {
			const existing = await db
				.select()
				.from(cineplexChain)
				.where(eq(cineplexChain.slug, data.slug))
				.limit(1)
			if (existing.length > 0) {
				throw status(400, { message: 'Chain slug already exists' })
			}
		}

		const [updated] = await db
			.update(cineplexChain)
			.set({
				name: data.name ?? undefined,
				slug: data.slug ?? undefined,
				description: data.description !== undefined ? data.description : undefined,
				logoUrl: data.logoUrl !== undefined ? data.logoUrl : undefined,
				website: data.website !== undefined ? data.website : undefined,
				contactEmail: data.contactEmail !== undefined ? data.contactEmail : undefined,
				contactPhone: data.contactPhone !== undefined ? data.contactPhone : undefined,
				isActive: data.isActive !== undefined ? data.isActive : undefined,
			})
			.where(eq(cineplexChain.id, id))
			.returning()

		return updated
	}

	static async deleteChain(id: string) {
		const [chain] = await db
			.select()
			.from(cineplexChain)
			.where(eq(cineplexChain.id, id))
			.limit(1)

		if (!chain) {
			throw status(404, { message: 'Chain not found' })
		}

		await db
			.update(cineplexChain)
			.set({
				deletedAt: new Date(),
				isActive: false,
			})
			.where(eq(cineplexChain.id, id))

		return { message: 'Chain deleted successfully' }
	}

	static async listTheaters(params: { city?: string; search?: string }) {
		const conditions = [eq(theatersTable.isActive, true), isNull(theatersTable.deletedAt)]
		if (params.city) {
			conditions.push(eq(theatersTable.city, params.city))
		}
		if (params.search) {
			conditions.push(ilike(theatersTable.name, `%${params.search}%`))
		}

		const query = db
			.select({
				id: theatersTable.id,
				name: theatersTable.name,
				slug: theatersTable.slug,
				address: theatersTable.address,
				city: theatersTable.city,
				totalScreens: theatersTable.totalScreens,
				logoUrl: theatersTable.logoUrl,
			})
			.from(theatersTable)
			.where(and(...conditions))

		return await query
	}

	static async listAdminTheaters() {
		return await db
			.select()
			.from(theatersTable)
			.where(isNull(theatersTable.deletedAt))
	}

	static async findTheaterBySlug(slug: string) {
		const [theater] = await db
			.select()
			.from(theatersTable)
			.where(eq(theatersTable.slug, slug))
			.limit(1)

		if (!theater) {
			throw status(404, { message: 'Theater not found' })
		}

		return theater
	}

	static async listScreens(theaterId: string) {
		return await db
			.select({
				id: cinemaScreens.id,
				name: cinemaScreens.name,
				screenType: cinemaScreens.screenType,
				totalSeats: cinemaScreens.totalSeats,
			})
			.from(cinemaScreens)
			.where(
				and(
					eq(cinemaScreens.theatreId, theaterId),
					eq(cinemaScreens.isActive, true),
					isNull(cinemaScreens.deletedAt)
				)
			)
	}

	static async listAllAdminScreens() {
		return await db
			.select({
				id: cinemaScreens.id,
				theatreId: cinemaScreens.theatreId,
				name: cinemaScreens.name,
				screenType: cinemaScreens.screenType,
				totalSeats: cinemaScreens.totalSeats,
				isActive: cinemaScreens.isActive,
			})
			.from(cinemaScreens)
			.where(isNull(cinemaScreens.deletedAt))
	}

	static async createTheater(data: CinemaModel['createTheaterBody']) {
		const existing = await db
			.select()
			.from(theatersTable)
			.where(eq(theatersTable.slug, data.slug))
			.limit(1)

		if (existing.length > 0) {
			throw status(400, { message: 'Theater slug already exists' })
		}

		const [newTheater] = await db
			.insert(theatersTable)
			.values({
				cineplexChainId: data.cineplexChainId ?? null,
				name: data.name,
				slug: data.slug,
				description: data.description ?? null,
				address: data.address ?? null,
				city: data.city,
				state: data.state,
				phone: data.phone ?? null,
				email: data.email ?? null,
				website: data.website ?? null,
				logoUrl: data.logoUrl ?? null,
				parkingAvailable: data.parkingAvailable ?? false,
				wheelchairAccessible: data.wheelchairAccessible ?? false,
				foodAllowed: data.foodAllowed ?? true,
				isActive: true,
			})
			.returning()

		// Increment chain total cinemas
		if (data.cineplexChainId) {
			const [chain] = await db.select().from(cineplexChain).where(eq(cineplexChain.id, data.cineplexChainId)).limit(1)
			if (chain) {
				await db.update(cineplexChain).set({ totalCinemas: chain.totalCinemas + 1 }).where(eq(cineplexChain.id, data.cineplexChainId))
			}
		}

		return newTheater
	}

	static async updateTheater(id: string, data: CinemaModel['updateTheaterBody']) {
		const [theater] = await db
			.select()
			.from(theatersTable)
			.where(eq(theatersTable.id, id))
			.limit(1)

		if (!theater) {
			throw status(404, { message: 'Theater not found' })
		}

		if (data.slug && data.slug !== theater.slug) {
			const existing = await db
				.select()
				.from(theatersTable)
				.where(eq(theatersTable.slug, data.slug))
				.limit(1)
			if (existing.length > 0) {
				throw status(400, { message: 'Theater slug already exists' })
			}
		}

		// Update totalCinemas count in the old and new chain if chain changed
		if (data.cineplexChainId !== undefined && data.cineplexChainId !== theater.cineplexChainId) {
			if (theater.cineplexChainId) {
				const [oldChain] = await db.select().from(cineplexChain).where(eq(cineplexChain.id, theater.cineplexChainId)).limit(1)
				if (oldChain) {
					await db.update(cineplexChain).set({ totalCinemas: Math.max(0, oldChain.totalCinemas - 1) }).where(eq(cineplexChain.id, theater.cineplexChainId))
				}
			}
			if (data.cineplexChainId) {
				const [newChain] = await db.select().from(cineplexChain).where(eq(cineplexChain.id, data.cineplexChainId)).limit(1)
				if (newChain) {
					await db.update(cineplexChain).set({ totalCinemas: newChain.totalCinemas + 1 }).where(eq(cineplexChain.id, data.cineplexChainId))
				}
			}
		}

		const [updated] = await db
			.update(theatersTable)
			.set({
				cineplexChainId: data.cineplexChainId,
				name: data.name ?? undefined,
				slug: data.slug ?? undefined,
				description: data.description !== undefined ? data.description : undefined,
				address: data.address !== undefined ? data.address : undefined,
				city: data.city ?? undefined,
				state: data.state ?? undefined,
				phone: data.phone !== undefined ? data.phone : undefined,
				email: data.email !== undefined ? data.email : undefined,
				website: data.website !== undefined ? data.website : undefined,
				logoUrl: data.logoUrl !== undefined ? data.logoUrl : undefined,
				parkingAvailable: data.parkingAvailable !== undefined ? data.parkingAvailable : undefined,
				wheelchairAccessible: data.wheelchairAccessible !== undefined ? data.wheelchairAccessible : undefined,
				foodAllowed: data.foodAllowed !== undefined ? data.foodAllowed : undefined,
				isActive: data.isActive !== undefined ? data.isActive : undefined,
			})
			.where(eq(theatersTable.id, id))
			.returning()

		return updated
	}

	static async deleteTheater(id: string) {
		const [theater] = await db
			.select()
			.from(theatersTable)
			.where(eq(theatersTable.id, id))
			.limit(1)

		if (!theater) {
			throw status(404, { message: 'Theater not found' })
		}

		await db
			.update(theatersTable)
			.set({
				deletedAt: new Date(),
				isActive: false,
			})
			.where(eq(theatersTable.id, id))

		// Decrement totalCinemas in parent chain
		if (theater.cineplexChainId) {
			const [chain] = await db.select().from(cineplexChain).where(eq(cineplexChain.id, theater.cineplexChainId)).limit(1)
			if (chain) {
				await db.update(cineplexChain).set({ totalCinemas: Math.max(0, chain.totalCinemas - 1) }).where(eq(cineplexChain.id, theater.cineplexChainId))
			}
		}

		return { message: 'Theater deleted successfully' }
	}

	static async createScreen(data: CinemaModel['createScreenBody']) {
		// Check theater exists
		const [theater] = await db
			.select()
			.from(theatersTable)
			.where(eq(theatersTable.id, data.theatreId))
			.limit(1)

		if (!theater) {
			throw status(400, { message: 'Theater not found' })
		}

		const [newScreen] = await db
			.insert(cinemaScreens)
			.values({
				theatreId: data.theatreId,
				name: data.name,
				screenType: data.screenType ?? 'STANDARD',
				totalSeats: data.totalSeats,
				isActive: true,
			})
			.returning()

		// Increment screen count in theater
		await db
			.update(theatersTable)
			.set({ totalScreens: theater.totalScreens + 1 })
			.where(eq(theatersTable.id, data.theatreId))

		return newScreen
	}

	static async updateScreen(id: string, data: CinemaModel['updateScreenBody']) {
		const [screen] = await db
			.select()
			.from(cinemaScreens)
			.where(eq(cinemaScreens.id, id))
			.limit(1)

		if (!screen) {
			throw status(404, { message: 'Screen not found' })
		}

		const [updated] = await db
			.update(cinemaScreens)
			.set({
				name: data.name ?? undefined,
				screenType: data.screenType ?? undefined,
				totalSeats: data.totalSeats ?? undefined,
				isActive: data.isActive !== undefined ? data.isActive : undefined,
			})
			.where(eq(cinemaScreens.id, id))
			.returning()

		return updated
	}

	static async deleteScreen(id: string) {
		const [screen] = await db
			.select()
			.from(cinemaScreens)
			.where(eq(cinemaScreens.id, id))
			.limit(1)

		if (!screen) {
			throw status(404, { message: 'Screen not found' })
		}

		await db
			.update(cinemaScreens)
			.set({
				deletedAt: new Date(),
				isActive: false,
			})
			.where(eq(cinemaScreens.id, id))

		// Decrement screen count in parent theater
		const [theater] = await db
			.select()
			.from(theatersTable)
			.where(eq(theatersTable.id, screen.theatreId))
			.limit(1)

		if (theater) {
			await db
				.update(theatersTable)
				.set({ totalScreens: Math.max(0, theater.totalScreens - 1) })
				.where(eq(theatersTable.id, screen.theatreId))
		}

		return { message: 'Screen deleted successfully' }
	}
}
