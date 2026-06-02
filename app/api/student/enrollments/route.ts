import dbConnect from "@/app/db/dbConnect";
import "@/app/db/models/Course";
import "@/app/db/models/Enrollment";
import { Student } from "@/app/db/models/Student";
import customeAuth from "@/utils/customeAuth/customeAuth";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// GET: return all enrollments of the current user
export const GET = async (req: NextRequest) => {
  try {
    const session = await customeAuth();
    if (!session || !session?.user)
      return NextResponse.json("Not authorized", { status: 401 });
    const studentId = session?.user?.id;
    if (!studentId) return NextResponse.json("Not authorized", { status: 401 });
    await dbConnect();
    const student = await Student.findOne({
      studentId: new mongoose.Types.ObjectId(studentId),
    })
      .populate({
        path: "enrolledCourses",
        populate: {
          path: "courseId",
          select: "title description thumbnailURL category level status enrollmentCount",
        },
      })
      .lean()
      .exec();
    if (!student) return NextResponse.json("Not found", { status: 404 });

    const courses = (student.enrolledCourses ?? [])
      .map((enrollment: any) => enrollment?.courseId)
      .filter((course: any) => course && typeof course === "object");

    return NextResponse.json(courses, { status: 200 });
  } catch (err) {
    return NextResponse.json("Internal server error", { status: 500 });
  }
};
