import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { tasks, taskRelations } from "../db/schema";
import { eq, and, gte, lte, or, ilike } from "drizzle-orm";
import type { AppDB } from "../db/client";
import type { TaskStatus, TaskPriority } from "@gyo/shared";

const isoDate = z.string().datetime({ offset: true });

const createSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  start_date: isoDate.optional(),
  end_date: isoDate.optional(),
  due_date: isoDate.optional(),
  estimated_minutes: z.number().int().positive().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content: z.string().nullable().optional(),
  status: z.enum(["todo", "in_progress", "done", "cancelled"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  start_date: isoDate.nullable().optional(),
  end_date: isoDate.nullable().optional(),
  due_date: isoDate.nullable().optional(),
  estimated_minutes: z.number().int().positive().nullable().optional(),
});

const relationSchema = z.object({
  target_id: z.string().uuid(),
  type: z.enum(["blocks", "subtask", "related"]),
});

function toDate(s: string | null | undefined): Date | null {
  return s ? new Date(s) : null;
}

export function createTasksRouter(db: AppDB) {
  return new Hono()
    .post("/", zValidator("json", createSchema), async (c) => {
      const body = c.req.valid("json");
      const [task] = await db
        .insert(tasks)
        .values({
          // TODO: replace with authenticated user_id (Phase 3)
          user_id: "00000000-0000-0000-0000-000000000000",
          title: body.title,
          content: body.content ?? null,
          priority: (body.priority ?? "medium") as TaskPriority,
          start_date: toDate(body.start_date),
          end_date: toDate(body.end_date),
          due_date: toDate(body.due_date),
          estimated_minutes: body.estimated_minutes ?? null,
        })
        .returning();
      return c.json(task, 201);
    })
    .get("/", async (c) => {
      const { status, priority, due, q } = c.req.query();
      const conditions = [];

      if (status) conditions.push(eq(tasks.status, status as TaskStatus));
      if (priority) conditions.push(eq(tasks.priority, priority as TaskPriority));
      if (due === "today") {
        const start = new Date(); start.setHours(0, 0, 0, 0);
        const end = new Date(); end.setHours(23, 59, 59, 999);
        conditions.push(gte(tasks.due_date, start), lte(tasks.due_date, end));
      } else if (due === "week") {
        const start = new Date();
        const end = new Date(); end.setDate(end.getDate() + 7);
        conditions.push(gte(tasks.due_date, start), lte(tasks.due_date, end));
      } else if (due) {
        conditions.push(gte(tasks.due_date, new Date(due)));
      }
      if (q) conditions.push(or(ilike(tasks.title, `%${q}%`), ilike(tasks.content, `%${q}%`)));

      const rows = await db
        .select()
        .from(tasks)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(tasks.created_at);

      return c.json(rows);
    })
    .get("/:id", async (c) => {
      const id = c.req.param("id");
      const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
      if (!task) return c.json({ error: "Not found" }, 404);
      return c.json(task);
    })
    .patch("/:id", zValidator("json", updateSchema), async (c) => {
      const id = c.req.param("id");
      const body = c.req.valid("json");

      const updates: Record<string, unknown> = { updated_at: new Date() };
      if (body.title !== undefined) updates.title = body.title;
      if (body.content !== undefined) updates.content = body.content;
      if (body.status !== undefined) updates.status = body.status;
      if (body.priority !== undefined) updates.priority = body.priority;
      if (body.start_date !== undefined) updates.start_date = toDate(body.start_date);
      if (body.end_date !== undefined) updates.end_date = toDate(body.end_date);
      if (body.due_date !== undefined) updates.due_date = toDate(body.due_date);
      if (body.estimated_minutes !== undefined) updates.estimated_minutes = body.estimated_minutes;

      const [task] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
      if (!task) return c.json({ error: "Not found" }, 404);
      return c.json(task);
    })
    .post("/:id/done", async (c) => {
      const id = c.req.param("id");
      const [task] = await db
        .update(tasks)
        .set({ status: "done", updated_at: new Date() })
        .where(eq(tasks.id, id))
        .returning();
      if (!task) return c.json({ error: "Not found" }, 404);
      return c.json(task);
    })
    .delete("/:id", async (c) => {
      const id = c.req.param("id");
      const [task] = await db
        .update(tasks)
        .set({ status: "cancelled", updated_at: new Date() })
        .where(eq(tasks.id, id))
        .returning();
      if (!task) return c.json({ error: "Not found" }, 404);
      return c.json(task);
    })
    .get("/:id/relations", async (c) => {
      const id = c.req.param("id");
      const rows = await db
        .select()
        .from(taskRelations)
        .where(or(eq(taskRelations.source_id, id), eq(taskRelations.target_id, id)));
      return c.json(rows);
    })
    .post("/:id/relations", zValidator("json", relationSchema), async (c) => {
      const source_id = c.req.param("id");
      const { target_id, type } = c.req.valid("json");
      const [relation] = await db
        .insert(taskRelations)
        .values({ source_id, target_id, type })
        .returning();
      return c.json(relation, 201);
    })
    .delete("/:id/relations/:relationId", async (c) => {
      const relationId = c.req.param("relationId");
      const [relation] = await db
        .delete(taskRelations)
        .where(eq(taskRelations.id, relationId))
        .returning();
      if (!relation) return c.json({ error: "Not found" }, 404);
      return c.json(relation);
    });
}
