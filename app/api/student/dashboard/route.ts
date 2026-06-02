import dbConnect from "@/app/db/dbConnect";
import CourseProgress from "@/app/db/models/CourseProgress";
import customeAuth from "@/utils/customeAuth/customeAuth";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

interface ISession {
  user: { id: string; role: string };
}

// GET: courses in progrss and complete lessons for specific student
export const GET = async (req: NextRequest) => {
  try {
    const session = (await customeAuth()) as ISession;
    if (!session || !session?.user)
      return NextResponse.json("Not authorized", { status: 401 });

    const studentId = session?.user?.id;
    if (!studentId) return NextResponse.json("Not authorized", { status: 401 });

    await dbConnect();

    const courseProgressAndCompletedLessons = await CourseProgress.find({
      studentId: new mongoose.Types.ObjectId(studentId),
    })
      .populate(
        "courseId",
        "title description thumbnailURL category level status enrollmentCount",
      )
      .sort({ lastAccessedAt: -1 })
      .lean()
      .exec();

    if (!courseProgressAndCompletedLessons) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(courseProgressAndCompletedLessons, {
      status: 200,
    });
  } catch (err) {
    console.error("Error in Dashboard GET Progress:", err);
    return NextResponse.json("Internal server error", { status: 500 });
  }
};
