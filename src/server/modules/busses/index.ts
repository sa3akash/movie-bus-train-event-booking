import { Elysia, t } from 'elysia'
import { isAdmin } from '@/server/middlewares/auth'
import { BusModel } from './model'
import {
	BrandService,
	BusTypeService,
	SeatTypeService,
	BusService,
	BusSeatService,
	LocationService,
	CounterService,
	RouteService,
	TripService,
	BookingService,
	SeatBookingService,
} from './service'

// ─── /api/bus/brands ─────────────────────────────────────────────────────────
const brands = new Elysia({ prefix: '/brands' })
	.get('/', ({ query }) => BrandService.list(query), {
		query: BusModel.paginationQuery,
		response: { 200: BusModel.listBrandsResponse },
	})
	.get('/:id', ({ params: { id } }) => BrandService.findById(id), {
		params: t.Object({ id: t.String() }),
		response: { 200: BusModel.brandResponse, 404: BusModel.errorResponse },
	})
	.use(isAdmin)
	.post('/', ({ body }) => BrandService.create(body), {
		body: BusModel.createBrandBody,
		response: { 200: BusModel.brandResponse, 400: BusModel.errorResponse },
	})
	.put('/:id', ({ params: { id }, body }) => BrandService.update(id, body), {
		params: t.Object({ id: t.String() }),
		body: BusModel.updateBrandBody,
		response: { 200: BusModel.brandResponse, 400: BusModel.errorResponse, 404: BusModel.errorResponse },
	})
	.delete('/:id', ({ params: { id } }) => BrandService.remove(id), {
		params: t.Object({ id: t.String() }),
		response: { 200: t.Object({ message: t.String() }), 404: BusModel.errorResponse },
	})

// ─── /api/bus/types ───────────────────────────────────────────────────────────
const busTypes = new Elysia({ prefix: '/types' })
	.get('/', ({ query }) => BusTypeService.list(query), {
		query: BusModel.paginationQuery,
		response: { 200: BusModel.listBusTypesResponse },
	})
	.get('/:id', ({ params: { id } }) => BusTypeService.findById(id), {
		params: t.Object({ id: t.String() }),
		response: { 200: BusModel.busTypeResponse, 404: BusModel.errorResponse },
	})
	.use(isAdmin)
	.post('/', ({ body }) => BusTypeService.create(body), {
		body: BusModel.createBusTypeBody,
		response: { 200: BusModel.busTypeResponse, 400: BusModel.errorResponse },
	})
	.put('/:id', ({ params: { id }, body }) => BusTypeService.update(id, body), {
		params: t.Object({ id: t.String() }),
		body: BusModel.updateBusTypeBody,
		response: { 200: BusModel.busTypeResponse, 400: BusModel.errorResponse, 404: BusModel.errorResponse },
	})
	.delete('/:id', ({ params: { id } }) => BusTypeService.remove(id), {
		params: t.Object({ id: t.String() }),
		response: { 200: t.Object({ message: t.String() }), 404: BusModel.errorResponse },
	})

// ─── /api/bus/seat-types ──────────────────────────────────────────────────────
const seatTypes = new Elysia({ prefix: '/seat-types' })
	.get('/', ({ query }) => SeatTypeService.list(query), {
		query: BusModel.seatTypeQuery,
		response: { 200: BusModel.listSeatTypesResponse },
	})
	.get('/:id', ({ params: { id } }) => SeatTypeService.findById(id), {
		params: t.Object({ id: t.String() }),
		response: { 200: BusModel.seatTypeResponse, 404: BusModel.errorResponse },
	})
	.use(isAdmin)
	.post('/', ({ body }) => SeatTypeService.create(body), {
		body: BusModel.createSeatTypeBody,
		response: { 200: BusModel.seatTypeResponse, 400: BusModel.errorResponse },
	})
	.put('/:id', ({ params: { id }, body }) => SeatTypeService.update(id, body), {
		params: t.Object({ id: t.String() }),
		body: BusModel.updateSeatTypeBody,
		response: { 200: BusModel.seatTypeResponse, 400: BusModel.errorResponse, 404: BusModel.errorResponse },
	})
	.delete('/:id', ({ params: { id } }) => SeatTypeService.remove(id), {
		params: t.Object({ id: t.String() }),
		response: { 200: t.Object({ message: t.String() }), 404: BusModel.errorResponse },
	})

// ─── /api/bus/buses ───────────────────────────────────────────────────────────
const buses = new Elysia({ prefix: '/buses' })
	.get('/', ({ query }) => BusService.list(query), {
		query: BusModel.busQuery,
		response: { 200: BusModel.listBusesResponse },
	})
	.get('/slug/:slug', ({ params: { slug } }) => BusService.findBySlug(slug), {
		params: t.Object({ slug: t.String() }),
		response: { 200: BusModel.busResponse, 404: BusModel.errorResponse },
	})
	.get('/:id', ({ params: { id } }) => BusService.findById(id), {
		params: t.Object({ id: t.String() }),
		response: { 200: BusModel.busResponse, 404: BusModel.errorResponse },
	})
	.use(isAdmin)
	.post('/', ({ body }) => BusService.create(body), {
		body: BusModel.createBusBody,
		response: { 200: BusModel.busResponse, 400: BusModel.errorResponse },
	})
	.put('/:id', ({ params: { id }, body }) => BusService.update(id, body), {
		params: t.Object({ id: t.String() }),
		body: BusModel.updateBusBody,
		response: { 200: BusModel.busResponse, 400: BusModel.errorResponse, 404: BusModel.errorResponse },
	})
	.delete('/:id', ({ params: { id } }) => BusService.remove(id), {
		params: t.Object({ id: t.String() }),
		response: { 200: t.Object({ message: t.String() }), 404: BusModel.errorResponse },
	})

