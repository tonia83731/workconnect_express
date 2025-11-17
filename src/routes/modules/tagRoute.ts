import express from "express";
const router = express.Router();

import tagController from "../../controllers/tagController";

router.post("", tagController.createTag);
router.get("", tagController.getTagsByWorkspaceAccount);
router.delete("/:tagId", tagController.deleteTagById);

export default router;