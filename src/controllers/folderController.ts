import type { Request, Response } from "express";
import workspaceModel from "../models/workspaceModel";
import workfolderModel from "../models/workfolderModel";
import todoModel from "../models/todoModel";
import { handleError } from "../helpers/errorHelpers";
import { fetchWorkspaceByAccount } from "../utils/fetchWorkspace";

const folderController = {
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

      const workspace = await fetchWorkspaceByAccount(
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
}
export default folderController;