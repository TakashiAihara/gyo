export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type Task = {
  id: string;
  title: string;
  content: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null; // ISO 8601
  estimated_minutes: number | null;
  obsidian_note: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateTaskInput = Pick<Task, "title"> &
  Partial<Pick<Task, "content" | "priority" | "due_date" | "obsidian_note">>;

export type UpdateTaskInput = Partial<
  Pick<Task, "title" | "content" | "status" | "priority" | "due_date" | "estimated_minutes" | "obsidian_note">
>;
