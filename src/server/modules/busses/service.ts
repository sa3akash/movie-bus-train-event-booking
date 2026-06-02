import { db } from '@/server/db'
import {
	busBrands,
	busTypes,
	busesSeatTypes,
	busesTable,
	busesSeat,
	locationsTable,
	countersTable,
	routesTable,
	busTrips,
	busesBooking,
	busesSeatBooking,
} from '@/server/db/schemas'
import { eq, and, or, ilike, isNull, count } from 'drizzle-orm'
import { status } from 'elysia'
import type { BusModel } from './model'

function paginate(page?: number, limit?: number) {
	const p = page || 1
	const l = limit || 10
	return { page: p, limit: l, offset: (p - 1) * l }
}

// ─────────────────────────────────────────────────────────────────────────────
// BrandService
// ─────────────────────────────────────────────────────────────────────────────
export abstract class BrandService {
	static async list(params: { page?: number; limit?: number; search?: string } = {}) {
		const { page, limit, offset } = paginate(params.page, params.limit)
		const conditions = [isNull(busBrands.deletedAt)]
		if (params.search) conditions.push(ilike(busBrands.name, `%${params.search}%`))
		const [totalRes] = await db.select({ count: count() }).from(busBrands).where(and(...conditions))
		const total = Number(totalRes?.count || 0)
		const items = await db.select().from(busBrands).where(and(...conditions)).limit(limit).offset(offset)
		return { items, total, page, limit, pages: Math.ceil(total / limit) }
	}

	static async findById(id: string) {
		const [brand] = await db.select().from(busBrands).where(eq(busBrands.id, id)).limit(1)
		if (!brand) throw status(404, { message: 'Brand not found' })
		return brand
	}

	static async create(data: BusModel['createBrandBody']) {
		const exists = await db.select().from(busBrands).where(eq(busBrands.slug, data.slug)).limit(1)
		if (exists.length > 0) throw status(400, { message: 'Brand slug already exists' })
		const [newBrand] = await db.insert(busBrands).values({
			name: data.name,
			slug: data.slug,
			description: data.description ?? null,
			logoUrl: data.logoUrl ?? null,
			isActive: true,
		}).returning()
		return newBrand
	}

	static async update(id: string, data: BusModel['updateBrandBody']) {
		const [brand] = await db.select().from(busBrands).where(eq(busBrands.id, id)).limit(1)
		if (!brand) throw status(404, { message: 'Brand not found' })
		if (data.slug && data.slug !== brand.slug) {
			const exists = await db.select().from(busBrands).where(eq(busBrands.slug, data.slug)).limit(1)
			if (exists.length > 0) throw status(400, { message: 'Brand slug already exists' })
		}
		const [updated] = await db.update(busBrands).set({
			name: data.name ?? undefined,
			slug: data.slug ?? undefined,
			description: data.description !== undefined ? data.description : undefined,
			logoUrl: data.logoUrl !== undefined ? data.logoUrl : undefined,
			isActive: data.isActive !== undefined ? data.isActive : undefined,
		}).where(eq(busBrands.id, id)).returning()
		return updated
	}

