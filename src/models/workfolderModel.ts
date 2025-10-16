import mongoose from "mongoose";
const Schema = mongoose.Schema;

const workfolderSchema = new Schema(
  {
    title: {
      type: String,
      maxlength: 50,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const workfolderModel = mongoose.model("Workfolder", workfolderSchema);
export default workfolderModel;
