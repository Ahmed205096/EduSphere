import { models, model, Schema } from "mongoose";

const courseSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    thumbnailURL: { type: String, required: true },
    thumbnailKEY: { type: String, required: true },
    category: { type: String, required: true },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "suspended"],
      default: "draft",
    },
    instructorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    enrollmentCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

courseSchema.index({ title: "text", description: "text", category: "text" });
const Course = models.Course || model("Course", courseSchema);
export default Course;
