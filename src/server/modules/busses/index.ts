import { Elysia, t } from "elysia";
import { isAdmin } from "@/server/middlewares/auth";
import { BusModel } from "./model";
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
} from "./service";

// ─── /api/bus/brands ─────────────────────────────────────────────────────────
const brands = new Elysia({ prefix: "/brands" })
  .get("/", ({ query }) => BrandService.list(query), {
    query: BusModel.paginationQuery,
    response: { 200: BusModel.listBrandsResponse },
    detail: {
      tags: ["Bus"],
      summary: "List bus brands",
      description: "List bus brands",
    },
  })
  .get("/:id", ({ params: { id } }) => BrandService.findById(id), {
    params: t.Object({ id: t.String() }),
    response: { 200: BusModel.brandResponse, 404: BusModel.errorResponse },
    detail: {
      tags: ["Bus"],
      summary: "Get bus brand by id",
      description: "Get bus brand by id",
    },
  })
  .use(isAdmin)
  .post("/", ({ body }) => BrandService.create(body), {
    body: BusModel.createBrandBody,
    response: { 200: BusModel.brandResponse, 400: BusModel.errorResponse },
    detail: {
      tags: ["Bus"],
      summary: "Create a bus brand",
      description: "Create a bus brand",
    },
  })
  .put("/:id", ({ params: { id }, body }) => BrandService.update(id, body), {
    params: t.Object({ id: t.String() }),
    body: BusModel.updateBrandBody,
    response: {
      200: BusModel.brandResponse,
      400: BusModel.errorResponse,
      404: BusModel.errorResponse,
    },
    detail: {
      tags: ["Bus"],
      summary: "Update a bus brand",
      description: "Update a bus brand",
    },
  })
  .delete("/:id", ({ params: { id } }) => BrandService.remove(id), {
    params: t.Object({ id: t.String() }),
    response: {
      200: t.Object({ message: t.String() }),
      404: BusModel.errorResponse,
    },
    detail: {
      tags: ["Bus"],
      summary: "Delete a bus brand",
      description: "Delete a bus brand",
    },
  });

// ─── /api/bus/types ───────────────────────────────────────────────────────────
const busTypes = new Elysia({ prefix: "/types" })
  .get("/", ({ query }) => BusTypeService.list(query), {
    query: BusModel.paginationQuery,
    response: { 200: BusModel.listBusTypesResponse },
    detail: {
      tags: ["Bus"],
      summary: "List bus types",
      description: "List bus types",
    },
  })
  .get("/:id", ({ params: { id } }) => BusTypeService.findById(id), {
    params: t.Object({ id: t.String() }),
    response: { 200: BusModel.busTypeResponse, 404: BusModel.errorResponse },
    detail: {
      tags: ["Bus"],
      summary: "Get bus type by id",
      description: "Get bus type by id",
    },
  })
  .use(isAdmin)
  .post("/", ({ body }) => BusTypeService.create(body), {
    body: BusModel.createBusTypeBody,
    response: { 200: BusModel.busTypeResponse, 400: BusModel.errorResponse },
    detail: {
      tags: ["Bus"],
      summary: "Create a bus type",
      description: "Create a bus type",
    },
  })
  .put("/:id", ({ params: { id }, body }) => BusTypeService.update(id, body), {
    params: t.Object({ id: t.String() }),
    body: BusModel.updateBusTypeBody,
    response: {
      200: BusModel.busTypeResponse,
      400: BusModel.errorResponse,
      404: BusModel.errorResponse,
    },
    detail: {
      tags: ["Bus"],
      summary: "Update a bus type",
      description: "Update a bus type",
    },
  })
  .delete("/:id", ({ params: { id } }) => BusTypeService.remove(id), {
    params: t.Object({ id: t.String() }),
    response: {
      200: t.Object({ message: t.String() }),
      404: BusModel.errorResponse,
    },
    detail: {
      tags: ["Bus"],
      summary: "Delete a bus type",
      description: "Delete a bus type",
    },
  });

