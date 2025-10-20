import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app";

let mongoServer: MongoMemoryServer;

export type UserDataType = {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
};

export type WorkspaceDataType = {
  title: string;
  account: string;
};

export const userData = {
  firstname: "Test",
  lastname: "User",
  email: "test@example.com",
  password: "1234",
};

export const workspaceData = {
  title: "Test workspace",
  account: "test-account",
};

export const connectDatabase = async () => {
  mongoServer = await MongoMemoryServer.create();

  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
};

export const disconnectDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};

export const setupTestUser = async (data: UserDataType) => {
  await request(app).post("/api/auth/register").send(data);

  const loginRes = await request(app).post("/api/auth/login").send({
    email: data.email,
    password: data.password,
  });

  return {
    userId: loginRes.body.data.id,
    token: loginRes.body.data.token,
  };
};

export const setupTestWorkspace = async (
  userData: UserDataType,
  workspaceData: WorkspaceDataType
) => {
  const userRes = await setupTestUser(userData);

  const workspaceRes = await request(app)
    .post(`/api/user/${userRes.userId}/workspace`)
    .set("Authorization", `Bearer ${userRes.token}`)
    .send(workspaceData);

  //   console.log(workspaceRes.body);

  return {
    userId: userRes.userId,
    token: userRes.token,
    workspaceId: workspaceRes.body.workspace.id,
    account: workspaceRes.body.workspace.account,
    // members: workspaceRes.body.workspace.members,
  };
};
