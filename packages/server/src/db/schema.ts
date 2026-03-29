import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  google_id: text("google_id").notNull().unique(),
  email: text("email").notNull(),
  display_name: text("display_name").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content"),
  status: text("status").notNull().default("todo"),
  priority: text("priority").notNull().default("medium"),
  start_date: timestamp("start_date", { withTimezone: true }),
  end_date: timestamp("end_date", { withTimezone: true }),
  due_date: timestamp("due_date", { withTimezone: true }),
  estimated_minutes: integer("estimated_minutes"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const taskRelations = pgTable("task_relations", {
  id: uuid("id").primaryKey().defaultRandom(),
  source_id: uuid("source_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  target_id: uuid("target_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // "blocks" | "subtask" | "related"
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reminders = pgTable("reminders", {
  id: uuid("id").primaryKey().defaultRandom(),
  task_id: uuid("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  remind_at: timestamp("remind_at", { withTimezone: true }).notNull(),
  notified_at: timestamp("notified_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UserRow = typeof users.$inferSelect;
export type InsertUserRow = typeof users.$inferInsert;
export type TaskRow = typeof tasks.$inferSelect;
export type InsertTaskRow = typeof tasks.$inferInsert;
export type TaskRelationRow = typeof taskRelations.$inferSelect;
export type InsertTaskRelationRow = typeof taskRelations.$inferInsert;
export type ReminderRow = typeof reminders.$inferSelect;
export type InsertReminderRow = typeof reminders.$inferInsert;