// ─── /api/bus/seat-types ──────────────────────────────────────────────────────
const seatTypes = new Elysia({ prefix: "/seat-types" })
  .get("/", ({ query }) => SeatTypeService.list(query), {
    query: BusModel.seatTypeQuery,
    response: { 200: BusModel.listSeatTypesResponse },
    detail: {
      tags: ["Bus"],
      summary: "List seat types",
      description: "List seat types",
    },
  })
  .get("/:id", ({ params: { id } }) => SeatTypeService.findById(id), {
    params: t.Object({ id: t.String() }),
    response: { 200: BusModel.seatTypeResponse, 404: BusModel.errorResponse },
    detail: {
      tags: ["Bus"],
      summary: "Get seat type by id",
      description: "Get seat type by id",
    },
  })
  .use(isAdmin)
  .post("/", ({ body }) => SeatTypeService.create(body), {
    body: BusModel.createSeatTypeBody,
    response: { 200: BusModel.seatTypeResponse, 400: BusModel.errorResponse },
    detail: {
      tags: ["Bus"],
      summary: "Create a seat type",
      description: "Create a seat type",
    },
  })
  .put("/:id", ({ params: { id }, body }) => SeatTypeService.update(id, body), {
    params: t.Object({ id: t.String() }),
    body: BusModel.updateSeatTypeBody,
    response: {
      200: BusModel.seatTypeResponse,
      400: BusModel.errorResponse,
      404: BusModel.errorResponse,
    },
    detail: {
      tags: ["Bus"],
      summary: "Update a seat type",
      description: "Update a seat type",
    },
  })
  .delete("/:id", ({ params: { id } }) => SeatTypeService.remove(id), {
    params: t.Object({ id: t.String() }),
    response: {
      200: t.Object({ message: t.String() }),
      404: BusModel.errorResponse,
    },
    detail: {
      tags: ["Bus"],
      summary: "Delete a seat type",
      description: "Delete a seat type",
    },
  });

// ─── /api/bus/buses ───────────────────────────────────────────────────────────
const buses = new Elysia({ prefix: "/buses" })
  .get("/", ({ query }) => BusService.list(query), {
    query: BusModel.busQuery,
    response: { 200: BusModel.listBusesResponse },
    detail: {
      tags: ["Bus"],
      summary: "List buses",
      description: "List buses",
    },
  })
  .get("/slug/:slug", ({ params: { slug } }) => BusService.findBySlug(slug), {
    params: t.Object({ slug: t.String() }),
    response: { 200: BusModel.busResponse, 404: BusModel.errorResponse },
    detail: {
      tags: ["Bus"],
      summary: "Get bus by slug",
      description: "Get bus by slug",
    },
  })
  .get("/:id", ({ params: { id } }) => BusService.findById(id), {
    params: t.Object({ id: t.String() }),
    response: { 200: BusModel.busResponse, 404: BusModel.errorResponse },
    detail: {
      tags: ["Bus"],
      summary: "Get bus by id",
      description: "Get bus by id",
    },
  })
  .use(isAdmin)
  .post("/", ({ body }) => BusService.create(body), {
    body: BusModel.createBusBody,
    response: { 200: BusModel.busResponse, 400: BusModel.errorResponse },
    detail: {
      tags: ["Bus"],
      summary: "Create a bus",
      description: "Create a bus",
    },
  })
  .put("/:id", ({ params: { id }, body }) => BusService.update(id, body), {
    params: t.Object({ id: t.String() }),
    body: BusModel.updateBusBody,
    response: {
      200: BusModel.busResponse,
      400: BusModel.errorResponse,
      404: BusModel.errorResponse,
    },
    detail: {
      tags: ["Bus"],
      summary: "Update a bus",
      description: "Update a bus",
    },
  })
  .delete("/:id", ({ params: { id } }) => BusService.remove(id), {
    params: t.Object({ id: t.String() }),
    response: {
      200: t.Object({ message: t.String() }),
      404: BusModel.errorResponse,
    },
    detail: {
      tags: ["Bus"],
      summary: "Delete a bus",
      description: "Delete a bus",
    },
  });

