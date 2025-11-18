import type { Request, Response } from "express";
import workspaceModel from "../models/workspaceModel";
import tagModel from "../models/tagModel";
import todoModel from "../models/todoModel";
import { handleError } from "../helpers/errorHelpers";

const tagController = {
  getTagsByWorkspaceAccount: async (req: Request, res: Response) => {
    try {
      const { account } = req.params;
      const workspace = await workspaceModel.findOne({ account });
      if (!workspace)
        return res.status(404).json({
          OK: false,
          message: "Workspace not found",
        });

      const workspaceId = workspace._id;

      const tags = await tagModel.find({ workspaceId });
      return res.status(200).json({
        OK: true,
        data: tags,
      });
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
      });
    }
  },
  getTagById: async (req: Request, res: Response) => {
    try {
      const { tagId } = req.params;
      const tag = await tagModel.findById(tagId).lean();
      if (!tag) {
        return res.status(404).json({
          OK: false,
          message: "Tag not found",
        });
      }
      return res.status(200).json({
        OK: true,
        data: tag,
      });
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
      });
    }
  },
  createTag: async (req: Request, res: Response) => {
    try {
      const { account } = req.params;
      const { title, color } = req.body;

      const workspace = await workspaceModel.findOne({ account });
      if (!workspace)
        return res.status(404).json({
          OK: false,
          message: "Workspace not found",
        });

      const workspaceId = workspace._id;

      const tag = await tagModel.create({
        workspaceId,
        title,
        color,
      });

      return res.status(201).json({
        OK: true,
        data: tag,
      });
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
      });
    }
  },
  deleteTagById: async (req: Request, res: Response) => {
    try {
      const { tagId } = req.params;

      const tag = await tagModel.findByIdAndDelete(tagId);
      if (!tag) {
        return res.status(404).json({
          OK: false,
          message: "Tag not found",
        });
      }

      // remove tag from todos
      await todoModel.updateMany({ tagId }, { $set: { tagId: null } });

      return res.status(200).json({
        OK: true,
        message: "Tag delete successfully",
      });
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
      });
    }
  },
};

export default tagController;
