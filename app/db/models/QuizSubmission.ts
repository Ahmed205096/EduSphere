import mongoose, { models, model, Schema } from "mongoose";

const QuizSubmissionSchema = new Schema(
  {
    quizId: {
      type: mongoose.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    studentId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: [
      {
        questionId: {
          type: mongoose.Types.ObjectId,
          required: true,
        },
        selectedOptionIndex: { type: Number, required: true },
        points: { type: Number, required: true, default: 1 },
        isCorrect: { type: Boolean },
      },
    ],
    score: { type: Number, default: 0 },
    status: { type: String, enum: ["passed", "failed"], required: true },
    totalPoints: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const QuizSubmission =
  models.QuizSubmission || model("QuizSubmission", QuizSubmissionSchema);
export default QuizSubmission;
