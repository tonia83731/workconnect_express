import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstname: {
      type: String,
      require: true
    },
    lastname: {
      type: String,
      require: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      unique: true,
      minlength: 4,
    },
    platformMode: {
      type: String,
      emun: ["dark", "light"],
      default: "light"
    }
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model("User", userSchema);
export default userModel;
