import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Active"],
      default: "Pending",
    },
    confirmationCode: {
      type: String,
      unique: true,
    },
    roles: {
      type: [String],
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
  },
  // This automatically gives us created date and updated date
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;
