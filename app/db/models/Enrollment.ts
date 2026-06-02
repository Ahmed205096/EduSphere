import { models, model, Schema } from "mongoose";

const EnrollmentSchema = new Schema(
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
    enrolledAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    paymentId: {
      type: String,
      default: null,
    },
    pricePaid: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

EnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

const Enrollment = models.Enrollment || model("Enrollment", EnrollmentSchema);
export default Enrollment;
