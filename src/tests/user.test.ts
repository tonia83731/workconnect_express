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

describe("PUT /api/user/:userId", () => {
  let userId: string;
  let token: string;
  beforeEach(async () => {
    await connectDatabase();
    const res = await setupTestUser(userData);
    userId = res.userId;
    token = res.token;
  });
  afterEach(async () => {
    await disconnectDatabase();
  });

  test("Successfully updates one or more fields", async () => {
    const res = await request(app)
      .put(`/api/user/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstname: "Test2",
        lastname: "Update",
        email: "test2@example.com",
      });

    expect(res.status).toBe(200);
    expect(res.body.user.firstname).toBe("Test2");
    expect(res.body.user.lastname).toBe("Update");
    expect(res.body.user.email).toBe("test2@example.com");
  });
  test("Correctly handles null or undefined inputs", async () => {
    const res = await request(app)
      .put(`/api/user/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstname: "Test2",
      });

    expect(res.status).toBe(200);
    expect(res.body.user.firstname).toBe("Test2");
    expect(res.body.user.lastname).toBe("User");
    expect(res.body.user.email).toBe("test@example.com");
  });
  test("Returns 403 Forbidden if user is not updating themselves", async () => {
    const user2Data = {
      firstname: "TestTest",
      lastname: "User2",
      email: "test.test@example.com",
      password: "test1234",
    };
    const user2 = await setupTestUser(user2Data);

    const res = await request(app)
      .put(`/api/user/${userId}`)
      .set("Authorization", `Bearer ${user2.token}`)
      .send({
        firstname: "Test2",
      });

    expect(res.status).toBe(403);
    expect(res.body.OK).toBe(false);
  });
});

describe("PATCH /api/user/:userId/password", () => {
  let userId: string;
  let token: string;
  beforeAll(async () => {
    await connectDatabase();
    const res = await setupTestUser(userData);
    userId = res.userId;
    token = res.token;
  });
  afterAll(async () => {
    await disconnectDatabase();
  });

  test("Successfully updates the password", async () => {
    const res = await request(app)
      .patch(`/api/user/${userId}/password`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        originalPassword: "1234",
        newPassword: "Test1234",
      });

    expect(res.status).toBe(200);
    expect(res.body.OK).toBe(true);
  });
  test("Returns 403 Forbidden if user tries to update another user's password", async () => {
    const user2Data = {
      firstname: "TestTest",
      lastname: "User2",
      email: "test.test@example.com",
      password: "test1234",
    };
    const user2 = await setupTestUser(user2Data);
    const res = await request(app)
      .put(`/api/user/${userId}`)
      .set("Authorization", `Bearer ${user2.token}`)
      .send({
        originalPassword: "1234",
        newPassword: "Test1234",
      });

    expect(res.status).toBe(403);
  });
  test("Returns 400 Bad Request if the original password is incorrect", async () => {
    const res = await request(app)
      .patch(`/api/user/${userId}/password`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        originalPassword: "12345",
        newPassword: "Test1234",
      });
    expect(res.status).toBe(400);
  });
});

// describe("DELETE /api/user/:userId", () => {})

describe("POST /api/user/:userId/workspace", () => {
  let userId: string;
  let token: string;
  beforeAll(async () => {
    await connectDatabase();
    const res = await setupTestUser(userData);
    userId = res.userId;
    token = res.token;
  });
  afterAll(async () => {
    await disconnectDatabase();
  });

  test("Should create a new workspace successfully", async () => {
    const res = await request(app)
      .post(`/api/user/${userId}/workspace`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test workspace",
        account: "test-account",
      });

    expect(res.status).toBe(201);
    expect(res.body.OK).toBe(true);
  });
  test("Should not allow duplicate account", async () => {
    await request(app)
      .post(`/api/user/${userId}/workspace`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test workspace",
        account: "test-account",
      });

    const res = await request(app)
      .post(`/api/user/${userId}/workspace`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test workspace 2",
        account: "test-account",
      });

    expect(res.status).toBe(400);
    expect(res.body.OK).toBe(false);
  });
});

describe("POST /api/user/:userId/workspace/:account", () => {
  //   let userId: string;
  //   let token: string;
  //   let workspaceId: string;
  let account: string;

  let user2Id: string;
  let token2: string;

  beforeEach(async () => {
    await connectDatabase();
    const res = await setupTestWorkspace(userData, workspaceData);

    const user2Res = await setupTestUser({
      firstname: "Enter",
      lastname: "User",
      email: "enter.u@example.com",
      password: "123",
    });

    // userId = res.userId;
    // token = res.token;
    // workspaceId = res.workspaceId;
    account = res.account;

    user2Id = user2Res.userId;
    token2 = user2Res.token;
  });
  afterEach(async () => {
    await disconnectDatabase();
  });
  test("Successfully adds a new user request to join", async () => {
    const res = await request(app)
      .post(`/api/user/${user2Id}/workspace/${account}`)
      .set("Authorization", `Bearer ${token2}`);

    expect(res.status).toBe(200);
    expect(
      res.body.workspace.members.some((m: any) => m.userId === user2Id)
    ).toBe(true);
  });
  test("User is already a member (pending)", async () => {
    await request(app)
      .post(`/api/user/${user2Id}/workspace/${account}`)
      .set("Authorization", `Bearer ${token2}`);
    const res = await request(app)
      .post(`/api/user/${user2Id}/workspace/${account}`)
      .set("Authorization", `Bearer ${token2}`);

    expect(res.status).toBe(200);
    expect(res.body.OK).toBe(false);
  });
});
