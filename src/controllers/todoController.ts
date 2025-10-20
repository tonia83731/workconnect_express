import type { Request, Response } from "express";
import workspaceModel from "../models/workspaceModel";
import workfolderModel from "../models/workfolderModel";
import todoModel from "../models/todoModel";
import workspaceController from "./workspaceController";
import { handleError } from "../helpers/errorHelpers";

const todoController = {
  getFoldersByWorkspaceAccount: async (
    req: Request,
    res: Response
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
        .find({ workspaceId })
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
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
      });
    }
  }, // folders + todos
  getFoldersById: async (req: Request, res: Response) => {
    try {
      const {folderId} = req.params
      const folder = await workfolderModel.findById(folderId)

      if (!folder) return res.status(404).json({
        OK: false,
        message: "Folder not found"
      })

      return res.status(200).json({
        OK: true,
        folder
    })
    }catch (error) {
      console.error(error);
      return res.status(500).json({
        OK: false,
        message: error,
      });
    }
  },
  createFolder: async (req: Request, res: Response) => {
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
    res: Response
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
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
      });
    }
  },
  deleteFolderById: async (req: Request, res: Response) => {
    try {
      const { folderId } = req.params;
      const folder = await workfolderModel.findById(folderId);
      if (!folder)
        return res.status(404).json({
          OK: false,
          message: "Folder not found",
        });

      await todoModel.deleteMany({ workfolderId: folderId });
      await folder.deleteOne();
      return res.status(200).json({
        OK: true,
        message: "Folder and related todo deleted",
      });
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
      });
    }
  },

  getTodoByFolderId: async (req: Request, res: Response) => {
    try {
      const {folderId} = req.params
      const todos = await todoModel.find({workfolderId: folderId})
      return res.status(200).json({
        OK: true,
        todos
      })
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
      });
    }
  },

  getTodoById: async (req: Request, res: Response) => {
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
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
      });
    }
  },
  createTodo: async (req: Request, res: Response) => {
    try {
      const { account } = req.params;
      const workspace = await workspaceModel.findOne({ account });
      if (!workspace)
        return res.status(404).json({
          OK: false,
          message: "Workspace not found.",
        });

      const {
        title,
        workfolderId,
        status,
        note,
        deadline,
        checklists,
        assignments,
      } = req.body;

      const countItems = await todoModel.countDocuments({
        workspaceId: workspace?._id.toString(),
        workfolderId,
      });

      const todo = await todoModel.create({
        title,
        workspaceId: workspace?._id.toString(),
        workfolderId,
        status,
        note,
        deadline,
        checklists,
        assignments,
        order: countItems + 1,
      });
      return res.status(201).json({
        OK: true,
        todo,
      });
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
      });
    }
  },
  updateTodoById: async (req: Request, res: Response) => {
    try {
      const { todoId } = req.params;
      const {
        title,
        workfolderId,
        status,
        note,
        deadline,
        checklists,
        assignments,
      } = req.body;

      const todo = await todoModel.findById(todoId);
      if (!todo)
        return res.status(404).json({
          OK: false,
          message: "Todo not found",
        });
      // Basic fields
      todo.title = title ?? todo.title;
      todo.workfolderId = workfolderId ?? todo.workfolderId;
      todo.status = status ?? todo.status;
      todo.note = note ?? todo.note;
      todo.deadline = deadline ?? todo.deadline;

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
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
      });
    }
  },
  deleteTodoById: async (req: Request, res: Response) => {
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
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
      });
    }
  },
  // need to be fix
  updateTodoFolderAndOrder: async (
    req: Request,
    res: Response
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
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
      });
    }
  },
};

export default todoController;
