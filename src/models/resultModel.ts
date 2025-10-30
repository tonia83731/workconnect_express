import mongoose from "mongoose";
const Schema = mongoose.Schema;

const resultSchema = new Schema({
  workspaceId: {
    type: Schema.Types.ObjectId,
    ref: "Workspace",
    required: true,
  },
  voteId: {
    type: Schema.Types.ObjectId,
    ref: "Vote",
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  option: {
    type: String,
    required: true,
  },
});

const resultModel = mongoose.model("Result", resultSchema);
export default resultModel;
