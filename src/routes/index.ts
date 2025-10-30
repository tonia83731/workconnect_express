import express from "express";
const router = express.Router();

import authRouter from "./modules/authRoute";
import userRouter from "./modules/userRoute";
import workspaceRouter from "./modules/workspaceRoute";
import workspaceAuthRouter from "./modules/workspaceAuthRoute";
import workfolderRouter from "./modules/workfolderRoute";
import todoRouter from "./modules/todoRoute";
import voteRouter from "./modules/voteRoute";
import voteAuthRouter from "./modules/voteAuthRoute";
import resultRouter from "./modules/resultRoute";

import {
  authenticated,
  workspaceAdminAuthenticated,
  workspaceAuthenticated,
} from "../middleware/apiAuth";

router.use("/auth", authRouter);
router.use("/user", authenticated, userRouter);
router.use(
  "/workspace/admin/:account",
  authenticated,
  workspaceAdminAuthenticated,
  workspaceAuthRouter
);
router.use(
  "/workspace/:account",
  authenticated,
  workspaceAuthenticated,
  workspaceRouter
);

router.use(
  "/workspace/:account/workfolder",
  authenticated,
  workspaceAuthenticated,
  workfolderRouter
);

router.use(
  "/workspace/:account/todo",
  authenticated,
  workspaceAuthenticated,
  todoRouter
);
router.use(
  "/workspace/:account/vote",
  authenticated,
  workspaceAuthenticated,
  voteRouter
);
router.use(
  "/workspace/:account/vote/admin",
  authenticated,
  workspaceAdminAuthenticated,
  voteAuthRouter
);
router.use(
  "/workspace/:account/vote/result",
  authenticated,
  workspaceAuthenticated,
  resultRouter
);

export default router;
