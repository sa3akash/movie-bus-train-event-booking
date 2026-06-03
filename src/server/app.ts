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
import { uploadModule } from "./modules/upload";
import { videoModule } from "./modules/video";
import { openapi } from "@elysia/openapi";
import "./queue/transcode.worker";

export const app = new Elysia({ prefix: "/api", aot: true })
  .use(
    openapi({
      documentation: {
        info: {
          title: "Ticket Booking API",
          version: "1.0.0",
          description: "API documentation for the Ticket Booking System",
        },
        tags: [
          { name: "Auth", description: "Authentication endpoints" },
          { name: "Actor", description: "Actor management" },
          { name: "Movie", description: "Movie management" },
          { name: "Cinemas", description: "Cinema management" },
          { name: "Seats", description: "Seat management" },
          { name: "Booking", description: "Booking management" },
          { name: "Payment", description: "Payment management" },
          { name: "Review", description: "Review management" },
          { name: "Ticket", description: "Ticket management" },
          { name: "Admin", description: "Admin management" },
          { name: "Bus", description: "Bus-related endpoints" },
          { name: "Upload", description: "Upload management" },
          { name: "Video", description: "Video transcoding management" },
        ],
      },
      exclude: {
        paths: ["/api/"],
      },
    }),
  )
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
  .use(uploadModule)
  .use(videoModule)
  .get("/", "Hello Nextjs from elysiajs!");

process.on("SIGINT", async () => {
  await disconnectDb();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await disconnectDb();
  process.exit(0);
});
