import type { Request, Response, NextFunction } from "express";
import workspaceModel from "../models/workspaceModel.js";
import type { IWorkspaceMember, IWorkspace } from "../type.js";
import todoModel from "../models/todoModel.js";
import workfolderModel from "../models/workfolderModel.js";
import voteModel from "../models/voteModel.js";
import resultModel from "../models/resultModel.js";
import { handleError } from "../helpers/errorHelpers.js";

const workspaceController = {
  getWorkspaceByUserId: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId } = req.params;
      const workspaces = await workspaceModel
        .find({ members: { $elemMatch: { userId } } })
        .lean();

      return res.status(200).json({
        OK: true,
        workspaces,
      });
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
      });
    }
  },
  createWorkspace: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.userId as string;
      const { title, account } = req.body;

      const isAccountExisted = await workspaceModel.findOne({ account });
      if (isAccountExisted !== null) {
        return res.status(400).json({
          OK: false,
          message: "Account already exists",
        });
      }

      const member: IWorkspaceMember = {
        userId,
        isAdmin: true,
        isPending: false,
      };

      const workspace = await workspaceModel.create({
        title,
        account,
        members: [member],
      });

      return res.status(201).json({
        OK: true,
        workspace,
      });
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
      });
    }
  },

  getWorkspaceByAccount: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { account } = req.params;

      const workspace = await workspaceController.fetchWorkspaceByAccount(
        account as string
      );

      return res.status(200).json({
        OK: true,
        workspace,
      });
    } catch (error) {
      return res.status(500).json({
        message: error,
      });
    }
  },

  updateWorkspaceTitleByAccount: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { account } = req.params;
      const { title } = req.body;

      const workspace = await workspaceModel.findOneAndUpdate(
        { account },
        { $set: { title } },
        { new: true } // return AFTER update data
      );

      return res.status(200).json({ OK: true, workspace });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message(),
      });
    }
  },
  updateWorkspaceSlackByAccount: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { account } = req.params;
      const { slackUrl } = req.body;

      const workspace = await workspaceModel.findOneAndUpdate(
        { account },
        { $set: { slackUrl } },
        { new: true } // return AFTER update data
      );

      return res.status(200).json({ OK: true, workspace });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message(),
      });
    }
  },
  deleteWorkspaceByAccount: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { account } = req.params;

      const workspace = await workspaceModel.findOne({ account });
      if (!workspace) {
        return res.status(404).json({
          OK: false,
          message: "Workspace not found.",
        });
      }

      const workspaceId = workspace?._id.toString();

      await Promise.all([
        todoModel.deleteMany({ workspaceId }),
        workfolderModel.deleteMany({ workspaceId }),
        voteModel.deleteMany({ workspaceId }),
        resultModel.deleteMany({ workspaceId }),
      ]);

      await workspace.deleteOne({ account });

      return res
        .status(200)
        .json({ OK: true, message: "Workspace and related items are deleted" });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message(),
      });
    }
  },
  userAskEnterWorkspace: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId, account } = req.params;

      const member = await workspaceController.fetchWorkspaceMemberById(
        account as string,
        userId as string
      );
      // console.log(member)
      if (member !== null) {
        return res.status(200).json({
          OK: false,
          message: "User is already member",
        });
      }

      const newMember: IWorkspaceMember = {
        userId: userId as string,
        isAdmin: false,
        isPending: true,
      };

      const workspace = await workspaceModel.findOneAndUpdate(
        { account },
        { $push: { members: newMember } },
        { new: true }
      );

      return res.status(200).json({ OK: true, workspace });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message(),
      });
    }
  },

  removeMemberFromWorkspace: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId, account } = req.params;

      if (
        !(await workspaceController.fetchWorkspaceMemberById(
          account as string,
          userId as string
        ))
      ) {
        return res.status(404).json({ OK: false, message: "Member not found" });
      }

      const workspace = await workspaceModel.findOneAndUpdate(
        { account },
        { $pull: { members: { userId } } },
        { new: true }
      );

      await todoModel.updateMany(
        { workspaceId: workspace?._id.toString() },
        { $pull: { assignments: { userId } } }
      );
      await resultModel.deleteMany({ workspaceId: workspace?._id.toString() });

      return res.status(200).json({ OK: true, workspace });
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
      });
    }
  },
  updateMemberStatusInWorkspace: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId, account } = req.params;
      const { isAdmin, isPending } = req.body;

      let workspace;

      if (isAdmin) {
        workspace = await workspaceModel.findOneAndUpdate(
          { account, "members.userId": userId },
          {
            $set: {
              "members.$.isAdmin": isAdmin,
            },
          },
          { new: true }
        );
      }

      if (isPending) {
        workspace = await workspaceModel.findOneAndUpdate(
          { account, "members.userId": userId },
          {
            $set: {
              "members.$.isPending": isPending,
            },
          },
          { new: true }
        );
      }

      return res.status(200).json({ OK: true, workspace });
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
      });
    }
  }, // isAdmin, isPending

  // ==========================================

  fetchWorkspaceByAccount: async (
    workspaceAccount: string
  ): Promise<IWorkspace | null> => {
    try {
      const workspace = await workspaceModel
        .findOne({
          account: workspaceAccount,
        })
        .lean();

      if (!workspace) return null;
      return workspace as IWorkspace;
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch workspace by account");
    }
  },

  fetchWorkspaceMemberById: async (
    workspaceAccount: string,
    userId: string
  ): Promise<IWorkspaceMember | null> => {
    try {
      const workspace = await workspaceModel
        .findOne(
          { account: workspaceAccount, "members.userId": userId },
          { "members.$": 1 } // only return the matching member
        )
        .lean();

      if (!workspace || !workspace.members || workspace.members.length === 0)
        return null;

      return workspace.members[0] as IWorkspaceMember;
    } catch (error: any) {
      throw new Error(error.message || "Failed to check member");
    }
  },
};

export default workspaceController;
