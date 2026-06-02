import dbConnect from "@/app/db/dbConnect";
import Course from "@/app/db/models/Course";
import Enrollment from "@/app/db/models/Enrollment";
import Notification from "@/app/db/models/Notification";
import User from "@/app/db/models/User";
import mongoose from "mongoose";

type NotificationType =
  | "course_created"
  | "course_enrolled"
  | "lesson_added"
  | "quiz_added"
  | "quiz_submitted"
  | "quiz_graded"
  | "announcement"
  | "reply_added";

type NotificationMetadata = {
  courseId?: mongoose.Types.ObjectId | string;
  quizId?: mongoose.Types.ObjectId | string;
  lessonId?: mongoose.Types.ObjectId | string;
};

type NotificationPayload = {
  recipientId: mongoose.Types.ObjectId | string;
  type: NotificationType;
  message: string;
  link: string;
  metadata?: NotificationMetadata;
};

export async function createNotification(payload: NotificationPayload) {
  await dbConnect();

  return Notification.create(payload);
}

export async function createNotifications(
  recipientIds: Array<mongoose.Types.ObjectId | string>,
  payload: Omit<NotificationPayload, "recipientId">,
) {
  const uniqueRecipientIds = Array.from(
    new Set(recipientIds.filter(Boolean).map((id) => String(id))),
  );

  if (uniqueRecipientIds.length === 0) return [];

  await dbConnect();

  return Notification.insertMany(
    uniqueRecipientIds.map((recipientId) => ({
      ...payload,
      recipientId,
    })),
    { ordered: false },
  );
}

export async function notifyEnrolledStudents(
  courseId: mongoose.Types.ObjectId | string,
  payload: Omit<NotificationPayload, "recipientId">,
) {
  await dbConnect();

  const enrollments = await Enrollment.find({ courseId })
    .select("studentId")
    .lean()
    .exec();

  return createNotifications(
    enrollments.map((enrollment) => enrollment.studentId),
    payload,
  );
}

export async function notifyAllStudents(
  payload: Omit<NotificationPayload, "recipientId">,
) {
  await dbConnect();

  const students = await User.find({ role: "student" }).select("_id").lean().exec();

  return createNotifications(
    students.map((student) => student._id),
    payload,
  );
}

export async function notifyCourseInstructor(
  courseId: mongoose.Types.ObjectId | string,
  payload: Omit<NotificationPayload, "recipientId">,
) {
  await dbConnect();

  const course = await Course.findById(courseId).select("instructorId").lean().exec();
  if (!course?.instructorId) return null;

  return createNotification({
    ...payload,
    recipientId: course.instructorId,
  });
}
