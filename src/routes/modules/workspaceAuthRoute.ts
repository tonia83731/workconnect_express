import express from "express";
const router = express.Router({ mergeParams: true });

import workspaceController from "../../controllers/workspaceController";

router.delete("/:userId", workspaceController.removeMemberFromWorkspace);
router.patch(
  "/:userId/member-status",
  workspaceController.updateMemberStatusInWorkspace
);
router.patch("/title", workspaceController.updateWorkspaceTitleByAccount);
router.patch(
  "/notifications",
  workspaceController.updateWorkspaceNotificationSettingsByAccount
);
router.delete("", workspaceController.deleteWorkspaceByAccount);

export default router;
