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

describe("GET /api/workspace/:account", () => {
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

  test("Successfully get workspace info", async () => {
    const res = await request(app)
      .get(`/api/workspace/${account}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.workspace.account).toBe(account);
  });
  test("Returns 403 Permission Denied if not workspace member", async () => {
    const user2Res = await setupTestUser({
      firstname: "Non User",
      lastname: "Test",
      email: "nuser.t@example.com",
      password: "123",
    });

    const res = await request(app)
      .get(`/api/workspace/${account}`)
      .set("Authorization", `Bearer ${user2Res.token}`);

    expect(res.status).toBe(403);
  });
});

describe("PATCH /api/workspace/admin/:account/title", () => {
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

  test("Successfully update workspace title", async () => {
    const res = await request(app)
      .patch(`/api/workspace/admin/${account}/title`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Update workspace",
      });

    expect(res.status).toBe(200);
    expect(res.body.workspace.title).toBe("Update workspace");
  });
  test("Returns 403 Permission Denied if not workspace admin", async () => {
    const user2Res = await setupTestUser({
      firstname: "Non User",
      lastname: "Test",
      email: "nuser.t@example.com",
      password: "123",
    });

    const res = await request(app)
      .patch(`/api/workspace/admin/${account}/title`)
      .set("Authorization", `Bearer ${user2Res.token}`)
      .send({
        title: "Update workspace",
      });

    expect(res.status).toBe(403);
  });
});

describe("PATCH /api/workspace/admin/:account/:userId/member-status", () => {
  let userId: string;
  let token: string;
  let workspaceId: string;
  let account: string;

  let user2Id: string;
  let token2: string;

  beforeAll(async () => {
    await connectDatabase();
    const res = await setupTestWorkspace(userData, workspaceData);

    const userRes = await setupTestUser({
      firstname: "Second",
      lastname: "User",
      email: "second.u@example.com",
      password: "123",
    });

    await request(app)
      .post(`/api/user/${userRes.userId}/workspace/${res.account}`)
      .set("Authorization", `Bearer ${userRes.token}`);

    userId = res.userId;
    token = res.token;
    workspaceId = res.workspaceId;
    account = res.account;

    user2Id = userRes.userId;
    token2 = userRes.token;
  });
  afterAll(async () => {
    await disconnectDatabase();
  });

  test("Update member pending status successfully", async () => {
    const res = await request(app)
      .patch(`/api/workspace/admin/${account}/${user2Id}/member-status`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        isPending: false,
      });

    const member = res.body.workspace.members.find(
      (m: any) => m.userId === user2Id
    );

    expect(res.status).toBe(200);
    expect(member).not.toBeNull();
    expect(member.isPending).toBe(false);
  });
  test("Update member admin status successfully", async () => {
    const res = await request(app)
      .patch(`/api/workspace/admin/${account}/${user2Id}/member-status`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        isAdmin: true,
      });

    const member = res.body.workspace.members.find(
      (m: any) => m.userId === user2Id
    );

    expect(res.status).toBe(200);
    expect(member).not.toBeNull();
    expect(member.isAdmin).toBe(true);
  });
  test("Update member both status successfully", async () => {
    const res = await request(app)
      .patch(`/api/workspace/admin/${account}/${user2Id}/member-status`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        isAdmin: true,
        isPending: false,
      });

    const member = res.body.workspace.members.find(
      (m: any) => m.userId === user2Id
    );

    expect(res.status).toBe(200);
    expect(member).not.toBeNull();
    expect(member.isPending).toBe(false);
    expect(member.isAdmin).toBe(true);
  });
});

describe("DELETE /api/workspace/admin/:account", () => {
  let userId: string;
  let token: string;
  let workspaceId: string;
  let account: string;

  let user2Id: string;
  let token2: string;

  beforeAll(async () => {
    await connectDatabase();
    const res = await setupTestWorkspace(userData, workspaceData);

    const userRes = await setupTestUser({
      firstname: "Second",
      lastname: "User",
      email: "second.u@example.com",
      password: "123",
    });

    userId = res.userId;
    token = res.token;
    workspaceId = res.workspaceId;
    account = res.account;

    user2Id = userRes.userId;
    token2 = userRes.token;
  });
  afterAll(async () => {
    await disconnectDatabase();
  });

  test("Remove member successfully", async () => {
    // request to enter workspace
    await request(app)
      .post(`/api/user/${user2Id}/workspace/${account}`)
      .set("Authorization", `Bearer ${token2}`);
    // approved user to join workspace
    await request(app)
      .patch(`/api/workspace/admin/${account}/${user2Id}/member-status`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        isAdmin: true,
        isPending: false,
      });

    const res = await request(app)
      .delete(`/api/workspace/admin/${account}/${user2Id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
  test("Return 404 if member not found", async () => {
    const res = await request(app)
      .delete(`/api/workspace/admin/${account}/${user2Id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
