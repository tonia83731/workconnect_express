import request from "supertest";
import app from "../app";

import {
  connectDatabase,
  disconnectDatabase,
  setupTestUser,
  setupTestWorkspace,
  userData,
  workspaceData,
  workfolderData,
  setupTestFolder,
  todoData,
} from "./setup";
import mongoose from "mongoose";

describe("POST /api/workspace/:account/workfolder", () => {
  let token: string;
  let account: string;

  beforeAll(async () => {
    await connectDatabase();
    const res = await setupTestWorkspace(userData, workspaceData);

    token = res.token;
    account = res.account;
  });
  afterAll(async () => {
    await disconnectDatabase();
  });

  test("Successfully create folder", async () => {
    const res = await request(app)
      .post(`/api/workspace/${account}/workfolder`)
      .set("Authorization", `Bearer ${token}`)
      .send(workfolderData);

    expect(res.status).toBe(201);
  });
  test("Return 403 if not workspace member", async () => {
    const userRes = await setupTestUser({
      firstname: "Non User",
      lastname: "Test",
      email: "nuser.t@example.com",
      password: "123",
    });

    const res = await request(app)
      .post(`/api/workspace/${account}/workfolder`)
      .set("Authorization", `Bearer ${userRes.token}`)
      .send(workfolderData);

    expect(res.status).toBe(403);
  });
});

describe("PATCH /api/workspace/:account/workfolder/:folderId/title", () => {
  let token: string;
  let account: string;

  beforeAll(async () => {
    await connectDatabase();
    const res = await setupTestWorkspace(userData, workspaceData);
    token = res.token;
    account = res.account;
  });
  afterAll(async () => {
    await disconnectDatabase();
  });

  test("Successfully update folder title", async () => {
    const folderRes = await request(app)
      .post(`/api/workspace/${account}/workfolder`)
      .set("Authorization", `Bearer ${token}`)
      .send(workfolderData);

    const folderId = folderRes.body.folder._id;

    const res = await request(app)
      .patch(`/api/workspace/${account}/workfolder/${folderId}/title`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Update folder title",
      });

    expect(res.status).toBe(200);
  });
  test("Return 404 if folder not found", async () => {
    const fakeId = new mongoose.Types.ObjectId(); // valid but nonexistent
    const res = await request(app)
      .patch(`/api/workspace/${account}/workfolder/${fakeId}/title`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Update folder title",
      });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/workspace/:account/workfolder/:folderId", () => {
  let token: string;
  let account: string;
  let folderId: string

  beforeAll(async () => {
    await connectDatabase();
    const res = await setupTestFolder(userData, workspaceData, workfolderData);

    todoData.workfolderId = res.folderId;

    await request(app)
      .post(`/api/workspace/${account}/todo`)
      .set("Authorization", `Bearer ${token}`)
      .send(todoData);

    token = res.token;
    account = res.account;
    folderId = res.folderId
  });
  afterAll(async () => {
    await disconnectDatabase();
  });

  test("Successfully delete folder and related todo", async () => {
    await request(app).delete(`/api/workspace/${account}/workfolder/${folderId}`)
    .set("Authorization", `Bearer ${token}`)

    const folderRes = await request(app).get(`/api/workspace/${account}/workfolder/${folderId}`).set("Authorization", `Bearer ${token}`)
    const todoRes = await request(app).get(`/api/workspace/${account}/workfolder/${folderId}/todos`).set("Authorization", `Bearer ${token}`)

    expect(folderRes.status).toBe(404)
    expect(todoRes.body.todos.length).toBe(0)
  })
})