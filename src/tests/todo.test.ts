import request from "supertest";
import app from "../app";

import {
  connectDatabase,
  disconnectDatabase,
  setupTestFolder,
  userData,
  workspaceData,
  workfolderData,
  todoData,
  setupTestUser,
} from "./setup";

describe("POST /api/workspace/:account/todo", () => {
  let userId: string;
  let token: string;
  let account: string;
  let folderId: string;

  beforeAll(async () => {
    await connectDatabase();
    const res = await setupTestFolder(userData, workspaceData, workfolderData);

    userId = res.userId;
    token = res.token;
    account = res.account;
    folderId = res.folderId;
  });
  afterAll(async () => {
    await disconnectDatabase();
  });

  test("Successfully creates a new todo", async () => {
    todoData.workfolderId = folderId;
    todoData.assignments = [{ userId }];

    const res = await request(app)
      .post(`/api/workspace/${account}/todo`)
      .set("Authorization", `Bearer ${token}`)
      .send(todoData);

    expect(res.status).toBe(201);
  });
});

describe("PUT /api/workspace/:account/todo/:todoId", () => {
  let userId: string;
  let token: string;
  let user2Id: string;
  let account: string;
  let folderId: string;
  let todoId: string;

  beforeAll(async () => {
    await connectDatabase();
    const userRes = await setupTestUser({
      firstname: "Non User",
      lastname: "Test",
      email: "nuser.t@example.com",
      password: "123",
    });
    const res = await setupTestFolder(userData, workspaceData, workfolderData);

    userId = res.userId;
    token = res.token;
    account = res.account;
    folderId = res.folderId;
    user2Id = userRes.userId;

    todoData.workfolderId = folderId;
    todoData.assignments = [{ userId }];

    const todoRes = await request(app)
      .post(`/api/workspace/${account}/todo`)
      .set("Authorization", `Bearer ${token}`)
      .send(todoData);
    todoId = todoRes.body.todo._id;
  });
  afterAll(async () => {
    await disconnectDatabase();
  });
  test("Successfully updates basic fields", async () => {
    const res = await request(app)
      .put(`/api/workspace/${account}/todo/${todoId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Finish Project Report Update",
        status: "processing",
        note: "Compile all the sections and finalize the formatting before submission. (Update)",
        deadline: new Date("2025-11-01T17:00:00"), // example deadline
      });
    expect(res.status).toBe(200);
  });
  test("Successfully replaces the checklists array", async () => {
    const res = await request(app)
      .put(`/api/workspace/${account}/todo/${todoId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        checklists: [
          {
            isChecked: false,
            text: "Write introduction",
          },
          {
            isChecked: true,
            text: "Collect data",
          },
          {
            isChecked: true,
            text: "Analyze results",
          },
          {
            isChecked: true,
            text: "Proofread document",
          },
          {
            isChecked: false,
            text: "Test checklist update",
          },
        ],
      });
    expect(res.status).toBe(200);
    expect(res.body.todo.checklists.length).toBe(5);
  });
  test("Successfully replaces the assignments array", async () => {
    const res = await request(app)
      .put(`/api/workspace/${account}/todo/${todoId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        assignments: [{ userId }, { userId: user2Id }],
      });
    expect(res.status).toBe(200);
    expect(res.body.todo.assignments.length).toBe(2);
  });
});

describe("DELETE /api/workspace/:account/todo/:todoId", () => {
  let userId: string;
  let token: string;
  let account: string;
  let folderId: string;

  beforeAll(async () => {
    await connectDatabase();
    const res = await setupTestFolder(userData, workspaceData, workfolderData);

    userId = res.userId;
    token = res.token;
    account = res.account;
    folderId = res.folderId;
  });
  afterAll(async () => {
    await disconnectDatabase();
  });
  test("Successfully deletes a todo", async () => {
    todoData.workfolderId = folderId;
    todoData.assignments = [{ userId }];

    const res = await request(app)
      .post(`/api/workspace/${account}/todo`)
      .set("Authorization", `Bearer ${token}`)
      .send(todoData);
    const todoId = res.body.todo._id;
    // console.log(todoId);
    await request(app)
      .delete(`/api/workspace/${account}/todo/${todoId}`)
      .set("Authorization", `Bearer ${token}`);
    const todoRes = await request(app)
      .get(`/api/workspace/${account}/todo/${todoId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(todoRes.status).toBe(404);
  });
});
