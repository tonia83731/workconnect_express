import request from "supertest";
import app from "../app";

import { connectDatabase, disconnectDatabase, userData } from "./setup";
// import userModel from "../models/userModel"

describe("POST /api/auth/register", () => {
  beforeAll(async () => {
    await connectDatabase();
  });
  afterAll(async () => {
    await disconnectDatabase();
  });

  test("Should create a new user and return 201 when all fields are valid", async () => {
    const res = await request(app).post("/api/auth/register").send(userData);

    expect(res.status).toBe(201);
  });
  test("Should return 400 if email already exists", async () => {
    await request(app).post("/api/auth/register").send(userData);
    const res = await request(app).post("/api/auth/register").send(userData);

    expect(res.status).toBe(400);
  });
  test("Should return 400 if required fields are missing", async () => {
    const res = await request(app).post("/api/auth/register").send({
      firstname: "Test",
      lastname: "User",
      email: "",
      password: "1234",
    });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  beforeAll(async () => {
    await connectDatabase();
    await request(app).post("/api/auth/register").send(userData);
  });
  afterAll(async () => {
    await disconnectDatabase();
  });
  test("Should return 200 and a JWT token when email and password are correct", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: userData.email,
      password: userData.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });
  test("Should return 400 if email or password is empty", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: userData.email,
      password: "",
    });
    expect(res.status).toBe(400);
  });
  test("Should return 400 if email or password incorrect", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: userData.email,
      password: "1111",
    });
    expect(res.status).toBe(400);
  });
});
