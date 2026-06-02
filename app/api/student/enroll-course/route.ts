import dbConnect from "@/app/db/dbConnect";
import Course from "@/app/db/models/Course";
import CourseProgress from "@/app/db/models/CourseProgress";
import Enrollment from "@/app/db/models/Enrollment";
import { Student } from "@/app/db/models/Student";
import customeAuth from "@/utils/customeAuth/customeAuth";
import { notifyCourseInstructor } from "@/utils/notifications/notifications";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

function isDuplicateKeyError(err: unknown) {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    err.code === 11000
  );
}

async function ensureEnrollmentState(
  studentId: mongoose.Types.ObjectId,
  courseId: mongoose.Types.ObjectId,
  enrollmentId: mongoose.Types.ObjectId,
) {
  await CourseProgress.updateOne(
    { studentId, courseId },
    {
      $setOnInsert: {
        studentId,
        courseId,
        completedLessons: [],
      },
    },
    { upsert: true },
  ).exec();

  await Student.findOneAndUpdate(
    { studentId },
    {
      $setOnInsert: { studentId },
      $addToSet: {
        enrolledCourses: enrollmentId,
      },
    },
    { new: true, runValidators: true, upsert: true },
  )
    .lean()
    .exec();
}

// POST: Enroll student for specific course
export const POST = async (req: NextRequest) => {
  try {
    let { courseId } = await req.json();
    const session = await customeAuth();
    if (!session || !session.user)
      return NextResponse.json("Bad request", { status: 401 });
    const studentId = new mongoose.Types.ObjectId(session?.user?.id);
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json("Bad request", { status: 400 });
    }
    courseId = new mongoose.Types.ObjectId(courseId);
    await dbConnect();
    const isEnrolled = await Enrollment.findOne({ courseId, studentId })
      .exec();
    if (isEnrolled) {
      await ensureEnrollmentState(studentId, courseId, isEnrolled._id);
      return NextResponse.json(isEnrolled, { status: 200 });
    }

    let enrollment;
    let createdEnrollment = false;
    try {
      enrollment = await Enrollment.create({
        studentId,
        courseId,
      });
      createdEnrollment = true;
    } catch (err) {
      if (!isDuplicateKeyError(err)) throw err;

      enrollment = await Enrollment.findOne({ courseId, studentId }).exec();
    }

    if (!enrollment || !enrollment._id) {
      return NextResponse.json("Failed to create enrollment", { status: 500 });
    }

    await ensureEnrollmentState(studentId, courseId, enrollment._id);

    if (createdEnrollment) {
      await Course.findByIdAndUpdate(courseId, {
        $inc: { enrollmentCount: 1 },
      }).exec();

      await notifyCourseInstructor(courseId, {
        type: "course_enrolled",
        message: `${session.user.name ?? "A student"} enrolled in your course.`,
        link: `/instructor/courses`,
        metadata: { courseId },
      });

      await Student.findOneAndUpdate(
        { studentId: studentId },
        {
          $push: {
            activities: { type: "course_enrolled" },
          },
        },
        { new: true, runValidators: true, upsert: true },
      )
        .lean()
        .exec();
    }
    return NextResponse.json(enrollment, {
      status: 200,
    });
  } catch (err) {
    console.log(err);

    return NextResponse.json("Internal server error", { status: 500 });
  }
};
