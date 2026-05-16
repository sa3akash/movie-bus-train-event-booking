import { Elysia, t } from "elysia";
import { disconnectDb } from "./db";

export const app = new Elysia({ prefix: "/api", aot: true })
  .get("/", "Hello Nextjs from elysiajs!")
  .post("/", ({ body }) => body, {
    body: t.Object({
      name: t.String(),
    }),
  });

process.on("SIGINT", async () => {
  await disconnectDb();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await disconnectDb();
  process.exit(0);
});
