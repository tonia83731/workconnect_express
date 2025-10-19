import express from "express";
const router = express.Router({ mergeParams: true });

import todoController from "../../controllers/todoController";

router.post("", todoController.createTodo);
router.get("/:todoId", todoController.getTodoById);
router.put("/:todoId", todoController.updateTodoById);
router.delete("/:todoId", todoController.deleteTodoById);
router.patch("/:todoId/order", todoController.updateTodoFolderAndOrder);
export default router;
