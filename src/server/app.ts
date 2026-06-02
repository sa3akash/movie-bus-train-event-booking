import { Elysia, t } from "elysia";
import { disconnectDb } from "./db";
import { actor } from "./modules/actor";
import { auth } from "./modules/auth";
import { movie } from "./modules/movie";
import { cinemas } from "./modules/cinemas";
import { seats } from "./modules/seats";
import { booking } from "./modules/booking";
import { payment } from "./modules/payment";
import { review } from "./modules/review";
import { ticket } from "./modules/ticket";
import { admin } from "./modules/admin";
import { busses } from "./modules/busses";
import { openapi } from '@elysia/openapi'

export const app = new Elysia({ prefix: "/api", aot: true })
  .use(openapi({
    documentation: {
      info: {
        title: 'Ticket Booking API',
        version: '1.0.0',
        description: 'API documentation for the Ticket Booking System'
      }
    }
  }))
  .use(auth)
  .use(actor)
  .use(movie)
  .use(cinemas)
  .use(seats)
  .use(booking)
  .use(payment)
  .use(review)
  .use(ticket)
  .use(admin)
  .use(busses)
  .get("/", "Hello Nextjs from elysiajs!")

process.on("SIGINT", async () => {
  await disconnectDb();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await disconnectDb();
  process.exit(0);
});
