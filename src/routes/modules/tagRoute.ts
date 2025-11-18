import express from "express";
import tagController from "../../controllers/tagController";
const router = express.Router({ mergeParams: true });

router.get("/:tagId", tagController.getTagById);
router.delete("/:tagId", tagController.deleteTagById);
router.get("", tagController.getTagsByWorkspaceAccount);
router.post("", tagController.createTag);

export default router;
