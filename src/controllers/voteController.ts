import type { Request, Response, NextFunction } from "express";
import userModel from "../models/userModel.js";
import voteModel from "../models/voteModel.js";
import resultModel from "../models/resultModel.js";
import workspaceController from "./workspaceController.js";
import workspaceModel from "../models/workspaceModel.js";

const voteController = {
  getWorkspaceVoteByWorkspaceAccount: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // const userId = req.user?._id as string;
      const { account } = req.params;

      const workspace = await workspaceController.fetchWorkspaceByAccount(
        account as string
      );

      if (!workspace)
        return res.status(404).json({
          OK: false,
          message: "Workspace not found",
        });

      const workspaceId = workspace._id;

      const votes = await voteModel.find({ workspaceId }).lean();

      return res.status(200).json({
        OK: true,
        votes,
      });
    } catch (error) {
      return res.status(500).json({
        OK: false,
        message: error,
      });
    }
  },
  getVoteById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { voteId } = req.params;

      const vote = voteModel.findById({ _id: voteId });
      if (!vote)
        return res.status(404).json({
          OK: false,
          message: "Vote not found",
        });
    } catch (error) {
      return res.status(500).json({
        OK: false,
        message: error,
      });
    }
  },
  createVote: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, creatorId, workspaceId, options, dueDate } = req.body;

      const vote = await voteModel.create({
        title,
        creatorId,
        workspaceId,
        options,
        dueDate,
      });

      return res.status(201).json({
        OK: true,
        vote,
      });
    } catch (error) {
      return res.status(500).json({
        OK: false,
        message: error,
      });
    }
  },
  updateVoteById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { voteId } = req.params;
      const { title, options } = req.body;

      const vote = await voteModel.findById({ _id: voteId });
      if (!vote)
        return res.status(404).json({
          OK: false,
          message: "Vote not found",
        });

      vote.title = title;
      vote.options = options;

      await vote.save();
      return res.status(200).json({ OK: true, vote });
    } catch (error) {
      return res.status(500).json({
        OK: false,
        message: error,
      });
    }
  },
  deleteVoteById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { voteId } = req.params;

      const vote = await voteModel.findById({ _id: voteId });
      if (!vote)
        return res.status(404).json({
          OK: false,
          message: "Vote not found",
        });

      await vote.deleteOne();

      return res
        .status(200)
        .json({ OK: true, message: "Vote deleted successfully" });
    } catch (error) {
      return res.status(500).json({
        OK: false,
        message: error,
      });
    }
  },

  submitVoteResult: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { voteId, userId, option } = req.body;

      const isAlreadyVoted = await resultModel.find({
        where: {
          voteId,
          userId,
        },
      });
      if (isAlreadyVoted)
        return res.status(200).json({
          OK: false,
          message: "Already voted",
        });

      const result = await resultModel.create({
        voteId,
        userId,
        option,
      });

      return res.status(201).json({
        OK: true,
        result,
      });
    } catch (error) {
      return res.status(500).json({
        OK: false,
        message: error,
      });
    }
  },
  updateVoteResultById: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { resultId } = req.params;
      const { option } = req.body;

      const result = await resultModel.findById({ resultId });
      if (!result)
        return res.status(404).json({
          OK: false,
          message: "Result not found",
        });

      const userId = req.user?._id.toString();
      const voterId = result.userId;
      if (userId !== voterId)
        return res.status(403).json({
          OK: false,
          message: "Permission denied",
        });
      await result.save();

      return res.status(200).json({
        OK: true,
        result,
      });
    } catch (error) {
      return res.status(500).json({
        OK: false,
        message: error,
      });
    }
  },
  getResultsForVotebyVoteId: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { voteId } = req.params;
      const vote = await voteModel.findById({ _id: voteId });
      if (!vote)
        return res.status(404).json({
          OK: false,
          message: "Vote not found",
        });

      const results = await resultModel.aggregate([
        { $match: { voteId: vote._id } },
        {
          $group: {
            _id: "$option",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            option: "$_id",
            count: 1,
          },
        },
      ]);

      return res.status(200).json({ OK: true, results });
    } catch (error) {
      return res.status(500).json({
        OK: false,
        message: error,
      });
    }
  },
};

export default voteController;
