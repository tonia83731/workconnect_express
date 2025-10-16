import express from "express";
const router = express.Router({ mergeParams: true });

import workspaceController from "../../controllers/workspaceController.js";

router.get("", workspaceController.getWorkspaceByAccount);

export default router;
