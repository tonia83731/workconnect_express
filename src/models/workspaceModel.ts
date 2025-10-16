import mongoose from "mongoose";
const Schema = mongoose.Schema;

const workspaceSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },
    account: {
      type: String,
      required: true,
      unique: true,
    },
    members: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        isAdmin: {
          type: Boolean,
          default: false,
        },
        isPending: {
          type: Boolean,
          default: true,
        },
      },
    ],
    slackUrl: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

const workspaceModel = mongoose.model("Workspace", workspaceSchema);
export default workspaceModel;
