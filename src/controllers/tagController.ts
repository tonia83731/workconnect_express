import type { Request, Response } from "express";
import tagModel from "../models/tagModel";  
import { handleError } from "../helpers/errorHelpers";
import workspaceModel from "../models/workspaceModel";
import todoModel from "../models/todoModel";

const tagController = {
    getTagsByWorkspaceAccount: async (req: Request, res: Response) => {
        try {
            const { account } = req.params;
            const workspace = await workspaceModel.findOne({ account });
            if (!workspace)
                return res.status(400).json({
                OK: false,
                message: "Workspace not found",
                });

                const tags = await tagModel.find({ workspaceId: workspace._id }).lean();
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
    createTag: async (req: Request, res: Response) => {
        try {
            const { account } = req.params;
            const {title, color} = req.body
            const workspace = await workspaceModel.findOne({ account });
            if (!workspace)
                return res.status(400).json({
                OK: false,
                message: "Workspace not found",
            });
            const workspaceId = workspace._id;
            const tag = await tagModel.create({
                workspaceId,
                title,
                color
            });
            
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
    deleteTagById: async (req: Request, res: Response) => {
        try {
            const {tagId} = req.params
            
            await tagModel.findByIdAndDelete(tagId);
            await todoModel.updateMany(
                { tagId },
                {$set: { tagId: null }}
            )
            return res.status(200).json({
                OK: true,
                message: "Tag deleted successfully",
            });
        } catch (error: unknown) {
            return res.status(500).json({
                OK: false,
                message: handleError(error),
            });
        }

    }
};

export default tagController;