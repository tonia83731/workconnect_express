import type { Request, Response, NextFunction } from "express";
import userModel from "../models/userModel.js";
import workspaceModel from "../models/workspaceModel.js";
import workfolderModel from "../models/workfolderModel.js";
import todoModel from "../models/todoModel.js";
import workspaceController from "./workspaceController.js";

const todoController = {
  getFoldersByWorkspaceAccount: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { account } = req.params;
      const workspace = await workspaceModel.findOne({ account });
      if (!workspace)
        return res.status(400).json({
          OK: false,
          message: "Workspace not found",
        });

      const workspaceId = workspace._id.toString();

      const folders = await workfolderModel
        .find({workspaceId})
        .sort({ order: 1 })
        .lean();

      const foldersWithTodos = await Promise.all(
        folders.map(async (folder) => {
          const todos = await todoModel
            .find({ workfolderId: folder._id })
            .sort({ order: 1 }) // order todos if needed
            .lean();

          return {
            ...folder,
            todos,
          };
        })
      );
      return res.status(200).json({
        OK: true,
        data: foldersWithTodos,
      });
    } catch (error) {
      return res.status(500).json({
        OK: false,
        message: error,
      });
    }
  }, // folders + todos
  createFolder: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { account } = req.params;
      const { title } = req.body;

      const workspace = await workspaceController.fetchWorkspaceByAccount(
        account as string
      );
      const workspaceId = workspace && workspace._id;

      const folderCount = await workfolderModel.countDocuments({ workspaceId });
      const folder = await workfolderModel.create({
        title,
        workspaceId,
        order: folderCount + 1,
      });

      return res.status(201).json({
        OK: true,
        folder,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        OK: false,
        message: error,
      });
    }
  },
  updateFolderNameById: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { folderId } = req.params;
      const { title } = req.body;

      const folder = await workfolderModel.findById(folderId);
      if (!folder)
        return res.status(404).json({
          OK: false,
          message: "Folder not found",
        });

      folder.title = title;
      await folder.save();
      return res.status(200).json({
        OK: true,
        message: "Folder title updated",
      });
    } catch (error) {
      return res.status(500).json({
        OK: false,
        message: error,
      });
    }
  },
  deleteFolderById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { folderId } = req.params;
      const folder = await workfolderModel.findById(folderId);
      if (!folder)
        return res.status(404).json({
          OK: false,
          message: "Folder not found",
        });

      await folder.deleteOne();
      return res.status(200).json({
        OK: true,
        message: "Folder deleted",
      });
    } catch (error) {
      return res.status(500).json({
        OK: false,
        message: error,
      });
    }
  },

  getTodoById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { todoId } = req.params;
      const todo = await todoModel.findById(todoId);

      if (!todo)
        return res.status(404).json({
          OK: false,
          message: "Todo not found",
        });

      return res.status(200).json({
        OK: true,
        todo,
      });
    } catch (error) {
      return res.status(500).json({
        OK: false,
        message: error,
      });
    }
  },
  createTodo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        title,
        workspaceId,
        workfolderId,
        status,
        note,
        deadline,
        checklists,
        assignments,
        order,
      } = req.body;

      const todo = await todoModel.create({
        title,
        workspaceId,
        workfolderId,
        status,
        note,
        deadline,
        checklists,
        assignments,
        order,
      });
      return res.status(201).json({
        OK: true,
        todo,
      });
    } catch (error) {
      return res.status(500).json({
        OK: false,
        message: error,
      });
    }
  },
  updateTodoById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { todoId } = req.params;
      const {
        title,
        workspaceId,
        workfolderId,
        status,
        note,
        deadline,
        checklists,
        assignments,
        order,
      } = req.body;

      const todo = await todoModel.findById(todoId);
      if (!todo)
        return res.status(404).json({
          OK: false,
          message: "Todo not found",
        });
      // Basic fields
      todo.title = title ?? todo.title;
      todo.workspaceId = workspaceId ?? todo.workspaceId;
      todo.workfolderId = workfolderId ?? todo.workfolderId;
      todo.status = status ?? todo.status;
      todo.note = note ?? todo.note;
      todo.deadline = deadline ?? todo.deadline;
      todo.order = order ?? todo.order;

      if (checklists && Array.isArray(checklists)) {
        // Remove all existing checklists and add new ones
        todo.checklists.splice(0, todo.checklists.length); // clear
        checklists.forEach((item) => {
          todo.checklists.push({
            text: item.text,
            isChecked: !!item.isChecked,
          });
        });
      }

      if (assignments && Array.isArray(assignments)) {
        todo.assignments.splice(0, todo.assignments.length); // clear
        assignments.forEach((item) => {
          todo.assignments.push({
            userId: item.userId,
          });
        });
      }

      await todo.save();

      return res.status(200).json({
        OK: true,
        todo,
      });
    } catch (error) {
      return res.status(500).json({
        OK: false,
        message: error,
      });
    }
  },
  deleteTodoById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { todoId } = req.params;
      const todo = await todoModel.findById(todoId);
      if (!todo)
        return res.status(404).json({
          OK: false,
          message: "Todo not found",
        });
      await todo.deleteOne();
      return res.status(200).json({
        OK: true,
        message: "Todo deleted",
      });
    } catch (error) {
      return res.status(500).json({
        OK: false,
        message: error,
      });
    }
  },
  updateTodoFolderAndOrder: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { todoId } = req.params;
      const { workfolderId: newFolderId, order: newOrder } = req.body;

      // 1️⃣ Find the todo
      const todo = await todoModel.findById(todoId);
      if (!todo) {
        return res.status(404).json({
          OK: false,
          message: "Todo not found",
        });
      }

      const oldFolderId = todo.workfolderId.toString();
      const oldOrder = todo.order;

      // 2️⃣ If folder is the same, just reorder
      if (oldFolderId === newFolderId) {
        // Shift other todos in the same folder
        if (newOrder > oldOrder) {
          await todoModel.updateMany(
            {
              workfolderId: oldFolderId,
              order: { $gt: oldOrder, $lte: newOrder },
            },
            { $inc: { order: -1 } }
          );
        } else if (newOrder < oldOrder) {
          await todoModel.updateMany(
            {
              workfolderId: oldFolderId,
              order: { $gte: newOrder, $lt: oldOrder },
            },
            { $inc: { order: 1 } }
          );
        }

        todo.order = newOrder;
        await todo.save();
      } else {
        // 3️⃣ Folder changed
        // Decrement orders in old folder
        await todoModel.updateMany(
          { workfolderId: oldFolderId, order: { $gt: oldOrder } },
          { $inc: { order: -1 } }
        );

        // Increment orders in new folder
        await todoModel.updateMany(
          { workfolderId: newFolderId, order: { $gte: newOrder } },
          { $inc: { order: 1 } }
        );

        // Update the todo
        todo.workfolderId = newFolderId;
        todo.order = newOrder;
        await todo.save();
      }

      return res.status(200).json({
        OK: true,
        data: todo,
        message: "Todo folder and order updated successfully",
      });
    } catch (error) {
      return res.status(500).json({
        OK: false,
        message: error,
      });
    }
  },
};

export default todoController;