// ─── /api/bus/seats ───────────────────────────────────────────────────────────
const seats = new Elysia({ prefix: "/seats" })
  .get("/", ({ query }) => BusSeatService.list(query), {
    query: BusModel.busSeatQuery,
    response: { 200: BusModel.listBusSeatsResponse },
    detail: {
      tags: ["Bus"],
      summary: "List bus seats",
      description: "List bus seats",
    },
  })
  .get("/:id", ({ params: { id } }) => BusSeatService.findById(id), {
    params: t.Object({ id: t.String() }),
    response: { 200: BusModel.busSeatResponse, 404: BusModel.errorResponse },
    detail: {
      tags: ["Bus"],
      summary: "Get bus seat by id",
      description: "Get bus seat by id",
    },
  })
  .use(isAdmin)
  .post("/", ({ body }) => BusSeatService.create(body), {
    body: BusModel.createBusSeatBody,
    response: { 200: BusModel.busSeatResponse, 400: BusModel.errorResponse },
    detail: {
      tags: ["Bus"],
      summary: "Create a bus seat",
      description: "Create a bus seat",
    },
  })
  .put("/:id", ({ params: { id }, body }) => BusSeatService.update(id, body), {
    params: t.Object({ id: t.String() }),
    body: BusModel.updateBusSeatBody,
    response: {
      200: BusModel.busSeatResponse,
      400: BusModel.errorResponse,
      404: BusModel.errorResponse,
    },
    detail: {
      tags: ["Bus"],
      summary: "Update a bus seat",
      description: "Update a bus seat",
    },
  })
  .delete("/:id", ({ params: { id } }) => BusSeatService.remove(id), {
    params: t.Object({ id: t.String() }),
    response: {
      200: t.Object({ message: t.String() }),
      404: BusModel.errorResponse,
    },
    detail: {
      tags: ["Bus"],
      summary: "Delete a bus seat",
      description: "Delete a bus seat",
    },
  });

// ─── /api/bus/locations ───────────────────────────────────────────────────────
const locations = new Elysia({ prefix: "/locations" })
  .get("/", ({ query }) => LocationService.list(query), {
    query: BusModel.locationQuery,
    response: { 200: BusModel.listLocationsResponse },
    detail: {
      tags: ["Bus"],
      summary: "List locations",
      description: "List locations",
    },
  })
  .get("/:id", ({ params: { id } }) => LocationService.findById(id), {
    params: t.Object({ id: t.String() }),
    response: { 200: BusModel.locationResponse, 404: BusModel.errorResponse },
    detail: {
      tags: ["Bus"],
      summary: "Get location by id",
      description: "Get location by id",
    },
  })
  .use(isAdmin)
  .post("/", ({ body }) => LocationService.create(body), {
    body: BusModel.createLocationBody,
    response: { 200: BusModel.locationResponse, 400: BusModel.errorResponse },
    detail: {
      tags: ["Bus"],
      summary: "Create a location",
      description: "Create a location",
    },
  })
  .put("/:id", ({ params: { id }, body }) => LocationService.update(id, body), {
    params: t.Object({ id: t.String() }),
    body: BusModel.updateLocationBody,
    response: {
      200: BusModel.locationResponse,
      400: BusModel.errorResponse,
      404: BusModel.errorResponse,
    },
    detail: {
      tags: ["Bus"],
      summary: "Update a location",
      description: "Update a location",
    },
  })
  .delete("/:id", ({ params: { id } }) => LocationService.remove(id), {
    params: t.Object({ id: t.String() }),
    response: {
      200: t.Object({ message: t.String() }),
      404: BusModel.errorResponse,
    },
    detail: {
      tags: ["Bus"],
      summary: "Delete a location",
      description: "Delete a location",
    },
  });

// ─── /api/bus/counters ────────────────────────────────────────────────────────
const counters = new Elysia({ prefix: "/counters" })
  .get("/", ({ query }) => CounterService.list(query), {
    query: BusModel.counterQuery,
    response: { 200: BusModel.listCountersResponse },
    detail: {
      tags: ["Bus"],
      summary: "List counters",
      description: "List counters",
    },
  })
  .get("/:id", ({ params: { id } }) => CounterService.findById(id), {
    params: t.Object({ id: t.String() }),
    response: { 200: BusModel.counterResponse, 404: BusModel.errorResponse },
    detail: {
      tags: ["Bus"],
      summary: "Get counter by id",
      description: "Get counter by id",
    },
  })
  .use(isAdmin)
  .post("/", ({ body }) => CounterService.create(body), {
    body: BusModel.createCounterBody,
    response: { 200: BusModel.counterResponse, 400: BusModel.errorResponse },
    detail: {
      tags: ["Bus"],
      summary: "Create a counter",
      description: "Create a counter",
    },
  })
  .put("/:id", ({ params: { id }, body }) => CounterService.update(id, body), {
    params: t.Object({ id: t.String() }),
    body: BusModel.updateCounterBody,
    response: {
      200: BusModel.counterResponse,
      400: BusModel.errorResponse,
      404: BusModel.errorResponse,
    },
    detail: {
      tags: ["Bus"],
      summary: "Update a counter",
      description: "Update a counter",
    },
  })
  .delete("/:id", ({ params: { id } }) => CounterService.remove(id), {
    params: t.Object({ id: t.String() }),
    response: {
      200: t.Object({ message: t.String() }),
      404: BusModel.errorResponse,
    },
    detail: {
      tags: ["Bus"],
      summary: "Delete a counter",
      description: "Delete a counter",
    },
  });

