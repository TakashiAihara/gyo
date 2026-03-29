import { Hono } from "hono";
import { createTasksRouter } from "./routes/tasks";
import healthRouter from "./routes/health";
import { tokenAuth } from "./middleware/auth";
import type { AppDB } from "./db/client";

export type AppOptions = {
  db: AppDB;
  apiToken?: string;
};

export function createApp({ db, apiToken }: AppOptions) {
  const api = new Hono();
  if (apiToken) api.use("*", tokenAuth(apiToken));
  const apiRoutes = api.route("/tasks", createTasksRouter(db));

  const app = new Hono()
    .route("/health", healthRouter)
    .route("/api/v1", apiRoutes);

  app.notFound((c) => c.json({ error: "Not found" }, 404));
  return app;
}

export type AppType = ReturnType<typeof createApp>;
