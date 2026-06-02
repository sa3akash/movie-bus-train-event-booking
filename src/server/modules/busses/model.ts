import { t, type UnwrapSchema } from 'elysia'

const paginationQuery = t.Object({
	page: t.Optional(t.Numeric()),
	limit: t.Optional(t.Numeric()),
	search: t.Optional(t.String()),
})

const errorResponse = t.Object({ message: t.String() })

// ─── Reusable seat layout type ───────────────────────────────────────────────
const seatLayoutType = t.Optional(t.Nullable(t.Object({
	rows: t.Number(),
	columns: t.Number(),
	seats: t.Array(t.Object({
		row: t.String(),
		seatNumber: t.String(),
		x: t.Number(),
		y: t.Number(),
		type: t.Optional(t.Union([
			t.Literal('seat'),
			t.Literal('sleeper'),
			t.Literal('empty'),
		])),
	})),
})))

// ─── Brands ──────────────────────────────────────────────────────────────────
const brandResponse = t.Object({
	id: t.String(),
	name: t.String(),
	slug: t.String(),
	description: t.Nullable(t.String()),
	logoUrl: t.Nullable(t.String()),
	isActive: t.Boolean(),
	deletedAt: t.Nullable(t.Date()),
	createdAt: t.Date(),
	updatedAt: t.Date(),
})

// ─── Bus Types ────────────────────────────────────────────────────────────────
const busTypeResponse = t.Object({
	id: t.String(),
	name: t.String(),
	slug: t.String(),
	description: t.Nullable(t.String()),
	isAC: t.Boolean(),
	totalSeats: t.Number(),
	seatLayout: seatLayoutType,
	isActive: t.Boolean(),
	deletedAt: t.Nullable(t.Date()),
	createdAt: t.Date(),
	updatedAt: t.Date(),
})

// ─── Seat Types ───────────────────────────────────────────────────────────────
const seatTypeResponse = t.Object({
	id: t.String(),
	name: t.String(),
	slug: t.String(),
	capacity: t.Number(),
	priceMultiplier: t.Nullable(t.String()),
	color: t.Nullable(t.String()),
	busTypeId: t.String(),
	createdAt: t.Date(),
	updatedAt: t.Date(),
})

// ─── Buses ────────────────────────────────────────────────────────────────────
const busResponse = t.Object({
	id: t.String(),
	registrationNo: t.String(),
	brandId: t.String(),
	typeId: t.String(),
	name: t.String(),
	slug: t.String(),
	model: t.Nullable(t.String()),
	year: t.Nullable(t.Number()),
	features: t.Nullable(t.Array(t.String())),
	description: t.Nullable(t.String()),
	status: t.String(),
	deletedAt: t.Nullable(t.Date()),
	createdAt: t.Date(),
	updatedAt: t.Date(),
})

// ─── Bus Seats ────────────────────────────────────────────────────────────────
const busSeatResponse = t.Object({
	id: t.String(),
	busId: t.String(),
	seatTypeId: t.Nullable(t.String()),
	row: t.String(),
	seatNumber: t.Number(),
	level: t.Number(),
	posX: t.String(),
	posY: t.String(),
	rotation: t.String(),
	isAccessible: t.Boolean(),
	isActive: t.Nullable(t.Boolean()),
	createdAt: t.Date(),
	updatedAt: t.Date(),
})

// ─── Locations ────────────────────────────────────────────────────────────────
const locationResponse = t.Object({
	id: t.String(),
	name: t.String(),
	slug: t.String(),
	type: t.String(),
	parentLocationId: t.Nullable(t.String()),
	latitude: t.Nullable(t.String()),
	longitude: t.Nullable(t.String()),
	isActive: t.Boolean(),
	createdAt: t.Date(),
	updatedAt: t.Date(),
})

// ─── Counters ─────────────────────────────────────────────────────────────────
const counterResponse = t.Object({
	id: t.String(),
	name: t.String(),
	slug: t.String(),
	locationId: t.String(),
	brandId: t.String(),
	address: t.Nullable(t.String()),
	contactPhone: t.Nullable(t.String()),
	isActive: t.Boolean(),
	createdAt: t.Date(),
	updatedAt: t.Date(),
})

