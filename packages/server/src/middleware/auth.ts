import { createMiddleware } from "hono/factory";

export function tokenAuth(token: string) {
  return createMiddleware(async (c, next) => {
    const header = c.req.header("Authorization");
    if (!header || !header.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    if (header.slice(7) !== token) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    await next();
  });
}
