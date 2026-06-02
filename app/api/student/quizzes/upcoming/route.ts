import dbConnect from "@/app/db/dbConnect";
import Enrollment from "@/app/db/models/Enrollment";
import Quiz from "@/app/db/models/Quiz";
import QuizSubmission from "@/app/db/models/QuizSubmission";
import { Student } from "@/app/db/models/Student";
import customeAuth from "@/utils/customeAuth/customeAuth";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// GET: Return all upcoming quizzes for specific student
export const GET = async (req: NextRequest) => {
  try {
    const session = await customeAuth();
    if (!session) return NextResponse.json("Unauthorized", { status: 401 });
    const studentId = session?.user?.id;
    if (!studentId) return NextResponse.json("Unauthorized", { status: 401 });

    await dbConnect();
    type StudentWithEnrollments = {
      enrolledCourses?: { courseId?: mongoose.Types.ObjectId }[];
    };

    const studentData = (await Student.findOne({
      studentId: new mongoose.Types.ObjectId(studentId),
    })
      .select("enrolledCourses")
      .populate({
        path: "enrolledCourses",
        select: "courseId",
      })
      .lean()
      .exec()) as StudentWithEnrollments | null;
    if (!studentData || !studentData.enrolledCourses) {
      return NextResponse.json([], { status: 200 });
    }

    const enrolledCoursesIds = studentData.enrolledCourses
      .map((enrollment) => enrollment.courseId)
      .filter(Boolean);
    const solvedSubmissions = await QuizSubmission.find({ studentId })
      .select("quizId")
      .lean()
      .exec();

    const solvedQuizIds = solvedSubmissions.map((sub) => sub.quizId);

    const quiz = await Quiz.find({
      courseId: { $in: enrolledCoursesIds },
      _id: { $nin: solvedQuizIds },
    })
      .select("-questions.correctOptionIndex")
      .lean()
      .exec();

    return NextResponse.json(quiz, { status: 200 });
  } catch (err) {
    return NextResponse.json("Internal server error", { status: 500 });
  }
};
