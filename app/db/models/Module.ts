import { models, model, Schema } from "mongoose";

const moduleSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    order: { type: Number, required: true },
  },
  { timestamps: true },
);

const Module = models.Module || model("Module", moduleSchema);
export default Module;
