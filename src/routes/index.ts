import express from "express";
const router = express.Router();

import authRouter from "./modules/authRoute.js";
import userRouter from "./modules/userRoute.js";
import workspaceRouter from "./modules/workspaceRoute.js";
import workspaceAuthRouter from "./modules/workspaceAuthRoute.js";
import workfolderRouter from "./modules/workfolderRoute.js";
import todoRouter from "./modules/todoRoute.js";
import voteRouter from "./modules/voteRoute.js";
import voteAuthRouter from "./modules/voteAuthRoute.js";
import resultRouter from "./modules/resultRoute.js";

import {
  authenticated,
  workspaceAdminAuthenticated,
  workspaceAuthenticated,
} from "../middleware/apiAuth.js";

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

router.use("/workspace/:account/todo", authenticated, workspaceAuthenticated, todoRouter);
router.use("/workspace/:account/vote", authenticated, workspaceAuthenticated, voteRouter);
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
