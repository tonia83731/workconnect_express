import express from "express";
const router = express.Router({ mergeParams: true });

import todoController from "../../controllers/todoController";

router.patch("/:folderId/title", todoController.updateFolderNameById);
router.get("/:folderId/todos", todoController.getTodoByFolderId)
router.get("/:folderId", todoController.getFoldersById)
router.delete("/:folderId", todoController.deleteFolderById);
router.get("", todoController.getFoldersByWorkspaceAccount);
router.post("", todoController.createFolder);
export default router;
