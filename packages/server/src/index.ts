import { env } from "./env";
import { db } from "./db/client";
import { createApp } from "./app";

const app = createApp({ db, apiToken: env.GYO_API_TOKEN });

Bun.serve({
  port: env.PORT,
  fetch: app.fetch,
});

console.log(`gyo server listening on :${env.PORT}`);
