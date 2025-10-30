import express from "express";
const router = express.Router({ mergeParams: true });

import workspaceController from "../../controllers/workspaceController";

router.delete("/:userId", workspaceController.removeMemberFromWorkspace);
router.patch(
  "/:userId/member-status",
  workspaceController.updateMemberStatusInWorkspace
);
router.patch("/title", workspaceController.updateWorkspaceTitleByAccount);
router.patch("/slack-url", workspaceController.updateWorkspaceSlackByAccount);
router.delete("", workspaceController.deleteWorkspaceByAccount);

export default router;