// ─── /api/bus/routes ──────────────────────────────────────────────────────────
const routes = new Elysia({ prefix: "/routes" })
  .get("/", ({ query }) => RouteService.list(query), {
    query: BusModel.routeQuery,
    response: { 200: BusModel.listRoutesResponse },
    detail: {
      tags: ["Bus"],
      summary: "List routes",
      description: "List routes",
    },
  })
  .get("/:id", ({ params: { id } }) => RouteService.findById(id), {
    params: t.Object({ id: t.String() }),
    response: { 200: BusModel.routeResponse, 404: BusModel.errorResponse },
    detail: {
      tags: ["Bus"],
      summary: "Get route by id",
      description: "Get route by id",
    },
  })
  .use(isAdmin)
  .post("/", ({ body }) => RouteService.create(body), {
    body: BusModel.createRouteBody,
    response: { 200: BusModel.routeResponse, 400: BusModel.errorResponse },
    detail: {
      tags: ["Bus"],
      summary: "Create a route",
      description: "Create a route",
    },
  })
  .put("/:id", ({ params: { id }, body }) => RouteService.update(id, body), {
    params: t.Object({ id: t.String() }),
    body: BusModel.updateRouteBody,
    response: {
      200: BusModel.routeResponse,
      400: BusModel.errorResponse,
      404: BusModel.errorResponse,
    },
    detail: {
      tags: ["Bus"],
      summary: "Update a route",
      description: "Update a route",
    },
  })
  .delete("/:id", ({ params: { id } }) => RouteService.remove(id), {
    params: t.Object({ id: t.String() }),
    response: {
      200: t.Object({ message: t.String() }),
      404: BusModel.errorResponse,
    },
    detail: {
      tags: ["Bus"],
      summary: "Delete a route",
      description: "Delete a route",
    },
  });

// ─── /api/bus/trips ───────────────────────────────────────────────────────────
const trips = new Elysia({ prefix: "/trips" })
  .get("/", ({ query }) => TripService.list(query), {
    query: BusModel.tripQuery,
    response: { 200: BusModel.listTripsResponse },
    detail: {
      tags: ["Bus"],
      summary: "List trips",
      description: "List trips",
    },
  })
  .get("/:id", ({ params: { id } }) => TripService.findById(id), {
    params: t.Object({ id: t.String() }),
    response: { 200: BusModel.tripResponse, 404: BusModel.errorResponse },
    detail: {
      tags: ["Bus"],
      summary: "Get trip by id",
      description: "Get trip by id",
    },
  })
  .use(isAdmin)
  .post("/", ({ body }) => TripService.create(body), {
    body: BusModel.createTripBody,
    response: { 200: BusModel.tripResponse, 400: BusModel.errorResponse },
    detail: {
      tags: ["Bus"],
      summary: "Create a trip",
      description: "Create a trip",
    },
  })
  .put("/:id", ({ params: { id }, body }) => TripService.update(id, body), {
    params: t.Object({ id: t.String() }),
    body: BusModel.updateTripBody,
    response: {
      200: BusModel.tripResponse,
      400: BusModel.errorResponse,
      404: BusModel.errorResponse,
    },
    detail: {
      tags: ["Bus"],
      summary: "Update a trip",
      description: "Update a trip",
    },
  })
  .delete("/:id", ({ params: { id } }) => TripService.remove(id), {
    params: t.Object({ id: t.String() }),
    response: {
      200: t.Object({ message: t.String() }),
      404: BusModel.errorResponse,
    },
    detail: {
      tags: ["Bus"],
      summary: "Delete a trip",
      description: "Delete a trip",
    },
  });