// ─── Routes ───────────────────────────────────────────────────────────────────
const routeResponse = t.Object({
	id: t.String(),
	name: t.String(),
	slug: t.String(),
	originId: t.String(),
	destinationId: t.String(),
	distanceKm: t.Nullable(t.String()),
	estimatedDurationMins: t.Nullable(t.Number()),
	isActive: t.Boolean(),
	createdAt: t.Date(),
	updatedAt: t.Date(),
})

// ─── Trips ────────────────────────────────────────────────────────────────────
const tripResponse = t.Object({
	id: t.String(),
	routeId: t.String(),
	busId: t.String(),
	departureTime: t.Date(),
	arrivalTime: t.Date(),
	status: t.String(),
	basePrice: t.String(),
	isActive: t.Boolean(),
	createdAt: t.Date(),
	updatedAt: t.Date(),
})

// ─── Bookings ─────────────────────────────────────────────────────────────────
const bookingResponse = t.Object({
	id: t.String(),
	tripId: t.String(),
	userId: t.String(),
	bookingPnr: t.String(),
	totalAmount: t.String(),
	paymentStatus: t.String(),
	status: t.String(),
	bookedAt: t.Date(),
	createdAt: t.Date(),
	updatedAt: t.Date(),
})

// ─── Seat Bookings ────────────────────────────────────────────────────────────
const seatBookingResponse = t.Object({
	id: t.String(),
	bookingId: t.String(),
	seatId: t.String(),
	seatNumber: t.String(),
	price: t.String(),
	status: t.String(),
	createdAt: t.Date(),
	updatedAt: t.Date(),
})

// ─── Paginated wrappers ───────────────────────────────────────────────────────
function paginated<T extends ReturnType<typeof t.Object>>(item: T) {
	return t.Object({
		items: t.Array(item),
		total: t.Number(),
		page: t.Number(),
		limit: t.Number(),
		pages: t.Number(),
	})
}