// ─── /api/bus/seats ───────────────────────────────────────────────────────────
const seats = new Elysia({ prefix: '/seats' })
	.get('/', ({ query }) => BusSeatService.list(query), {
		query: BusModel.busSeatQuery,
		response: { 200: BusModel.listBusSeatsResponse },
	})
	.get('/:id', ({ params: { id } }) => BusSeatService.findById(id), {
		params: t.Object({ id: t.String() }),
		response: { 200: BusModel.busSeatResponse, 404: BusModel.errorResponse },
	})
	.use(isAdmin)
	.post('/', ({ body }) => BusSeatService.create(body), {
		body: BusModel.createBusSeatBody,
		response: { 200: BusModel.busSeatResponse, 400: BusModel.errorResponse },
	})
	.put('/:id', ({ params: { id }, body }) => BusSeatService.update(id, body), {
		params: t.Object({ id: t.String() }),
		body: BusModel.updateBusSeatBody,
		response: { 200: BusModel.busSeatResponse, 400: BusModel.errorResponse, 404: BusModel.errorResponse },
	})
	.delete('/:id', ({ params: { id } }) => BusSeatService.remove(id), {
		params: t.Object({ id: t.String() }),
		response: { 200: t.Object({ message: t.String() }), 404: BusModel.errorResponse },
	})

// ─── /api/bus/locations ───────────────────────────────────────────────────────
const locations = new Elysia({ prefix: '/locations' })
	.get('/', ({ query }) => LocationService.list(query), {
		query: BusModel.locationQuery,
		response: { 200: BusModel.listLocationsResponse },
	})
	.get('/:id', ({ params: { id } }) => LocationService.findById(id), {
		params: t.Object({ id: t.String() }),
		response: { 200: BusModel.locationResponse, 404: BusModel.errorResponse },
	})
	.use(isAdmin)
	.post('/', ({ body }) => LocationService.create(body), {
		body: BusModel.createLocationBody,
		response: { 200: BusModel.locationResponse, 400: BusModel.errorResponse },
	})
	.put('/:id', ({ params: { id }, body }) => LocationService.update(id, body), {
		params: t.Object({ id: t.String() }),
		body: BusModel.updateLocationBody,
		response: { 200: BusModel.locationResponse, 400: BusModel.errorResponse, 404: BusModel.errorResponse },
	})
	.delete('/:id', ({ params: { id } }) => LocationService.remove(id), {
		params: t.Object({ id: t.String() }),
		response: { 200: t.Object({ message: t.String() }), 404: BusModel.errorResponse },
	})

// ─── /api/bus/counters ────────────────────────────────────────────────────────
const counters = new Elysia({ prefix: '/counters' })
	.get('/', ({ query }) => CounterService.list(query), {
		query: BusModel.counterQuery,
		response: { 200: BusModel.listCountersResponse },
	})
	.get('/:id', ({ params: { id } }) => CounterService.findById(id), {
		params: t.Object({ id: t.String() }),
		response: { 200: BusModel.counterResponse, 404: BusModel.errorResponse },
	})
	.use(isAdmin)
	.post('/', ({ body }) => CounterService.create(body), {
		body: BusModel.createCounterBody,
		response: { 200: BusModel.counterResponse, 400: BusModel.errorResponse },
	})
	.put('/:id', ({ params: { id }, body }) => CounterService.update(id, body), {
		params: t.Object({ id: t.String() }),
		body: BusModel.updateCounterBody,
		response: { 200: BusModel.counterResponse, 400: BusModel.errorResponse, 404: BusModel.errorResponse },
	})
	.delete('/:id', ({ params: { id } }) => CounterService.remove(id), {
		params: t.Object({ id: t.String() }),
		response: { 200: t.Object({ message: t.String() }), 404: BusModel.errorResponse },
	})