// ─── /api/bus/bookings ────────────────────────────────────────────────────────
const bookings = new Elysia({ prefix: "/bookings" })
  .get("/", ({ query }) => BookingService.list(query), {
    query: BusModel.bookingQuery,
    response: { 200: BusModel.listBookingsResponse },
    detail: {
      tags: ["Bus"],
      summary: "List bookings",
      description: "List bookings",
    },
  })
  .get("/pnr/:pnr", ({ params: { pnr } }) => BookingService.findByPnr(pnr), {
    params: t.Object({ pnr: t.String() }),
    response: { 200: BusModel.bookingResponse, 404: BusModel.errorResponse },
    detail: {
      tags: ["Bus"],
      summary: "Get booking by pnr",
      description: "Get booking by pnr",
    },
  })
  .get("/:id", ({ params: { id } }) => BookingService.findById(id), {
    params: t.Object({ id: t.String() }),
    response: { 200: BusModel.bookingResponse, 404: BusModel.errorResponse },
    detail: {
      tags: ["Bus"],
      summary: "Get booking by id",
      description: "Get booking by id",
    },
  })
  .use(isAdmin)
  .post("/", ({ body }) => BookingService.create(body), {
    body: BusModel.createBookingBody,
    response: { 200: BusModel.bookingResponse, 400: BusModel.errorResponse },
    detail: {
      tags: ["Bus"],
      summary: "Create a booking",
      description: "Create a booking",
    },
  })
  .put("/:id", ({ params: { id }, body }) => BookingService.update(id, body), {
    params: t.Object({ id: t.String() }),
    body: BusModel.updateBookingBody,
    response: {
      200: BusModel.bookingResponse,
      400: BusModel.errorResponse,
      404: BusModel.errorResponse,
    },
    detail: {
      tags: ["Bus"],
      summary: "Update a booking",
      description: "Update a booking",
    },
  })
  .delete("/:id", ({ params: { id } }) => BookingService.remove(id), {
    params: t.Object({ id: t.String() }),
    response: {
      200: t.Object({ message: t.String() }),
      404: BusModel.errorResponse,
    },
    detail: {
      tags: ["Bus"],
      summary: "Delete a booking",
      description: "Delete a booking",
    },
  });

// ─── /api/bus/seat-bookings ───────────────────────────────────────────────────
const seatBookings = new Elysia({ prefix: "/seat-bookings" })
  .get("/", ({ query }) => SeatBookingService.list(query), {
    query: BusModel.seatBookingQuery,
    response: { 200: BusModel.listSeatBookingsResponse },
    detail: {
      tags: ["Bus"],
      summary: "List seat bookings",
      description: "List seat bookings",
    },
  })
  .get("/:id", ({ params: { id } }) => SeatBookingService.findById(id), {
    params: t.Object({ id: t.String() }),
    response: {
      200: BusModel.seatBookingResponse,
      404: BusModel.errorResponse,
    },
    detail: {
      tags: ["Bus"],
      summary: "Get seat booking by id",
      description: "Get seat booking by id",
    },
  })
  .use(isAdmin)
  .post("/", ({ body }) => SeatBookingService.create(body), {
    body: BusModel.createSeatBookingBody,
    response: {
      200: BusModel.seatBookingResponse,
      400: BusModel.errorResponse,
    },
    detail: {
      tags: ["Bus"],
      summary: "Create a seat booking",
      description: "Create a seat booking",
    },
  })
  .put(
    "/:id",
    ({ params: { id }, body }) => SeatBookingService.update(id, body),
    {
      params: t.Object({ id: t.String() }),
      body: BusModel.updateSeatBookingBody,
      response: {
        200: BusModel.seatBookingResponse,
        400: BusModel.errorResponse,
        404: BusModel.errorResponse,
      },
      detail: {
        tags: ["Bus"],
        summary: "Update a seat booking",
        description: "Update a seat booking",
      },
    },
  )
  .delete("/:id", ({ params: { id } }) => SeatBookingService.remove(id), {
    params: t.Object({ id: t.String() }),
    response: {
      200: t.Object({ message: t.String() }),
      404: BusModel.errorResponse,
    },
    detail: {
      tags: ["Bus"],
      summary: "Delete a seat booking",
      description: "Delete a seat booking",
    },
  });

// ─── Root plugin — /api/bus/* ─────────────────────────────────────────────────
export const busses = new Elysia({ prefix: "/bus" })
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
  .use(seatBookings);
