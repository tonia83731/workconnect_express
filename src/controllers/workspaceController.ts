import type { Request, Response } from "express";
import workspaceModel from "../models/workspaceModel";
import type { IWorkspaceMember, NotificationType } from "../type";
import todoModel from "../models/todoModel";
import workfolderModel from "../models/workfolderModel";
import voteModel from "../models/voteModel";
import resultModel from "../models/resultModel";
import { handleError } from "../helpers/errorHelpers";
import {
  fetchWorkspaceByAccount,
  fetchWorkspaceMemberById,
} from "../utils/fetchWorkspace";

const workspaceController = {
  getWorkspaceByUserId: async (req: Request, res: Response) => {
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
  createWorkspace: async (req: Request, res: Response) => {
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

  getWorkspaceByAccount: async (req: Request, res: Response) => {
    try {
      const { account } = req.params;
      const workspace = await fetchWorkspaceByAccount(account as string);

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

  updateWorkspaceTitleByAccount: async (req: Request, res: Response) => {
    try {
      const { account } = req.params;
      const { title } = req.body;

      const workspace = await workspaceModel.findOneAndUpdate(
        { account },
        { $set: { title } },
        { new: true } // return AFTER update data
      );

      return res.status(200).json({ OK: true, workspace });
    } catch (error: unknown) {
      return res.status(500).json({
        message: error instanceof Error && error.message,
      });
    }
  },

  updateWorkspaceNotificationSettingsByAccount: async (
    req: Request,
    res: Response
  ) => {
    try {
      const { account } = req.params;
      const { notification } = req.body;

      const workspace = await workspaceModel.findOne({
        account,
      });

      if (!workspace)
        return res.status(404).json({
          OK: false,
          message: "Workspace not found",
        });

      // if (notifications && typeof notifications === "object") {
      //   for (const channel in Object.keys(notifications)) {
      //     if (!workspace.notifications) return;
      //     if (
      //       !workspace.notifications[
      //         channel as keyof typeof workspace.notifications
      //       ]
      //     )
      //       return;

      //     const noti = workspace.notifications[
      //       channel as keyof typeof workspace.notifications
      //     ] as NotificationType;
      //     const input = notifications[channel];

      //     noti.enable = input.enable ?? noti.enable;
      //     noti.url = input.url ?? noti.url;
      //   }
      // }

      workspace.notification = notification;

      await workspace.save();
      return res.status(200).json({ OK: true, workspace });
    } catch (error: unknown) {
      return res.status(500).json({
        message: error instanceof Error && error.message,
      });
    }
  },

  deleteWorkspaceByAccount: async (req: Request, res: Response) => {
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
    } catch (error: unknown) {
      return res.status(500).json({
        message: error instanceof Error && error.message,
      });
    }
  },

  userAskEnterWorkspace: async (req: Request, res: Response) => {
    try {
      const { userId, account } = req.params;

      const member = await fetchWorkspaceMemberById(
        account as string,
        userId as string
      );
      // console.log(member)
      if (member !== null && !member.isPending) {
        return res.status(200).json({
          OK: false,
          message: "User is already member",
        });
      }

      if (member !== null && member.isPending) {
        return res.status(200).json({
          OK: false,
          message: "Please wait the admin to approve",
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
    } catch (error: unknown) {
      return res.status(500).json({
        message: error instanceof Error && error.message,
      });
    }
  },

  removeMemberFromWorkspace: async (req: Request, res: Response) => {
    try {
      const { userId, account } = req.params;

      if (
        !(await fetchWorkspaceMemberById(account as string, userId as string))
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

  updateMemberStatusInWorkspace: async (req: Request, res: Response) => {
    try {
      const { userId, account } = req.params;
      const { isAdmin, isPending } = req.body;

      let workspace;

      if (isAdmin !== undefined) {
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

      if (isPending !== undefined) {
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
};

export default workspaceController;
