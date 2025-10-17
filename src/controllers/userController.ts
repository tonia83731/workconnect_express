import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import workspaceModel from "../models/workspaceModel.js";
import { isSelf } from "../helpers/authHelper.js";
import { handleError } from "../helpers/errorHelpers.js";

const userController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { firstname, lastname, email, password } = req.body;

      const isEmailExisted = await userModel.findOne({ email });
      if (isEmailExisted !== null) {
        return res.status(400).json({
          OK: false,
          message: "User already existed.",
        });
      }

      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);

      await userModel.create({
        firstname,
        lastname,
        email,
        password: hash,
      });
      return res.status(201).json({
        OK: true,
      });
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
      });
    }
  },
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const user = await userModel.findOne({ email });

      if (!user)
        return res.status(400).json({
          success: false,
          messsage: "Email或密碼錯誤",
        });

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid)
        return res.status(400).json({
          success: false,
          messsage: "Email或密碼錯誤",
        });

      const userJson = user.toJSON();
      const payload = {
        _id: userJson._id,
        email: userJson.email,
        platformMode: userJson.platformMode,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: "10h",
      });

      return res.status(200).json({
        success: true,
        data: {
          id: payload._id,
          token,
        },
      });
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
      });
    }
  },

  getUserById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const user = await userModel.findById(userId).select("-password");
      if (!user)
        return res.status(404).json({
          OK: false,
          message: "User not found",
        });

      return res.status(200).json({
        OK: true,
        user,
      });
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
      });
    }
  },
  updateUserById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { firstname, lastname, email } = req.body;
      const tokenUserId = req.user?._id.toString();
      const userId = req.params.userId as string;

      if (!isSelf(tokenUserId, userId))
        return res.status(403).json({
          OK: false,
          message: "Permission denied",
        });

      const user = await userModel.findOne({ _id: userId });
      if (!user)
        return res.status(404).json({
          OK: false,
          message: "User not found",
        });

      user.firstname = firstname ?? user.firstname;
      user.lastname = lastname ?? user.lastname;
      user.email = email ?? user.email;

      await user.save();

      return res.status(200).json({
        OK: true,
        user: {
          id: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          platforMode: user.platformMode,
        },
      });
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
      });
    }
  },
  updateUserPasswordById: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { originalPassword, newPassword } = req.body;

      const tokenUserId = req.user?._id.toString();
      const userId = req.params.userId as string;

      if (!isSelf(tokenUserId, userId))
        return res.status(403).json({
          OK: false,
          message: "Permission denied",
        });

      const user = await userModel.findOne({ _id: userId });
      if (!user)
        return res.status(404).json({
          OK: false,
          message: "User not found",
        });

      const isMatch = await bcrypt.compare(originalPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          OK: false,
          message: "Original password is incorrect",
        });
      }

      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(newPassword, salt);
      user.password = hash;

      await user.save();

      return res.status(200).json({
        OK: true,
        message: "Password updated successfully",
      });
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
      });
    }
  },
  updateUserPlatformModeById: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const tokenUserId = req.user?._id.toString();
      const userId = req.params.userId as string;

      if (!isSelf(tokenUserId, userId))
        return res.status(403).json({
          OK: false,
          message: "Permission denied",
        });

      const user = await userModel.findOne({ _id: userId });
      if (!user)
        return res.status(404).json({
          OK: false,
          message: "User not found",
        });

      user.platformMode = user.platformMode === "dark" ? "light" : "dark";
      await user.save();

      return res.status(200).json({
        OK: true,
        message: "Platform mode updated successfully",
      });
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
      });
    }
  },
  // need to be fix
  deleteUserById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenUserId = req.user?._id.toString();
      const userId = req.params.userId as string;

      if (!isSelf(tokenUserId, userId))
        return res.status(403).json({
          OK: false,
          message: "Permission denied",
        });

      const user = await userModel.findOne({ _id: userId });
      if (!user)
        return res.status(404).json({
          OK: false,
          message: "User not found",
        });

      // Delete user
      await user.deleteOne();

      // Remove user from all workspaces
      await workspaceModel.updateMany(
        { "members.userId": userId },
        { $pull: { members: { userId } } }
      );

      return res.status(200).json({
        OK: true,
        message: "User deleted successfully and removed from all workspaces",
      });
    } catch (error: unknown) {
      return res.status(500).json({
        OK: false,
        message: handleError(error),
      });
    }
  },
};

export default userController;