	static async remove(id: string) {
		const [brand] = await db.select().from(busBrands).where(eq(busBrands.id, id)).limit(1)
		if (!brand) throw status(404, { message: 'Brand not found' })
		await db.update(busBrands).set({ deletedAt: new Date(), isActive: false }).where(eq(busBrands.id, id))
		return { message: 'Brand deleted successfully' }
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// BusTypeService
// ─────────────────────────────────────────────────────────────────────────────
export abstract class BusTypeService {
	static async list(params: { page?: number; limit?: number; search?: string } = {}) {
		const { page, limit, offset } = paginate(params.page, params.limit)
		const conditions = [isNull(busTypes.deletedAt)]
		if (params.search) conditions.push(ilike(busTypes.name, `%${params.search}%`))
		const [totalRes] = await db.select({ count: count() }).from(busTypes).where(and(...conditions))
		const total = Number(totalRes?.count || 0)
		const items = await db.select().from(busTypes).where(and(...conditions)).limit(limit).offset(offset)
		return { items, total, page, limit, pages: Math.ceil(total / limit) }
	}

	static async findById(id: string) {
		const [type] = await db.select().from(busTypes).where(eq(busTypes.id, id)).limit(1)
		if (!type) throw status(404, { message: 'Bus type not found' })
		return type
	}

	static async create(data: BusModel['createBusTypeBody']) {
		const exists = await db.select().from(busTypes).where(eq(busTypes.slug, data.slug)).limit(1)
		if (exists.length > 0) throw status(400, { message: 'Bus type slug already exists' })
		const [newType] = await db.insert(busTypes).values({
			name: data.name,
			slug: data.slug,
			description: data.description ?? null,
			isAC: data.isAC ?? false,
			totalSeats: data.totalSeats,
			seatLayout: data.seatLayout ?? null,
			isActive: true,
		}).returning()
		return newType
	}

	static async update(id: string, data: BusModel['updateBusTypeBody']) {
		const [type] = await db.select().from(busTypes).where(eq(busTypes.id, id)).limit(1)
		if (!type) throw status(404, { message: 'Bus type not found' })
		if (data.slug && data.slug !== type.slug) {
			const exists = await db.select().from(busTypes).where(eq(busTypes.slug, data.slug)).limit(1)
			if (exists.length > 0) throw status(400, { message: 'Bus type slug already exists' })
		}
		const [updated] = await db.update(busTypes).set({
			name: data.name ?? undefined,
			slug: data.slug ?? undefined,
			description: data.description !== undefined ? data.description : undefined,
			isAC: data.isAC !== undefined ? data.isAC : undefined,
			totalSeats: data.totalSeats ?? undefined,
			isActive: data.isActive !== undefined ? data.isActive : undefined,
			seatLayout: data.seatLayout !== undefined ? data.seatLayout : undefined,
		}).where(eq(busTypes.id, id)).returning()
		return updated
	}

	static async remove(id: string) {
		const [type] = await db.select().from(busTypes).where(eq(busTypes.id, id)).limit(1)
		if (!type) throw status(404, { message: 'Bus type not found' })
		await db.update(busTypes).set({ deletedAt: new Date(), isActive: false }).where(eq(busTypes.id, id))
		return { message: 'Bus type deleted successfully' }
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// SeatTypeService  (scoped to a busType, not a physical bus)
// ─────────────────────────────────────────────────────────────────────────────
export abstract class SeatTypeService {
	static async list(params: { page?: number; limit?: number; busTypeId?: string } = {}) {
		const { page, limit, offset } = paginate(params.page, params.limit)
		const conditions: ReturnType<typeof eq>[] = []
		if (params.busTypeId) conditions.push(eq(busesSeatTypes.busTypeId, params.busTypeId))
		const [totalRes] = await db.select({ count: count() }).from(busesSeatTypes).where(conditions.length ? and(...conditions) : undefined)
		const total = Number(totalRes?.count || 0)
		const items = await db.select().from(busesSeatTypes).where(conditions.length ? and(...conditions) : undefined).limit(limit).offset(offset)
		return { items, total, page, limit, pages: Math.ceil(total / limit) }
	}

	static async findById(id: string) {
		const [st] = await db.select().from(busesSeatTypes).where(eq(busesSeatTypes.id, id)).limit(1)
		if (!st) throw status(404, { message: 'Seat type not found' })
		return st
	}

	static async create(data: BusModel['createSeatTypeBody']) {
		const exists = await db.select().from(busesSeatTypes).where(eq(busesSeatTypes.slug, data.slug)).limit(1)
		if (exists.length > 0) throw status(400, { message: 'Seat type slug already exists' })
		const busType = await db.select().from(busTypes).where(eq(busTypes.id, data.busTypeId)).limit(1)
		if (!busType.length) throw status(400, { message: 'Bus type not found' })
		const [newSt] = await db.insert(busesSeatTypes).values({
			name: data.name,
			slug: data.slug,
			busTypeId: data.busTypeId,
			capacity: data.capacity ?? 1,
			priceMultiplier: data.priceMultiplier ?? '1.00',
			color: data.color ?? '#FFD700',
		}).returning()
		return newSt
	}

	static async update(id: string, data: BusModel['updateSeatTypeBody']) {
		const [st] = await db.select().from(busesSeatTypes).where(eq(busesSeatTypes.id, id)).limit(1)
		if (!st) throw status(404, { message: 'Seat type not found' })
		if (data.slug && data.slug !== st.slug) {
			const exists = await db.select().from(busesSeatTypes).where(eq(busesSeatTypes.slug, data.slug)).limit(1)
			if (exists.length > 0) throw status(400, { message: 'Seat type slug already exists' })
		}
		const [updated] = await db.update(busesSeatTypes).set({
			name: data.name ?? undefined,
			slug: data.slug ?? undefined,
			busTypeId: data.busTypeId ?? undefined,
			capacity: data.capacity ?? undefined,
			priceMultiplier: data.priceMultiplier !== undefined ? data.priceMultiplier : undefined,
			color: data.color !== undefined ? data.color : undefined,
		}).where(eq(busesSeatTypes.id, id)).returning()
		return updated
	}

	static async remove(id: string) {
		const [st] = await db.select().from(busesSeatTypes).where(eq(busesSeatTypes.id, id)).limit(1)
		if (!st) throw status(404, { message: 'Seat type not found' })
		await db.delete(busesSeatTypes).where(eq(busesSeatTypes.id, id))
		return { message: 'Seat type deleted successfully' }
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// BusService
// ─────────────────────────────────────────────────────────────────────────────
export abstract class BusService {
	static async list(params: { page?: number; limit?: number; search?: string; brandId?: string; typeId?: string; status?: string } = {}) {
		const { page, limit, offset } = paginate(params.page, params.limit)
		const conditions = [isNull(busesTable.deletedAt)]
		if (params.brandId) conditions.push(eq(busesTable.brandId, params.brandId))
		if (params.typeId) conditions.push(eq(busesTable.typeId, params.typeId))
		if (params.status) conditions.push(eq(busesTable.status, params.status))
		if (params.search) conditions.push(or(ilike(busesTable.name, `%${params.search}%`), ilike(busesTable.registrationNo, `%${params.search}%`))!)
		const [totalRes] = await db.select({ count: count() }).from(busesTable).where(and(...conditions))
		const total = Number(totalRes?.count || 0)
		const items = await db.select().from(busesTable).where(and(...conditions)).limit(limit).offset(offset)
		return { items, total, page, limit, pages: Math.ceil(total / limit) }
	}

	static async findById(id: string) {
		const [bus] = await db.select().from(busesTable).where(eq(busesTable.id, id)).limit(1)
		if (!bus) throw status(404, { message: 'Bus not found' })
		return bus
	}

	static async findBySlug(slug: string) {
		const [bus] = await db.select().from(busesTable).where(eq(busesTable.slug, slug)).limit(1)
		if (!bus) throw status(404, { message: 'Bus not found' })
		return bus
	}

	static async create(data: BusModel['createBusBody']) {
		const slugExists = await db.select().from(busesTable).where(eq(busesTable.slug, data.slug)).limit(1)
		if (slugExists.length > 0) throw status(400, { message: 'Bus slug already exists' })
		const regExists = await db.select().from(busesTable).where(eq(busesTable.registrationNo, data.registrationNo)).limit(1)
		if (regExists.length > 0) throw status(400, { message: 'Registration number already exists' })
		const [bus] = await db.insert(busesTable).values({
			registrationNo: data.registrationNo,
			brandId: data.brandId,
			typeId: data.typeId,
			name: data.name,
			slug: data.slug,
			model: data.model ?? null,
			year: data.year ?? null,
			features: data.features ?? [],
			description: data.description ?? null,
			status: 'ACTIVE',
		}).returning()
		return bus
	}

	static async update(id: string, data: BusModel['updateBusBody']) {
		const [bus] = await db.select().from(busesTable).where(eq(busesTable.id, id)).limit(1)
		if (!bus) throw status(404, { message: 'Bus not found' })
		if (data.slug && data.slug !== bus.slug) {
			const exists = await db.select().from(busesTable).where(eq(busesTable.slug, data.slug)).limit(1)
			if (exists.length > 0) throw status(400, { message: 'Bus slug already exists' })
		}
		if (data.registrationNo && data.registrationNo !== bus.registrationNo) {
			const exists = await db.select().from(busesTable).where(eq(busesTable.registrationNo, data.registrationNo)).limit(1)
			if (exists.length > 0) throw status(400, { message: 'Registration number already exists' })
		}
		const [updated] = await db.update(busesTable).set({
			registrationNo: data.registrationNo ?? undefined,
			brandId: data.brandId ?? undefined,
			typeId: data.typeId ?? undefined,
			name: data.name ?? undefined,
			slug: data.slug ?? undefined,
			model: data.model !== undefined ? data.model : undefined,
			year: data.year !== undefined ? data.year : undefined,
			features: data.features !== undefined ? data.features : undefined,
			description: data.description !== undefined ? data.description : undefined,
			status: data.status ?? undefined,
		}).where(eq(busesTable.id, id)).returning()
		return updated
	}

	static async remove(id: string) {
		const [bus] = await db.select().from(busesTable).where(eq(busesTable.id, id)).limit(1)
		if (!bus) throw status(404, { message: 'Bus not found' })
		await db.update(busesTable).set({ deletedAt: new Date(), status: 'RETIRED' }).where(eq(busesTable.id, id))
		return { message: 'Bus deleted successfully' }
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// BusSeatService
// ─────────────────────────────────────────────────────────────────────────────
export abstract class BusSeatService {
	static async list(params: { page?: number; limit?: number; busId?: string; level?: number } = {}) {
		const { page, limit, offset } = paginate(params.page, params.limit)
		const conditions: ReturnType<typeof eq>[] = []
		if (params.busId) conditions.push(eq(busesSeat.busId, params.busId))
		if (params.level !== undefined) conditions.push(eq(busesSeat.level, params.level))
		const [totalRes] = await db.select({ count: count() }).from(busesSeat).where(conditions.length ? and(...conditions) : undefined)
		const total = Number(totalRes?.count || 0)
		const items = await db.select().from(busesSeat).where(conditions.length ? and(...conditions) : undefined).limit(limit).offset(offset)
		return { items, total, page, limit, pages: Math.ceil(total / limit) }
	}

	static async findById(id: string) {
		const [seat] = await db.select().from(busesSeat).where(eq(busesSeat.id, id)).limit(1)
		if (!seat) throw status(404, { message: 'Seat not found' })
		return seat
	}

	static async create(data: BusModel['createBusSeatBody']) {
		const bus = await db.select().from(busesTable).where(eq(busesTable.id, data.busId)).limit(1)
		if (!bus.length) throw status(400, { message: 'Bus not found' })
		const [seat] = await db.insert(busesSeat).values({
			busId: data.busId,
			seatTypeId: data.seatTypeId ?? null,
			row: data.row,
			seatNumber: data.seatNumber,
			level: data.level ?? 1,
			posX: data.posX ?? '0',
			posY: data.posY ?? '0',
			rotation: data.rotation ?? '0',
			isAccessible: data.isAccessible ?? false,
			isActive: true,
		}).returning()
		return seat
	}

	static async update(id: string, data: BusModel['updateBusSeatBody']) {
		const [seat] = await db.select().from(busesSeat).where(eq(busesSeat.id, id)).limit(1)
		if (!seat) throw status(404, { message: 'Seat not found' })
		const [updated] = await db.update(busesSeat).set({
			seatTypeId: data.seatTypeId !== undefined ? data.seatTypeId : undefined,
			row: data.row ?? undefined,
			seatNumber: data.seatNumber ?? undefined,
			level: data.level ?? undefined,
			posX: data.posX ?? undefined,
			posY: data.posY ?? undefined,
			rotation: data.rotation ?? undefined,
			isAccessible: data.isAccessible !== undefined ? data.isAccessible : undefined,
			isActive: data.isActive !== undefined ? data.isActive : undefined,
		}).where(eq(busesSeat.id, id)).returning()
		return updated
	}

	static async remove(id: string) {
		const [seat] = await db.select().from(busesSeat).where(eq(busesSeat.id, id)).limit(1)
		if (!seat) throw status(404, { message: 'Seat not found' })
		await db.delete(busesSeat).where(eq(busesSeat.id, id))
		return { message: 'Seat deleted successfully' }
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// LocationService
// ─────────────────────────────────────────────────────────────────────────────
export abstract class LocationService {
	static async list(params: { page?: number; limit?: number; search?: string; type?: string; parentLocationId?: string } = {}) {
		const { page, limit, offset } = paginate(params.page, params.limit)
		const conditions = [eq(locationsTable.isActive, true)]
		if (params.type) conditions.push(eq(locationsTable.type, params.type))
		if (params.parentLocationId) conditions.push(eq(locationsTable.parentLocationId, params.parentLocationId))
		if (params.search) conditions.push(ilike(locationsTable.name, `%${params.search}%`))
		const [totalRes] = await db.select({ count: count() }).from(locationsTable).where(and(...conditions))
		const total = Number(totalRes?.count || 0)
		const items = await db.select().from(locationsTable).where(and(...conditions)).limit(limit).offset(offset)
		return { items, total, page, limit, pages: Math.ceil(total / limit) }
	}

	static async findById(id: string) {
		const [loc] = await db.select().from(locationsTable).where(eq(locationsTable.id, id)).limit(1)
		if (!loc) throw status(404, { message: 'Location not found' })
		return loc
	}

	static async create(data: BusModel['createLocationBody']) {
		const exists = await db.select().from(locationsTable).where(eq(locationsTable.slug, data.slug)).limit(1)
		if (exists.length > 0) throw status(400, { message: 'Location slug already exists' })
		const [loc] = await db.insert(locationsTable).values({
			name: data.name,
			slug: data.slug,
			type: data.type ?? 'CITY',
			parentLocationId: data.parentLocationId ?? null,
			latitude: data.latitude ?? null,
			longitude: data.longitude ?? null,
			isActive: true,
		}).returning()
		return loc
	}

	static async update(id: string, data: BusModel['updateLocationBody']) {
		const [loc] = await db.select().from(locationsTable).where(eq(locationsTable.id, id)).limit(1)
		if (!loc) throw status(404, { message: 'Location not found' })
		if (data.slug && data.slug !== loc.slug) {
			const exists = await db.select().from(locationsTable).where(eq(locationsTable.slug, data.slug)).limit(1)
			if (exists.length > 0) throw status(400, { message: 'Location slug already exists' })
		}
		const [updated] = await db.update(locationsTable).set({
			name: data.name ?? undefined,
			slug: data.slug ?? undefined,
			type: data.type ?? undefined,
			parentLocationId: data.parentLocationId !== undefined ? data.parentLocationId : undefined,
			latitude: data.latitude !== undefined ? data.latitude : undefined,
			longitude: data.longitude !== undefined ? data.longitude : undefined,
			isActive: data.isActive !== undefined ? data.isActive : undefined,
		}).where(eq(locationsTable.id, id)).returning()
		return updated
	}

	static async remove(id: string) {
		const [loc] = await db.select().from(locationsTable).where(eq(locationsTable.id, id)).limit(1)
		if (!loc) throw status(404, { message: 'Location not found' })
		await db.update(locationsTable).set({ isActive: false }).where(eq(locationsTable.id, id))
		return { message: 'Location deleted successfully' }
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// CounterService
// ─────────────────────────────────────────────────────────────────────────────
export abstract class CounterService {
	static async list(params: { page?: number; limit?: number; search?: string; locationId?: string; brandId?: string } = {}) {
		const { page, limit, offset } = paginate(params.page, params.limit)
		const conditions = [eq(countersTable.isActive, true)]
		if (params.locationId) conditions.push(eq(countersTable.locationId, params.locationId))
		if (params.brandId) conditions.push(eq(countersTable.brandId, params.brandId))
		if (params.search) conditions.push(ilike(countersTable.name, `%${params.search}%`))
		const [totalRes] = await db.select({ count: count() }).from(countersTable).where(and(...conditions))
		const total = Number(totalRes?.count || 0)
		const items = await db.select().from(countersTable).where(and(...conditions)).limit(limit).offset(offset)
		return { items, total, page, limit, pages: Math.ceil(total / limit) }
	}

	static async findById(id: string) {
		const [counter] = await db.select().from(countersTable).where(eq(countersTable.id, id)).limit(1)
		if (!counter) throw status(404, { message: 'Counter not found' })
		return counter
	}

	static async create(data: BusModel['createCounterBody']) {
		const exists = await db.select().from(countersTable).where(eq(countersTable.slug, data.slug)).limit(1)
		if (exists.length > 0) throw status(400, { message: 'Counter slug already exists' })
		const [loc] = await db.select().from(locationsTable).where(eq(locationsTable.id, data.locationId)).limit(1)
		if (!loc) throw status(400, { message: 'Location not found' })
		const [brand] = await db.select().from(busBrands).where(eq(busBrands.id, data.brandId)).limit(1)
		if (!brand) throw status(400, { message: 'Brand not found' })
		const [counter] = await db.insert(countersTable).values({
			name: data.name,
			slug: data.slug,
			locationId: data.locationId,
			brandId: data.brandId,
			address: data.address ?? null,
			contactPhone: data.contactPhone ?? null,
			isActive: true,
		}).returning()
		return counter
	}

	static async update(id: string, data: BusModel['updateCounterBody']) {
		const [counter] = await db.select().from(countersTable).where(eq(countersTable.id, id)).limit(1)
		if (!counter) throw status(404, { message: 'Counter not found' })
		if (data.slug && data.slug !== counter.slug) {
			const exists = await db.select().from(countersTable).where(eq(countersTable.slug, data.slug)).limit(1)
			if (exists.length > 0) throw status(400, { message: 'Counter slug already exists' })
		}
		const [updated] = await db.update(countersTable).set({
			name: data.name ?? undefined,
			slug: data.slug ?? undefined,
			locationId: data.locationId ?? undefined,
			brandId: data.brandId ?? undefined,
			address: data.address !== undefined ? data.address : undefined,
			contactPhone: data.contactPhone !== undefined ? data.contactPhone : undefined,
			isActive: data.isActive !== undefined ? data.isActive : undefined,
		}).where(eq(countersTable.id, id)).returning()
		return updated
	}

	static async remove(id: string) {
		const [counter] = await db.select().from(countersTable).where(eq(countersTable.id, id)).limit(1)
		if (!counter) throw status(404, { message: 'Counter not found' })
		await db.update(countersTable).set({ isActive: false }).where(eq(countersTable.id, id))
		return { message: 'Counter deleted successfully' }
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// RouteService
// ─────────────────────────────────────────────────────────────────────────────
export abstract class RouteService {
	static async list(params: { page?: number; limit?: number; search?: string; originId?: string; destinationId?: string } = {}) {
		const { page, limit, offset } = paginate(params.page, params.limit)
		const conditions = [eq(routesTable.isActive, true)]
		if (params.originId) conditions.push(eq(routesTable.originId, params.originId))
		if (params.destinationId) conditions.push(eq(routesTable.destinationId, params.destinationId))
		if (params.search) conditions.push(ilike(routesTable.name, `%${params.search}%`))
		const [totalRes] = await db.select({ count: count() }).from(routesTable).where(and(...conditions))
		const total = Number(totalRes?.count || 0)
		const items = await db.select().from(routesTable).where(and(...conditions)).limit(limit).offset(offset)
		return { items, total, page, limit, pages: Math.ceil(total / limit) }
	}

	static async findById(id: string) {
		const [route] = await db.select().from(routesTable).where(eq(routesTable.id, id)).limit(1)
		if (!route) throw status(404, { message: 'Route not found' })
		return route
	}

	static async create(data: BusModel['createRouteBody']) {
		const exists = await db.select().from(routesTable).where(eq(routesTable.slug, data.slug)).limit(1)
		if (exists.length > 0) throw status(400, { message: 'Route slug already exists' })
		const [origin] = await db.select().from(locationsTable).where(eq(locationsTable.id, data.originId)).limit(1)
		if (!origin) throw status(400, { message: 'Origin location not found' })
		const [dest] = await db.select().from(locationsTable).where(eq(locationsTable.id, data.destinationId)).limit(1)
		if (!dest) throw status(400, { message: 'Destination location not found' })
		const [route] = await db.insert(routesTable).values({
			name: data.name,
			slug: data.slug,
			originId: data.originId,
			destinationId: data.destinationId,
			distanceKm: data.distanceKm ?? null,
			estimatedDurationMins: data.estimatedDurationMins ?? null,
			isActive: true,
		}).returning()
		return route
	}

	static async update(id: string, data: BusModel['updateRouteBody']) {
		const [route] = await db.select().from(routesTable).where(eq(routesTable.id, id)).limit(1)
		if (!route) throw status(404, { message: 'Route not found' })
		if (data.slug && data.slug !== route.slug) {
			const exists = await db.select().from(routesTable).where(eq(routesTable.slug, data.slug)).limit(1)
			if (exists.length > 0) throw status(400, { message: 'Route slug already exists' })
		}
		const [updated] = await db.update(routesTable).set({
			name: data.name ?? undefined,
			slug: data.slug ?? undefined,
			originId: data.originId ?? undefined,
			destinationId: data.destinationId ?? undefined,
			distanceKm: data.distanceKm !== undefined ? data.distanceKm : undefined,
			estimatedDurationMins: data.estimatedDurationMins !== undefined ? data.estimatedDurationMins : undefined,
			isActive: data.isActive !== undefined ? data.isActive : undefined,
		}).where(eq(routesTable.id, id)).returning()
		return updated
	}

	static async remove(id: string) {
		const [route] = await db.select().from(routesTable).where(eq(routesTable.id, id)).limit(1)
		if (!route) throw status(404, { message: 'Route not found' })
		await db.update(routesTable).set({ isActive: false }).where(eq(routesTable.id, id))
		return { message: 'Route deleted successfully' }
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// TripService
// ─────────────────────────────────────────────────────────────────────────────
export abstract class TripService {
	static async list(params: { page?: number; limit?: number; routeId?: string; busId?: string; status?: string } = {}) {
		const { page, limit, offset } = paginate(params.page, params.limit)
		const conditions = [eq(busTrips.isActive, true)]
		if (params.routeId) conditions.push(eq(busTrips.routeId, params.routeId))
		if (params.busId) conditions.push(eq(busTrips.busId, params.busId))
		if (params.status) conditions.push(eq(busTrips.status, params.status))
		const [totalRes] = await db.select({ count: count() }).from(busTrips).where(and(...conditions))
		const total = Number(totalRes?.count || 0)
		const items = await db.select().from(busTrips).where(and(...conditions)).limit(limit).offset(offset)
		return { items, total, page, limit, pages: Math.ceil(total / limit) }
	}

	static async findById(id: string) {
		const [trip] = await db.select().from(busTrips).where(eq(busTrips.id, id)).limit(1)
		if (!trip) throw status(404, { message: 'Trip not found' })
		return trip
	}

	static async create(data: BusModel['createTripBody']) {
		const [route] = await db.select().from(routesTable).where(eq(routesTable.id, data.routeId)).limit(1)
		if (!route) throw status(400, { message: 'Route not found' })
		const [bus] = await db.select().from(busesTable).where(eq(busesTable.id, data.busId)).limit(1)
		if (!bus) throw status(400, { message: 'Bus not found' })
		const [trip] = await db.insert(busTrips).values({
			routeId: data.routeId,
			busId: data.busId,
			departureTime: new Date(data.departureTime),
			arrivalTime: new Date(data.arrivalTime),
			basePrice: data.basePrice,
			status: 'SCHEDULED',
			isActive: true,
		}).returning()
		return trip
	}

	static async update(id: string, data: BusModel['updateTripBody']) {
		const [trip] = await db.select().from(busTrips).where(eq(busTrips.id, id)).limit(1)
		if (!trip) throw status(404, { message: 'Trip not found' })
		const [updated] = await db.update(busTrips).set({
			routeId: data.routeId ?? undefined,
			busId: data.busId ?? undefined,
			departureTime: data.departureTime ? new Date(data.departureTime) : undefined,
			arrivalTime: data.arrivalTime ? new Date(data.arrivalTime) : undefined,
			basePrice: data.basePrice ?? undefined,
			status: data.status ?? undefined,
			isActive: data.isActive !== undefined ? data.isActive : undefined,
		}).where(eq(busTrips.id, id)).returning()
		return updated
	}

	static async remove(id: string) {
		const [trip] = await db.select().from(busTrips).where(eq(busTrips.id, id)).limit(1)
		if (!trip) throw status(404, { message: 'Trip not found' })
		await db.update(busTrips).set({ isActive: false, status: 'CANCELLED' }).where(eq(busTrips.id, id))
		return { message: 'Trip cancelled successfully' }
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// BookingService
// ─────────────────────────────────────────────────────────────────────────────
export abstract class BookingService {
	static async list(params: { page?: number; limit?: number; tripId?: string; userId?: string; status?: string; paymentStatus?: string } = {}) {
		const { page, limit, offset } = paginate(params.page, params.limit)
		const conditions: ReturnType<typeof eq>[] = []
		if (params.tripId) conditions.push(eq(busesBooking.tripId, params.tripId))
		if (params.userId) conditions.push(eq(busesBooking.userId, params.userId))
		if (params.status) conditions.push(eq(busesBooking.status, params.status))
		if (params.paymentStatus) conditions.push(eq(busesBooking.paymentStatus, params.paymentStatus))
		const [totalRes] = await db.select({ count: count() }).from(busesBooking).where(conditions.length ? and(...conditions) : undefined)
		const total = Number(totalRes?.count || 0)
		const items = await db.select().from(busesBooking).where(conditions.length ? and(...conditions) : undefined).limit(limit).offset(offset)
		return { items, total, page, limit, pages: Math.ceil(total / limit) }
	}

	static async findById(id: string) {
		const [booking] = await db.select().from(busesBooking).where(eq(busesBooking.id, id)).limit(1)
		if (!booking) throw status(404, { message: 'Booking not found' })
		return booking
	}

	static async findByPnr(pnr: string) {
		const [booking] = await db.select().from(busesBooking).where(eq(busesBooking.bookingPnr, pnr)).limit(1)
		if (!booking) throw status(404, { message: 'Booking not found' })
		return booking
	}

	static async create(data: BusModel['createBookingBody']) {
		const [trip] = await db.select().from(busTrips).where(eq(busTrips.id, data.tripId)).limit(1)
		if (!trip) throw status(400, { message: 'Trip not found' })
		const pnrExists = await db.select().from(busesBooking).where(eq(busesBooking.bookingPnr, data.bookingPnr)).limit(1)
		if (pnrExists.length > 0) throw status(400, { message: 'PNR already exists' })
		const [booking] = await db.insert(busesBooking).values({
			tripId: data.tripId,
			userId: data.userId,
			bookingPnr: data.bookingPnr,
			totalAmount: data.totalAmount,
			paymentStatus: data.paymentStatus ?? 'PENDING',
			status: 'CONFIRMED',
			bookedAt: new Date(),
		}).returning()
		return booking
	}

	static async update(id: string, data: BusModel['updateBookingBody']) {
		const [booking] = await db.select().from(busesBooking).where(eq(busesBooking.id, id)).limit(1)
		if (!booking) throw status(404, { message: 'Booking not found' })
		const [updated] = await db.update(busesBooking).set({
			paymentStatus: data.paymentStatus ?? undefined,
			status: data.status ?? undefined,
		}).where(eq(busesBooking.id, id)).returning()
		return updated
	}

	static async remove(id: string) {
		const [booking] = await db.select().from(busesBooking).where(eq(busesBooking.id, id)).limit(1)
		if (!booking) throw status(404, { message: 'Booking not found' })
		await db.update(busesBooking).set({ status: 'CANCELLED' }).where(eq(busesBooking.id, id))
		return { message: 'Booking cancelled successfully' }
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// SeatBookingService
// ─────────────────────────────────────────────────────────────────────────────
export abstract class SeatBookingService {
	static async list(params: { page?: number; limit?: number; bookingId?: string; seatId?: string } = {}) {
		const { page, limit, offset } = paginate(params.page, params.limit)
		const conditions: ReturnType<typeof eq>[] = []
		if (params.bookingId) conditions.push(eq(busesSeatBooking.bookingId, params.bookingId))
		if (params.seatId) conditions.push(eq(busesSeatBooking.seatId, params.seatId))
		const [totalRes] = await db.select({ count: count() }).from(busesSeatBooking).where(conditions.length ? and(...conditions) : undefined)
		const total = Number(totalRes?.count || 0)
		const items = await db.select().from(busesSeatBooking).where(conditions.length ? and(...conditions) : undefined).limit(limit).offset(offset)
		return { items, total, page, limit, pages: Math.ceil(total / limit) }
	}

	static async findById(id: string) {
		const [sb] = await db.select().from(busesSeatBooking).where(eq(busesSeatBooking.id, id)).limit(1)
		if (!sb) throw status(404, { message: 'Seat booking not found' })
		return sb
	}

	static async create(data: BusModel['createSeatBookingBody']) {
		const [booking] = await db.select().from(busesBooking).where(eq(busesBooking.id, data.bookingId)).limit(1)
		if (!booking) throw status(400, { message: 'Booking not found' })
		const [seat] = await db.select().from(busesSeat).where(eq(busesSeat.id, data.seatId)).limit(1)
		if (!seat) throw status(400, { message: 'Seat not found' })
		const [sb] = await db.insert(busesSeatBooking).values({
			bookingId: data.bookingId,
			seatId: data.seatId,
			seatNumber: data.seatNumber,
			price: data.price,
			status: 'CONFIRMED',
		}).returning()
		return sb
	}

	static async update(id: string, data: BusModel['updateSeatBookingBody']) {
		const [sb] = await db.select().from(busesSeatBooking).where(eq(busesSeatBooking.id, id)).limit(1)
		if (!sb) throw status(404, { message: 'Seat booking not found' })
		const [updated] = await db.update(busesSeatBooking).set({
			status: data.status ?? undefined,
		}).where(eq(busesSeatBooking.id, id)).returning()
		return updated
	}

	static async remove(id: string) {
		const [sb] = await db.select().from(busesSeatBooking).where(eq(busesSeatBooking.id, id)).limit(1)
		if (!sb) throw status(404, { message: 'Seat booking not found' })
		await db.update(busesSeatBooking).set({ status: 'CANCELLED' }).where(eq(busesSeatBooking.id, id))
		return { message: 'Seat booking cancelled' }
	}
}
