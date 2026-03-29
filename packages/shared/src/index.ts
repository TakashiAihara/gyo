export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskRelationType = "blocks" | "subtask" | "related";

export type User = {
  id: string;
  google_id: string;
  email: string;
  display_name: string;
  created_at: string;
};

export type Task = {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  start_date: string | null; // ISO 8601
  end_date: string | null;
  due_date: string | null;
  estimated_minutes: number | null;
  created_at: string;
  updated_at: string;
};

export type TaskRelation = {
  id: string;
  source_id: string;
  target_id: string;
  type: TaskRelationType;
  created_at: string;
};

export type Reminder = {
  id: string;
  task_id: string;
  remind_at: string;
  notified_at: string | null;
  created_at: string;
};

export type CreateTaskInput = Pick<Task, "title"> &
  Partial<Pick<Task, "content" | "priority" | "start_date" | "end_date" | "due_date" | "estimated_minutes">>;

export type UpdateTaskInput = Partial<
  Pick<Task, "title" | "content" | "status" | "priority" | "start_date" | "end_date" | "due_date" | "estimated_minutes">
>;
