import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { createApp } from "../app";
import { createTestDb } from "../db/test-utils";
import { users } from "../db/schema";
import type { AppDB } from "../db/client";
import type { Task, TaskRelation } from "@gyo/shared";

const TEST_USER_ID = "00000000-0000-0000-0000-000000000000";

let db: AppDB;
let app: ReturnType<typeof createApp>;

beforeAll(async () => {
  db = await createTestDb();
  // seed a test user (tasks FK requires user_id)
  await db.insert(users).values({
    id: TEST_USER_ID,
    google_id: "test-google-id",
    email: "test@example.com",
    display_name: "Test User",
  });
  app = createApp({ db });
});

async function post(path: string, body: unknown) {
  return app.request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function patch(path: string, body: unknown) {
  return app.request(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/v1/tasks", () => {
  it("タスクを作成できる", async () => {
    const res = await post("/api/v1/tasks", { title: "テストタスク" });
    expect(res.status).toBe(201);
    const task = await res.json() as Task;
    expect(task.title).toBe("テストタスク");
    expect(task.status).toBe("todo");
    expect(task.priority).toBe("medium");
  });

  it("オプションフィールドを指定して作成できる", async () => {
    const res = await post("/api/v1/tasks", {
      title: "期限付きタスク",
      priority: "high",
      due_date: "2026-04-01T00:00:00+09:00",
      estimated_minutes: 60,
    });
    expect(res.status).toBe(201);
    const task = await res.json() as Task;
    expect(task.priority).toBe("high");
    expect(task.due_date).not.toBeNull();
    expect(task.estimated_minutes).toBe(60);
  });

  it("title が空だと 400 を返す", async () => {
    const res = await post("/api/v1/tasks", { title: "" });
    expect(res.status).toBe(400);
  });

  it("title がないと 400 を返す", async () => {
    const res = await post("/api/v1/tasks", {});
    expect(res.status).toBe(400);
  });
});

describe("GET /api/v1/tasks", () => {
  it("タスク一覧を取得できる", async () => {
    const res = await app.request("/api/v1/tasks");
    expect(res.status).toBe(200);
    const taskList = await res.json() as Task[];
    expect(Array.isArray(taskList)).toBe(true);
  });

  it("status フィルターが効く", async () => {
    await post("/api/v1/tasks", { title: "フィルターテスト用" });
    const res = await app.request("/api/v1/tasks?status=todo");
    expect(res.status).toBe(200);
    const taskList = await res.json() as Task[];
    expect(taskList.every((t) => t.status === "todo")).toBe(true);
  });
});

describe("GET /api/v1/tasks/:id", () => {
  it("タスクを取得できる", async () => {
    const created = await (await post("/api/v1/tasks", { title: "取得テスト" })).json() as Task;
    const res = await app.request(`/api/v1/tasks/${created.id}`);
    expect(res.status).toBe(200);
    const task = await res.json() as Task;
    expect(task.id).toBe(created.id);
  });

  it("存在しない ID は 404 を返す", async () => {
    const res = await app.request("/api/v1/tasks/00000000-0000-0000-0000-000000000001");
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/v1/tasks/:id", () => {
  it("タスクを更新できる", async () => {
    const created = await (await post("/api/v1/tasks", { title: "更新前" })).json() as Task;
    const res = await patch(`/api/v1/tasks/${created.id}`, { title: "更新後", priority: "urgent" });
    expect(res.status).toBe(200);
    const task = await res.json() as Task;
    expect(task.title).toBe("更新後");
    expect(task.priority).toBe("urgent");
  });
});

describe("POST /api/v1/tasks/:id/done", () => {
  it("タスクを完了にできる", async () => {
    const created = await (await post("/api/v1/tasks", { title: "完了テスト" })).json() as Task;
    const res = await post(`/api/v1/tasks/${created.id}/done`, {});
    expect(res.status).toBe(200);
    const task = await res.json() as Task;
    expect(task.status).toBe("done");
  });
});

describe("DELETE /api/v1/tasks/:id", () => {
  it("タスクをキャンセル（ソフトデリート）できる", async () => {
    const created = await (await post("/api/v1/tasks", { title: "削除テスト" })).json() as Task;
    const res = await app.request(`/api/v1/tasks/${created.id}`, { method: "DELETE" });
    expect(res.status).toBe(200);
    const task = await res.json() as Task;
    expect(task.status).toBe("cancelled");
  });
});

describe("Task Relations", () => {
  it("タスク間のリレーションを作成・取得・削除できる", async () => {
    const taskA = await (await post("/api/v1/tasks", { title: "タスクA" })).json() as Task;
    const taskB = await (await post("/api/v1/tasks", { title: "タスクB" })).json() as Task;

    // 作成
    const createRes = await post(`/api/v1/tasks/${taskA.id}/relations`, {
      target_id: taskB.id,
      type: "blocks",
    });
    expect(createRes.status).toBe(201);
    const relation = await createRes.json() as TaskRelation;
    expect(relation.type).toBe("blocks");

    // 取得
    const getRes = await app.request(`/api/v1/tasks/${taskA.id}/relations`);
    expect(getRes.status).toBe(200);
    const relations = await getRes.json() as TaskRelation[];
    expect(relations.some((r) => r.id === relation.id)).toBe(true);

    // 削除
    const delRes = await app.request(`/api/v1/tasks/${taskA.id}/relations/${relation.id}`, {
      method: "DELETE",
    });
    expect(delRes.status).toBe(200);
  });

  it("無効な relation type は 400 を返す", async () => {
    const taskA = await (await post("/api/v1/tasks", { title: "タスクA2" })).json() as Task;
    const taskB = await (await post("/api/v1/tasks", { title: "タスクB2" })).json() as Task;
    const res = await post(`/api/v1/tasks/${taskA.id}/relations`, {
      target_id: taskB.id,
      type: "invalid_type",
    });
    expect(res.status).toBe(400);
  });
});
