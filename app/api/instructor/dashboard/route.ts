import dbConnect from "@/app/db/dbConnect";
import Course from "@/app/db/models/Course";
import CourseProgress from "@/app/db/models/CourseProgress";
import Enrollment from "@/app/db/models/Enrollment";
import Lesson from "@/app/db/models/Lesson";
import Quiz from "@/app/db/models/Quiz";
import QuizSubmission from "@/app/db/models/QuizSubmission";
import User from "@/app/db/models/User";
import customeAuth from "@/utils/customeAuth/customeAuth";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

function roundPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export const GET = async () => {
  try {
    const session = await customeAuth();
    if (!session || !["admin", "instructor"].includes(session.user.role)) {
      return NextResponse.json("Unauthorized", { status: 403 });
    }

    await dbConnect();

    const courseQuery =
      session.user.role === "admin"
        ? {}
        : { instructorId: new mongoose.Types.ObjectId(session.user.id) };

    const courses = await Course.find(courseQuery)
      .select("_id title status enrollmentCount")
      .lean()
      .exec();

    const courseIds = courses.map((course) => course._id);
    const activeCourses = courses.filter(
      (course) => course.status === "published",
    ).length;

    const [enrollments, progressRecords, lessonsCount, quizzes] = await Promise.all([
      Enrollment.find({ courseId: { $in: courseIds } })
        .select("studentId courseId enrolledAt createdAt")
        .populate({ path: "studentId", model: User, select: "name email image" })
        .populate({ path: "courseId", model: Course, select: "title" })
        .sort({ enrolledAt: -1, createdAt: -1 })
        .lean()
        .exec(),
      CourseProgress.find({ courseId: { $in: courseIds } })
        .select("studentId progressPercentage completedLessons lastAccessedAt")
        .lean()
        .exec(),
      Lesson.countDocuments({ courseId: { $in: courseIds } }).exec(),
      Quiz.find({ courseId: { $in: courseIds } }).select("_id").lean().exec(),
    ]);

    const quizIds = quizzes.map((quiz) => quiz._id);
    const quizSubmissions = await QuizSubmission.find({
      quizId: { $in: quizIds },
    })
      .select("status")
      .lean()
      .exec();

    const totalStudents = new Set(
      enrollments.map((enrollment) => String(enrollment.studentId?._id ?? enrollment.studentId)),
    ).size;
    const completedLessons = progressRecords.reduce(
      (sum, progress) => sum + (progress.completedLessons?.length ?? 0),
      0,
    );
    const averageProgress =
      progressRecords.length > 0
        ? progressRecords.reduce(
            (sum, progress) => sum + (progress.progressPercentage ?? 0),
            0,
          ) / progressRecords.length
        : 0;
    const passRate =
      quizSubmissions.length > 0
        ? (quizSubmissions.filter((submission) => submission.status === "passed")
            .length /
            quizSubmissions.length) *
          100
        : 0;
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const activeStudents =
      totalStudents > 0
        ? (new Set(
            progressRecords
              .filter(
                (progress) =>
                  progress.lastAccessedAt &&
                  new Date(progress.lastAccessedAt).getTime() >= thirtyDaysAgo,
              )
              .map((progress) => String(progress.studentId)),
          ).size /
            totalStudents) *
          100
        : 0;

    const recentEnrollments = enrollments.slice(0, 3).map((enrollment: any) => ({
      _id: enrollment._id,
      studentName: enrollment.studentId?.name ?? "Student",
      studentEmail: enrollment.studentId?.email ?? "",
      studentImage: enrollment.studentId?.image ?? "",
      courseTitle: enrollment.courseId?.title ?? "Course",
      enrolledAt: enrollment.enrolledAt ?? enrollment.createdAt,
    }));

    return NextResponse.json(
      {
        stats: {
          totalStudents,
          activeCourses,
          totalCourses: courses.length,
          totalEnrollments: enrollments.length,
          completedLessons,
          lessonsCount,
        },
        recentEnrollments,
        engagement: {
          averageProgress: roundPercent(averageProgress),
          quizPassRate: roundPercent(passRate),
          activeStudents: roundPercent(activeStudents),
        },
      },
      { status: 200 },
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json("Internal server error", { status: 500 });
  }
};
