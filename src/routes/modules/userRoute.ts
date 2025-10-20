import express from "express";
const router = express.Router();

import userController from "../../controllers/userController";
import workspaceController from "../../controllers/workspaceController";

router.post(
  "/:userId/workspace/:account",
  workspaceController.userAskEnterWorkspace
);
router.get("/:userId", userController.getUserById);
router.put("/:userId", userController.updateUserById);
router.patch("/:userId/password", userController.updateUserPasswordById);
router.patch("/:userId/platform-mode", userController.updateUserPlatformModeById);
router.delete("/:userId", userController.deleteUserById);

// router.post("/:userId/workspace/:account", workspaceController.userAskEnterWorkspace)
router.get("/:userId/workspace", workspaceController.getWorkspaceByUserId);
router.post("/:userId/workspace", workspaceController.createWorkspace);

export default router;
