import { models, model, Schema } from "mongoose";

const lessonSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    moduleId: { type: Schema.Types.ObjectId, ref: "Module", required: true },
    title: { type: String, required: true },
    description: { type: String },
    videoURL: { type: String, default: null },
    videoKEY: { type: String, default: null },
    fileURL: { type: String, default: null },
    fileKEY: { type: String, default: null },
    duration: { type: Number, default: 0 },
    order: { type: Number, required: true },
    isPreview: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Lesson = models.Lesson || model("Lesson", lessonSchema);
export default Lesson;