export const BusModel = {
	paginationQuery,
	errorResponse,

	// Brands
	brandResponse,
	listBrandsResponse: paginated(brandResponse),
	createBrandBody: t.Object({
		name: t.String(),
		slug: t.String(),
		description: t.Optional(t.String()),
		logoUrl: t.Optional(t.String()),
	}),
	updateBrandBody: t.Object({
		name: t.Optional(t.String()),
		slug: t.Optional(t.String()),
		description: t.Optional(t.Nullable(t.String())),
		logoUrl: t.Optional(t.Nullable(t.String())),
		isActive: t.Optional(t.Boolean()),
	}),

	// Bus Types
	busTypeResponse,
	listBusTypesResponse: paginated(busTypeResponse),
	createBusTypeBody: t.Object({
		name: t.String(),
		slug: t.String(),
		description: t.Optional(t.String()),
		isAC: t.Optional(t.Boolean()),
		totalSeats: t.Number(),
		seatLayout: t.Optional(t.Object({
			rows: t.Number(),
			columns: t.Number(),
			seats: t.Array(t.Object({
				row: t.String(),
				seatNumber: t.String(),
				x: t.Number(),
				y: t.Number(),
				type: t.Optional(t.Union([
					t.Literal('seat'),
					t.Literal('sleeper'),
					t.Literal('empty'),
				])),
			})),
		})),
	}),
	updateBusTypeBody: t.Object({
		name: t.Optional(t.String()),
		slug: t.Optional(t.String()),
		description: t.Optional(t.Nullable(t.String())),
		isAC: t.Optional(t.Boolean()),
		totalSeats: t.Optional(t.Number()),
		isActive: t.Optional(t.Boolean()),
		seatLayout: seatLayoutType,
	}),

	// Seat Types
	seatTypeResponse,
	listSeatTypesResponse: paginated(seatTypeResponse),
	seatTypeQuery: t.Object({
		page: t.Optional(t.Numeric()),
		limit: t.Optional(t.Numeric()),
		busTypeId: t.Optional(t.String()),
	}),
	createSeatTypeBody: t.Object({
		name: t.String(),
		slug: t.String(),
		busTypeId: t.String(),
		capacity: t.Optional(t.Number()),
		priceMultiplier: t.Optional(t.String()),
		color: t.Optional(t.String()),
	}),
	updateSeatTypeBody: t.Object({
		name: t.Optional(t.String()),
		slug: t.Optional(t.String()),
		busTypeId: t.Optional(t.String()),
		capacity: t.Optional(t.Number()),
		priceMultiplier: t.Optional(t.Nullable(t.String())),
		color: t.Optional(t.Nullable(t.String())),
	}),

	// Buses
	busResponse,
	listBusesResponse: paginated(busResponse),
	busQuery: t.Object({
		page: t.Optional(t.Numeric()),
		limit: t.Optional(t.Numeric()),
		search: t.Optional(t.String()),
		brandId: t.Optional(t.String()),
		typeId: t.Optional(t.String()),
		status: t.Optional(t.String()),
	}),
	createBusBody: t.Object({
		registrationNo: t.String(),
		brandId: t.String(),
		typeId: t.String(),
		name: t.String(),
		slug: t.String(),
		model: t.Optional(t.String()),
		year: t.Optional(t.Number()),
		features: t.Optional(t.Array(t.String())),
		description: t.Optional(t.String()),
	}),
	updateBusBody: t.Object({
		registrationNo: t.Optional(t.String()),
		brandId: t.Optional(t.String()),
		typeId: t.Optional(t.String()),
		name: t.Optional(t.String()),
		slug: t.Optional(t.String()),
		model: t.Optional(t.Nullable(t.String())),
		year: t.Optional(t.Nullable(t.Number())),
		features: t.Optional(t.Nullable(t.Array(t.String()))),
		description: t.Optional(t.Nullable(t.String())),
		status: t.Optional(t.Union([
			t.Literal('ACTIVE'),
			t.Literal('MAINTENANCE'),
			t.Literal('RETIRED'),
		])),
	}),

	// Bus Seats
	busSeatResponse,
	listBusSeatsResponse: paginated(busSeatResponse),
	busSeatQuery: t.Object({
		page: t.Optional(t.Numeric()),
		limit: t.Optional(t.Numeric()),
		busId: t.Optional(t.String()),
		level: t.Optional(t.Numeric()),
	}),
	createBusSeatBody: t.Object({
		busId: t.String(),
		seatTypeId: t.Optional(t.String()),
		row: t.String(),
		seatNumber: t.Number(),
		level: t.Optional(t.Number()),
		posX: t.Optional(t.String()),
		posY: t.Optional(t.String()),
		rotation: t.Optional(t.String()),
		isAccessible: t.Optional(t.Boolean()),
	}),
	updateBusSeatBody: t.Object({
		seatTypeId: t.Optional(t.Nullable(t.String())),
		row: t.Optional(t.String()),
		seatNumber: t.Optional(t.Number()),
		level: t.Optional(t.Number()),
		posX: t.Optional(t.String()),
		posY: t.Optional(t.String()),
		rotation: t.Optional(t.String()),
		isAccessible: t.Optional(t.Boolean()),
		isActive: t.Optional(t.Boolean()),
	}),

	// Locations
	locationResponse,
	listLocationsResponse: paginated(locationResponse),
	locationQuery: t.Object({
		page: t.Optional(t.Numeric()),
		limit: t.Optional(t.Numeric()),
		search: t.Optional(t.String()),
		type: t.Optional(t.String()),
		parentLocationId: t.Optional(t.String()),
	}),
	createLocationBody: t.Object({
		name: t.String(),
		slug: t.String(),
		type: t.Optional(t.Union([t.Literal('CITY'), t.Literal('BOARDING_POINT')])),
		parentLocationId: t.Optional(t.String()),
		latitude: t.Optional(t.String()),
		longitude: t.Optional(t.String()),
	}),
	updateLocationBody: t.Object({
		name: t.Optional(t.String()),
		slug: t.Optional(t.String()),
		type: t.Optional(t.Union([t.Literal('CITY'), t.Literal('BOARDING_POINT')])),
		parentLocationId: t.Optional(t.Nullable(t.String())),
		latitude: t.Optional(t.Nullable(t.String())),
		longitude: t.Optional(t.Nullable(t.String())),
		isActive: t.Optional(t.Boolean()),
	}),

	// Counters
	counterResponse,
	listCountersResponse: paginated(counterResponse),
	counterQuery: t.Object({
		page: t.Optional(t.Numeric()),
		limit: t.Optional(t.Numeric()),
		search: t.Optional(t.String()),
		locationId: t.Optional(t.String()),
		brandId: t.Optional(t.String()),
	}),
	createCounterBody: t.Object({
		name: t.String(),
		slug: t.String(),
		locationId: t.String(),
		brandId: t.String(),
		address: t.Optional(t.String()),
		contactPhone: t.Optional(t.String()),
	}),
	updateCounterBody: t.Object({
		name: t.Optional(t.String()),
		slug: t.Optional(t.String()),
		locationId: t.Optional(t.String()),
		brandId: t.Optional(t.String()),
		address: t.Optional(t.Nullable(t.String())),
		contactPhone: t.Optional(t.Nullable(t.String())),
		isActive: t.Optional(t.Boolean()),
	}),

	// Routes
	routeResponse,
	listRoutesResponse: paginated(routeResponse),
	routeQuery: t.Object({
		page: t.Optional(t.Numeric()),
		limit: t.Optional(t.Numeric()),
		search: t.Optional(t.String()),
		originId: t.Optional(t.String()),
		destinationId: t.Optional(t.String()),
	}),
	createRouteBody: t.Object({
		name: t.String(),
		slug: t.String(),
		originId: t.String(),
		destinationId: t.String(),
		distanceKm: t.Optional(t.String()),
		estimatedDurationMins: t.Optional(t.Number()),
	}),
	updateRouteBody: t.Object({
		name: t.Optional(t.String()),
		slug: t.Optional(t.String()),
		originId: t.Optional(t.String()),
		destinationId: t.Optional(t.String()),
		distanceKm: t.Optional(t.Nullable(t.String())),
		estimatedDurationMins: t.Optional(t.Nullable(t.Number())),
		isActive: t.Optional(t.Boolean()),
	}),

	// Trips
	tripResponse,
	listTripsResponse: paginated(tripResponse),
	tripQuery: t.Object({
		page: t.Optional(t.Numeric()),
		limit: t.Optional(t.Numeric()),
		routeId: t.Optional(t.String()),
		busId: t.Optional(t.String()),
		status: t.Optional(t.String()),
	}),
	createTripBody: t.Object({
		routeId: t.String(),
		busId: t.String(),
		departureTime: t.String(), // ISO string
		arrivalTime: t.String(),
		basePrice: t.String(),
	}),
	updateTripBody: t.Object({
		routeId: t.Optional(t.String()),
		busId: t.Optional(t.String()),
		departureTime: t.Optional(t.String()),
		arrivalTime: t.Optional(t.String()),
		basePrice: t.Optional(t.String()),
		status: t.Optional(t.Union([
			t.Literal('SCHEDULED'),
			t.Literal('ON_TIME'),
			t.Literal('DELAYED'),
			t.Literal('CANCELLED'),
			t.Literal('COMPLETED'),
		])),
		isActive: t.Optional(t.Boolean()),
	}),

	// Bookings
	bookingResponse,
	listBookingsResponse: paginated(bookingResponse),
	bookingQuery: t.Object({
		page: t.Optional(t.Numeric()),
		limit: t.Optional(t.Numeric()),
		tripId: t.Optional(t.String()),
		userId: t.Optional(t.String()),
		status: t.Optional(t.String()),
		paymentStatus: t.Optional(t.String()),
	}),
	createBookingBody: t.Object({
		tripId: t.String(),
		userId: t.String(),
		bookingPnr: t.String(),
		totalAmount: t.String(),
		paymentStatus: t.Optional(t.Union([
			t.Literal('PENDING'),
			t.Literal('PAID'),
			t.Literal('REFUNDED'),
		])),
	}),
	updateBookingBody: t.Object({
		paymentStatus: t.Optional(t.Union([
			t.Literal('PENDING'),
			t.Literal('PAID'),
			t.Literal('REFUNDED'),
		])),
		status: t.Optional(t.Union([
			t.Literal('CONFIRMED'),
			t.Literal('CANCELLED'),
		])),
	}),

	// Seat Bookings
	seatBookingResponse,
	listSeatBookingsResponse: paginated(seatBookingResponse),
	seatBookingQuery: t.Object({
		page: t.Optional(t.Numeric()),
		limit: t.Optional(t.Numeric()),
		bookingId: t.Optional(t.String()),
		seatId: t.Optional(t.String()),
	}),
	createSeatBookingBody: t.Object({
		bookingId: t.String(),
		seatId: t.String(),
		seatNumber: t.String(),
		price: t.String(),
	}),
	updateSeatBookingBody: t.Object({
		status: t.Optional(t.Union([
			t.Literal('CONFIRMED'),
			t.Literal('CANCELLED'),
		])),
	}),
} as const

export type BusModel = {
	[k in keyof typeof BusModel]: UnwrapSchema<typeof BusModel[k]>
}
