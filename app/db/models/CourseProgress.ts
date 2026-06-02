import { models, model, Schema } from "mongoose";

const CourseProgressSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    completedLessons: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
    progressPercentage: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    lastAccessedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);
CourseProgressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
const CourseProgress =
  models.CourseProgress || model("CourseProgress", CourseProgressSchema);
export default CourseProgress;
