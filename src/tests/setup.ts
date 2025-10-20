import mongoose, { ObjectId } from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app";
import { TodoChecklistType } from "../type";

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

export type TodoDataType = {
  title: string;
  workfolderId: string;
  status: "pending" | "processing" | "completed";
  note: string;
  deadline?: Date; // optional if not set
  checklists?: TodoChecklistType[]; // optional
  assignments?: {
    userId: ObjectId | string;
  }[]; // optional
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

export const workfolderData = {
  title: "Test folder",
};

export const todoData: TodoDataType = {
  title: "Finish Project Report",
  workfolderId: "",
  status: "pending",
  note: "Compile all the sections and finalize the formatting before submission.",
  deadline: new Date("2025-10-31T17:00:00"), // example deadline
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
      isChecked: false,
      text: "Analyze results",
    },
    {
      isChecked: false,
      text: "Proofread document",
    },
  ],
  assignments: [],
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

export const setupTestFolder = async (
  userData: UserDataType,
  workspaceData: WorkspaceDataType,
  workfolderData: {
    title: string;
  }
) => {
  const workspaceRes = await setupTestWorkspace(userData, workspaceData);

  const res = await request(app)
    .post(`/api/workspace/${workspaceRes.account}/workfolder`)
    .set("Authorization", `Bearer ${workspaceRes.token}`)
    .send(workfolderData);

  return {
    ...workspaceRes,
    folderId: res.body.folder._id,
  };
};
