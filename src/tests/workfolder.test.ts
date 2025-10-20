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
} from "./setup";
import mongoose from "mongoose";

describe("POST /api/workspace/:account/workfolder", () => {
  let userId: string;
  let token: string;
  let workspaceId: string;
  let account: string;

  beforeAll(async () => {
    await connectDatabase();
    const res = await setupTestWorkspace(userData, workspaceData);

    userId = res.userId;
    token = res.token;
    workspaceId = res.workspaceId;
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
  let userId: string;
  let token: string;
  let workspaceId: string;
  let account: string;

  beforeAll(async () => {
    await connectDatabase();
    const res = await setupTestWorkspace(userData, workspaceData);
    userId = res.userId;
    token = res.token;
    workspaceId = res.workspaceId;
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
