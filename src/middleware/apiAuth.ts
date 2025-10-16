import type { NextFunction, Request, Response } from "express";
import passport from "../config/passport.js";
import workspaceModel from "../models/workspaceModel.js";
import type { IUser } from "../type.js";

export const authenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    "jwt",
    { session: false },
    (err: any, user: IUser | null) => {
      if (err || !user) {
        return res.status(403).json({
          OK: false,
          message: "Unauthorized",
        });
      }

      req.user = user;
      next();
    }
  )(req, res, next);
};

export const workspaceAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?._id;
  const account = req.params.account as String;

  const workspace = await workspaceModel.findOne({ account }).lean();
  const isMember = workspace?.members.find(
    (m) => m.userId.toString() === userId.toString()
  );

  if (!isMember || (isMember && isMember.isPending)) {
    return res.status(403).json({
      OK: false,
      message: "Permission denied",
    });
  }

  return next();
};

export const workspaceAdminAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?._id;
  const account = req.params.account;

  const workspace = await workspaceModel.findOne({ account }).lean();
  const isAdmin = workspace?.members.find(
    (m) => m.userId.toString() === userId?.toString() && m.isAdmin
  );

  if (!isAdmin) {
    return res.status(403).json({
      OK: false,
      message: "Admin access required",
    });
  }

  next();
};
