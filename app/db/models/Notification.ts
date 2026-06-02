import mongoose, { models, model, Schema } from "mongoose";

const NotificationSchema = new Schema(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "course_created",
        "course_enrolled",
        "lesson_added",
        "quiz_added",
        "quiz_submitted",
        "quiz_graded",
        "announcement",
        "reply_added",
      ],
      required: true,
    },

    message: { type: String, required: true },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    link: {
      type: String,
      required: true,
    },

    metadata: {
      courseId: { type: Schema.Types.ObjectId, ref: "Course" },
      quizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
      lessonId: { type: Schema.Types.ObjectId, ref: "Lesson" },
    },
  },
  {
    timestamps: true,
  },
);

NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

const Notification =
  models.Notification || model("Notification", NotificationSchema);
export default Notification;
