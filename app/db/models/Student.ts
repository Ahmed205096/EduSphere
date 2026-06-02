import { models, model, Schema } from "mongoose";

const StudentSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    enrolledCourses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Enrollment",
      }, 
    ],
    completedQuizzes: [
      {
        type: Schema.Types.ObjectId,
        ref: "QuizSubmission",
      },
    ],
    certificates: [
      {
        type: Schema.Types.ObjectId,
        ref: "Certificate",
      },
    ],
    activities: [
      {
        type: {
          type: String,
          enum: ["lesson_completed", "quiz_submitted", "course_enrolled"],
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

export const Student = models.Student || model("Student", StudentSchema);
