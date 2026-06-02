import { models, model, Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
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
      unique: true,
    },
    image: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordTokenExpires: {
      type: Date,
      default: null,
    },
    rateLimitCount: {
      type: Number,
      default: 0,
    },
    rateLimitReset: {
      type: Date,
      default: null,
    },
    confirmationToken: {
      type: String,
      default: null,
    },
    confirmationTokenExpires: {
      type: Date,
      default: null,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },
    bio: { type: String, default: "" },
  },
  { timestamps: true },
);

const User = models.User || model("User", UserSchema);
export default User;
