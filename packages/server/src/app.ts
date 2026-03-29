import { Hono } from "hono";
import { createTasksRouter } from "./routes/tasks";
import healthRouter from "./routes/health";
import type { AppDB } from "./db/client";

export function createApp(appDb: AppDB) {
  const app = new Hono()
    .route("/health", healthRouter)
    .route("/api/v1/tasks", createTasksRouter(appDb));

  app.notFound((c) => c.json({ error: "Not found" }, 404));
  return app;
}

export type AppType = ReturnType<typeof createApp>;
