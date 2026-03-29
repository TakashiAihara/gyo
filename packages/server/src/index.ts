import { env } from "./env";
import { db } from "./db/client";
import { createApp } from "./app";

const app = createApp(db);

Bun.serve({
  port: env.PORT,
  fetch: app.fetch,
});

console.log(`gyo server listening on :${env.PORT}`);
