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
  clearDatabase,
  setupTestWorkspace,
} from "./setup";

let userId: string;
let token: string;
let workspaceId: string;
let account: string;
let folderId: string;

beforeAll(async () => {
  await connectDatabase();
});

afterAll(async () => {
  await disconnectDatabase();
});

beforeEach(async () => {
  const res = await setupTestWorkspace(userData, workspaceData);

  userId = res.userId;
  token = res.token;
  workspaceId = res.workspaceId;
  account = res.account;
});

afterEach(async () => {
  await clearDatabase();
});

describe("POST /api/workspace/:account/tag", () => {
  test("Successfully creates a new tag", async () => {
    const tagData = {
      workspaceId,
      title: "Test",
      color: "#FFFFFF",
    };

    const res = await request(app)
      .post(`/api/workspace/${account}/tag`)
      .set("Authorization", `Bearer ${token}`)
      .send(tagData);

    // console.log(res.status, res.body.data._id);

    expect(res.status).toBe(201);
  });
});

describe("GET /api/workspace/:account/tag/:tagId", () => {
  test("Successfully get tag by id", async () => {
    const tagData = {
      workspaceId,
      title: "Test",
      color: "#FFFFFF",
    };

    const tag = await request(app)
      .post(`/api/workspace/${account}/tag`)
      .set("Authorization", `Bearer ${token}`)
      .send(tagData);

    const tagId = tag.body.data._id;

    const res = await request(app)
      .get(`/api/workspace/${account}/tag/${tagId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  test("Return 404 if tag not found", async () => {
    const tagData = {
      workspaceId,
      title: "Test",
      color: "#FFFFFF",
    };

    const tag = await request(app)
      .post(`/api/workspace/${account}/tag`)
      .set("Authorization", `Bearer ${token}`)
      .send(tagData);

    const tagId = tag.body.data._id;

    await request(app)
      .delete(`/api/workspace/${account}/tag/${tagId}`)
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .get(`/api/workspace/${account}/tag/${tagId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/workspace/:account/tag/:tagId", () => {
  test("Successfully delete tag by id", async () => {
    const tagData = {
      workspaceId,
      title: "Test",
      color: "#FFFFFF",
    };

    const tag = await request(app)
      .post(`/api/workspace/${account}/tag`)
      .set("Authorization", `Bearer ${token}`)
      .send(tagData);

    const tagId = tag.body.data._id;

    const res = await request(app)
      .delete(`/api/workspace/${account}/tag/${tagId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});

describe("GET /api/workspace/:account/tag", () => {
  test("Successfully get tag by workspace account", async () => {
    const tagData = {
      workspaceId,
      title: "Test",
      color: "#FFFFFF",
    };

    await request(app)
      .post(`/api/workspace/${account}/tag`)
      .set("Authorization", `Bearer ${token}`)
      .send(tagData);

    const res = await request(app)
      .get(`/api/workspace/${account}/tag`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });
});
