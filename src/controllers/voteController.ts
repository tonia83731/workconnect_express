import type { Request, Response, NextFunction } from "express";
import voteModel from "../models/voteModel.js";
import resultModel from "../models/resultModel.js";
import workspaceController from "./workspaceController.js";
import workspaceModel from "../models/workspaceModel.js";
import { handleError } from "../helpers/errorHelpers.js";

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
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
      });
    }
  },
  getVoteById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { voteId } = req.params;

      const vote = await voteModel.findById(voteId).lean();
      if (!vote)
        return res.status(404).json({
          OK: false,
          message: "Vote not found",
        });

      return res.status(200).json({
        OK: true,
        vote,
      });
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
      });
    }
  },
  createVote: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { account } = req.params;
      const workspace = await workspaceModel.findOne({ account });
      const workspaceId = workspace?._id.toString();

      const { title, creatorId, options, dueDate } = req.body;

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
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
      });
    }
  },
  updateVoteById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { voteId } = req.params;
      const { title, options, dueDate } = req.body;

      const vote = await voteModel.findById({ _id: voteId });
      if (!vote)
        return res.status(404).json({
          OK: false,
          message: "Vote not found",
        });

      vote.title = title || vote.title;
      vote.options = options || vote.options;
      vote.dueDate = dueDate || vote.dueDate;

      await vote.save();
      return res.status(200).json({ OK: true, vote });
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
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
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
      });
    }
  },

  submitVoteResult: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { account } = req.params;
      const { voteId, userId, option } = req.body;
      const workspace = await workspaceModel.findOne({ account });
      const workspaceId = workspace?._id.toString();

      const isAlreadyVoted = await resultModel.find({
        where: {
          voteId,
          userId,
        },
      });

      if (isAlreadyVoted.length > 0)
        return res.status(200).json({
          OK: false,
          message: "Already voted",
        });

      const result = await resultModel.create({
        workspaceId,
        voteId,
        userId,
        option,
      });

      return res.status(201).json({
        OK: true,
        result,
      });
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
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

      const result = await resultModel.findById(resultId);
      if (!result)
        return res.status(404).json({
          OK: false,
          message: "Result not found",
        });

      const userId = req.user?._id.toString();
      const voterId = result.userId.toString();

      if (userId !== voterId)
        return res.status(403).json({
          OK: false,
          message: "Permission denied",
        });

      result.option = option;
      await result.save();

      return res.status(200).json({
        OK: true,
        result,
      });
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
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
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
      });
    }
  },
};

export default voteController;
