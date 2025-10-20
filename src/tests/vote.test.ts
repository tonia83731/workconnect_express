import request from "supertest";
import app from "../app";

import {
  connectDatabase,
  disconnectDatabase,
  setupTestUser,
  setupTestWorkspace,
  userData,
  workspaceData,
} from "./setup";

describe("POST /api/workspace/:account/vote", () => {
  let userId: string;
  let token: string;
  let workspaceId: string;
  let account: string;

  beforeEach(async () => {
    await connectDatabase();
    const res = await setupTestWorkspace(userData, workspaceData);
    userId = res.userId;
    token = res.token;
    workspaceId = res.workspaceId;
    account = res.account;
  });
  afterEach(async () => {
    await disconnectDatabase();
  });

  test("Successfully create vote", async () => {
    const res = await request(app)
      .post(`/api/workspace/${account}/vote`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test vote",
        creatorId: userId,
        workspaceId,
        options: [
          {
            text: "Option1",
          },
          {
            text: "Option2",
          },
          {
            text: "Option3",
          },
        ],
        dueDate: null,
      });

    expect(res.status).toBe(201);
  });
});

describe("PUT /api/workspace/:account/vote/:voteId", () => {
  let userId: string;
  let token: string;
  let workspaceId: string;
  let account: string;

  beforeEach(async () => {
    await connectDatabase();
    const res = await setupTestWorkspace(userData, workspaceData);
    userId = res.userId;
    token = res.token;
    workspaceId = res.workspaceId;
    account = res.account;
  });
  afterEach(async () => {
    await disconnectDatabase();
  });

  test("Successfully update vote", async () => {
    const res = await request(app)
      .post(`/api/workspace/${account}/vote`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test vote",
        creatorId: userId,
        workspaceId,
        options: [
          {
            text: "Option1",
          },
          {
            text: "Option2",
          },
          {
            text: "Option3",
          },
        ],
        dueDate: null,
      });
    const voteId = res.body.vote._id;
    const updateRes = await request(app)
      .put(`/api/workspace/${account}/vote/${voteId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test vote update",
        options: [
          {
            text: "Option1",
          },
          {
            text: "Option2",
          },
          {
            text: "Option3",
          },
        ],
        dueDate: new Date("2025-11-01T17:00:00"),
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.vote.title).toBe("Test vote update");
  });
});

describe("DELETE /api/workspace/:account/vote/admin/:voteId", () => {
  let userId: string;
  let token: string;
  let workspaceId: string;
  let account: string;

  beforeEach(async () => {
    await connectDatabase();
    const res = await setupTestWorkspace(userData, workspaceData);
    userId = res.userId;
    token = res.token;
    workspaceId = res.workspaceId;
    account = res.account;
  });
  afterEach(async () => {
    await disconnectDatabase();
  });

  test("Successfully delete vote", async () => {
    const res = await request(app)
      .post(`/api/workspace/${account}/vote`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test vote",
        creatorId: userId,
        workspaceId,
        options: [
          {
            text: "Option1",
          },
          {
            text: "Option2",
          },
          {
            text: "Option3",
          },
        ],
        dueDate: null,
      });
    const voteId = res.body.vote._id;
    await request(app)
      .delete(`/api/workspace/${account}/vote/admin/${voteId}`)
      .set("Authorization", `Bearer ${token}`);

    const voteRes = await request(app)
      .get(`/api/workspace/${account}/vote/admin/${voteId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(voteRes.status).toBe(404);
  });
});
