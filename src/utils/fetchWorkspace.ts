import workspaceModel from "../models/workspaceModel";
import { IWorkspace, IWorkspaceMember } from "../type";

export const fetchWorkspaceByAccount = async (
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
    } catch (error: unknown) {
      throw new Error(
        (error instanceof Error && error.message) ||
          "Failed to fetch workspace by account"
      );
    }
  }

export const fetchWorkspaceMemberById = async (
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
    } catch (error: unknown) {
    throw new Error(
        (error instanceof Error && error.message) || "Failed to check member"
    );
    }
}