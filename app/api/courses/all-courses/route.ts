import dbConnect from "@/app/db/dbConnect";
import Course from "@/app/db/models/Course";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await dbConnect();
    const all_courses = await Course.find({ status: "published" }).lean();
    if (!all_courses) return NextResponse.json("Not found", { status: 500 });
    return NextResponse.json(all_courses, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json("Internal server error", { status: 500 });
  }
};