// ─── /api/bus/routes ──────────────────────────────────────────────────────────
const routes = new Elysia({ prefix: '/routes' })
	.get('/', ({ query }) => RouteService.list(query), {
		query: BusModel.routeQuery,
		response: { 200: BusModel.listRoutesResponse },
	})
	.get('/:id', ({ params: { id } }) => RouteService.findById(id), {
		params: t.Object({ id: t.String() }),
		response: { 200: BusModel.routeResponse, 404: BusModel.errorResponse },
	})
	.use(isAdmin)
	.post('/', ({ body }) => RouteService.create(body), {
		body: BusModel.createRouteBody,
		response: { 200: BusModel.routeResponse, 400: BusModel.errorResponse },
	})
	.put('/:id', ({ params: { id }, body }) => RouteService.update(id, body), {
		params: t.Object({ id: t.String() }),
		body: BusModel.updateRouteBody,
		response: { 200: BusModel.routeResponse, 400: BusModel.errorResponse, 404: BusModel.errorResponse },
	})
	.delete('/:id', ({ params: { id } }) => RouteService.remove(id), {
		params: t.Object({ id: t.String() }),
		response: { 200: t.Object({ message: t.String() }), 404: BusModel.errorResponse },
	})

// ─── /api/bus/trips ───────────────────────────────────────────────────────────
const trips = new Elysia({ prefix: '/trips' })
	.get('/', ({ query }) => TripService.list(query), {
		query: BusModel.tripQuery,
		response: { 200: BusModel.listTripsResponse },
	})
	.get('/:id', ({ params: { id } }) => TripService.findById(id), {
		params: t.Object({ id: t.String() }),
		response: { 200: BusModel.tripResponse, 404: BusModel.errorResponse },
	})
	.use(isAdmin)
	.post('/', ({ body }) => TripService.create(body), {
		body: BusModel.createTripBody,
		response: { 200: BusModel.tripResponse, 400: BusModel.errorResponse },
	})
	.put('/:id', ({ params: { id }, body }) => TripService.update(id, body), {
		params: t.Object({ id: t.String() }),
		body: BusModel.updateTripBody,
		response: { 200: BusModel.tripResponse, 400: BusModel.errorResponse, 404: BusModel.errorResponse },
	})
	.delete('/:id', ({ params: { id } }) => TripService.remove(id), {
		params: t.Object({ id: t.String() }),
		response: { 200: t.Object({ message: t.String() }), 404: BusModel.errorResponse },
	})

// ─── /api/bus/bookings ────────────────────────────────────────────────────────
const bookings = new Elysia({ prefix: '/bookings' })
	.get('/', ({ query }) => BookingService.list(query), {
		query: BusModel.bookingQuery,
		response: { 200: BusModel.listBookingsResponse },
	})
	.get('/pnr/:pnr', ({ params: { pnr } }) => BookingService.findByPnr(pnr), {
		params: t.Object({ pnr: t.String() }),
		response: { 200: BusModel.bookingResponse, 404: BusModel.errorResponse },
	})
	.get('/:id', ({ params: { id } }) => BookingService.findById(id), {
		params: t.Object({ id: t.String() }),
		response: { 200: BusModel.bookingResponse, 404: BusModel.errorResponse },
	})
	.use(isAdmin)
	.post('/', ({ body }) => BookingService.create(body), {
		body: BusModel.createBookingBody,
		response: { 200: BusModel.bookingResponse, 400: BusModel.errorResponse },
	})
	.put('/:id', ({ params: { id }, body }) => BookingService.update(id, body), {
		params: t.Object({ id: t.String() }),
		body: BusModel.updateBookingBody,
		response: { 200: BusModel.bookingResponse, 400: BusModel.errorResponse, 404: BusModel.errorResponse },
	})
	.delete('/:id', ({ params: { id } }) => BookingService.remove(id), {
		params: t.Object({ id: t.String() }),
		response: { 200: t.Object({ message: t.String() }), 404: BusModel.errorResponse },
	})

// ─── /api/bus/seat-bookings ───────────────────────────────────────────────────
const seatBookings = new Elysia({ prefix: '/seat-bookings' })
	.get('/', ({ query }) => SeatBookingService.list(query), {
		query: BusModel.seatBookingQuery,
		response: { 200: BusModel.listSeatBookingsResponse },
	})
	.get('/:id', ({ params: { id } }) => SeatBookingService.findById(id), {
		params: t.Object({ id: t.String() }),
		response: { 200: BusModel.seatBookingResponse, 404: BusModel.errorResponse },
	})
	.use(isAdmin)
	.post('/', ({ body }) => SeatBookingService.create(body), {
		body: BusModel.createSeatBookingBody,
		response: { 200: BusModel.seatBookingResponse, 400: BusModel.errorResponse },
	})
	.put('/:id', ({ params: { id }, body }) => SeatBookingService.update(id, body), {
		params: t.Object({ id: t.String() }),
		body: BusModel.updateSeatBookingBody,
		response: { 200: BusModel.seatBookingResponse, 400: BusModel.errorResponse, 404: BusModel.errorResponse },
	})
	.delete('/:id', ({ params: { id } }) => SeatBookingService.remove(id), {
		params: t.Object({ id: t.String() }),
		response: { 200: t.Object({ message: t.String() }), 404: BusModel.errorResponse },
	})

// ─── Root plugin — /api/bus/* ─────────────────────────────────────────────────
export const busses = new Elysia({ prefix: '/bus' })
	.use(brands)
	.use(busTypes)
	.use(seatTypes)
	.use(buses)
	.use(seats)
	.use(locations)
	.use(counters)
	.use(routes)
	.use(trips)
	.use(bookings)
	.use(seatBookings)
