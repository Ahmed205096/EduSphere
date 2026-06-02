import dbConnect from "@/app/db/dbConnect";
import { Student } from "@/app/db/models/Student";
import customeAuth from "@/utils/customeAuth/customeAuth";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// POST: set activity to Student activities
export const POST = async (req: NextRequest) => {
  try {
    const { studentId, activity } = await req.json();
    if (!studentId || !activity)
      return NextResponse.json("Bad request", { status: 400 });
    await dbConnect();
    const userId = new mongoose.Types.ObjectId(studentId);
    const student = await Student.findOneAndUpdate(
      { studentId: userId },
      {
        $setOnInsert: { studentId: userId },
        $push: { activities: activity },
      },
      { new: true, runValidators: true, upsert: true },
    );

    return NextResponse.json(student.activities, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json("Internal server error", { status: 500 });
  }
};

// GET: get all activities
export const GET = async (req: NextRequest) => {
  try {
    const session = await customeAuth();
    if (!session) return NextResponse.json("Unauthorized", { status: 401 });
    const studentId = session?.user?.id;
    if (!studentId) return NextResponse.json("Unauthorized", { status: 401 });
    await dbConnect();
    const student = await Student.findOne({
      studentId: new mongoose.Types.ObjectId(studentId),
    })
      .select("activities")
      .lean();
    if (!student) return NextResponse.json([], { status: 200 });
    return NextResponse.json(student.activities, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json("Internal server error", { status: 500 });
  }
};
