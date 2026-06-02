import dbConnect from "@/app/db/dbConnect";
import Lesson from "@/app/db/models/Lesson";
import CourseProgress from "@/app/db/models/CourseProgress";
import { Student } from "@/app/db/models/Student";
import customeAuth from "@/utils/customeAuth/customeAuth";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

const getTotalLessons = async (courseId: string) => {
  await dbConnect();
  const lessonCount = await Lesson.countDocuments({ courseId }).exec();
  return lessonCount;
};
// POST: make student complete lesson
export const POST = async (req: NextRequest) => {
  try {
    const session = await customeAuth();
    if (!session || !session.user)
      return NextResponse.json("Bad request", { status: 401 });
    const { lessonId, courseId } = await req.json();
    if (!lessonId || !courseId)
      return NextResponse.json("Bad request", { status: 400 });
    await dbConnect();
    const courseProgress = await CourseProgress.findOne({
      studentId: session.user.id,
      courseId: courseId,
    }).exec();
    if (!courseProgress)
      return NextResponse.json("Bad request", { status: 400 });

    const completedAlready = courseProgress.completedLessons.includes(
      new mongoose.Types.ObjectId(lessonId),
    );

    if (completedAlready) {
      courseProgress.completedLessons.pull(lessonId);
    } else {
      courseProgress.completedLessons.push(lessonId);
    }
    const totalLessons = await getTotalLessons(courseId);
    courseProgress.progressPercentage =
      (courseProgress.completedLessons.length / totalLessons) * 100;
    courseProgress.isCompleted = courseProgress.progressPercentage === 100;
    courseProgress.lastAccessedAt = new Date();
    await courseProgress.save();

    if (!completedAlready) {
      await Student.findOneAndUpdate(
        { studentId: session.user.id },
        {
          $push: {
            activities: { type: "lesson_completed" },
          },
        },
        { new: true, runValidators: true },
      )
        .lean()
        .exec();
    }

    return NextResponse.json(courseProgress, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json("Internal server error", { status: 500 });
  }
};
