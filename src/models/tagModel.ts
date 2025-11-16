import mongoose from "mongoose";
const Schema = mongoose.Schema;

const tagSchema = new Schema(
    {
        workspaceId: {
            type: Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
        },
        title: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 50,
        },
        color: {
            type: String,
            required: true,
            default: "#3B82F6"
        }
    },
    {
        timestamps: true,
    }
)


const tagModel = mongoose.model("Tag", tagSchema);
export default tagModel;
