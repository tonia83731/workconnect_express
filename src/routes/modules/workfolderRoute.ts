import express from "express";
const router = express.Router({ mergeParams: true });

import folderController from "../../controllers/folderController";
import todoController from "../../controllers/todoController";

router.patch("/:folderId/title", folderController.updateFolderNameById);
router.get("/:folderId/todos", todoController.getTodoByFolderId)
router.get("/:folderId", folderController.getFoldersById)
router.delete("/:folderId", folderController.deleteFolderById);
router.get("", folderController.getFoldersByWorkspaceAccount);
router.post("", folderController.createFolder);
export default router;
