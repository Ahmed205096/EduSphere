import { models, model, Schema } from "mongoose";

const QuizSchema = new Schema(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    questions: [
      {
        questionText: { type: String, required: true, trim: true },
        options: [{ type: String, required: true }],
        correctOptionIndex: { type: Number, required: true },
        points: { type: Number, required: true, default: 1 },
      },
    ],
    passingScore: { type: Number, required: true, default: 50 },
  },
  { timestamps: true },
);

const Quiz = models.Quiz || model("Quiz", QuizSchema);
export default Quiz;
