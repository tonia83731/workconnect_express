import { JwtPayload } from "jsonwebtoken";
import type { Interface } from "readline";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export interface IUser {
  _id: string | ObjectId;
  firstName: string;
  lastname: string;
  email: string;
  password: string;
  platformMode: "dark" | "light"
}

export interface IWorkspace {
  _id: string | ObjectId;
  title: string;
  account: string;
  members: WorkspaceMemberType[];
  slackUrl: string;
}

export interface IWorkspaceMember {
  userId: string;
  isAdmin: boolean;
  isPending: boolean;
}

export interface IWorkfolder {
  _id: string | ObjectId;
  title: string;
  workspaceId: string | ObjectId;
  order: number;
}

export interface ITodo {
  _id: string | ObjectId;
  title: string;
  workspaceId: string | ObjectId;
  workfolderId: string | ObjectId;
  status: "pending" | "processing" | "completed";
  note?: string; // optional if not required
  deadline?: Date; // optional if not set
  checklists?: TodoChecklistType[]; // optional
  assignments?: string[] | ObjectId[]; // optional
  order: number;
}

export type TodoChecklistType = {
  isChecked: boolean;
  text: string;
};

export interface IVote {
  _id: string | ObjectId;
  title: string;
  creatorId: string | ObjectId;
  workspaceId: string | ObjectId;
  options: string[];
  dueDate: Date;
}

export interface IResult {
  _id: string | ObjectId;
  voteId: string | ObjectId;
  userId: string | ObjectId;
  option: string;
}
