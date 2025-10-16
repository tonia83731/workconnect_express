import express from "express";
const router = express.Router({ mergeParams: true });

import todoController from "../../controllers/todoController.js";

router.patch("/:folderId/title", todoController.updateFolderNameById);
router.delete("/:folderId", todoController.deleteFolderById);
router.get("", todoController.getFoldersByWorkspaceAccount);
router.post("", todoController.createFolder);
export default router;
