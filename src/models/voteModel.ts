import mongoose from "mongoose";
const Schema = mongoose.Schema;

const voteSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    options: [
      {
        text: {
          type: String,
          required: true,
        },
      },
    ],
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const voteModel = mongoose.model("Vote", voteSchema);
export default voteModel;
