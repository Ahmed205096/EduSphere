import dbConnect from "@/app/db/dbConnect";
import Course from "@/app/db/models/Course";
import User from "@/app/db/models/User";
import customeAuth from "@/utils/customeAuth/customeAuth";
import { NextRequest, NextResponse } from "next/server";
import { ISession } from "../../quiz/instructor/route";
interface IUser {
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
  };
}

export const GET = async (req: NextRequest) => {
  try {
    const session = (await customeAuth()) as ISession;
    if (!session || !["admin", "instructor"].includes(session.user.role))
      return NextResponse.json("Unauthorized", { status: 403 });

    const instructorId = session?.user?.id;
    if (!instructorId) {
      return NextResponse.json("Instructor ID is required", { status: 400 });
    }
    await dbConnect();

    const user = await User.findById(instructorId);
    if (!user) {
      return NextResponse.json("User not found", { status: 404 });
    }
    const courses = await Course.find({ instructorId: user._id });
    return NextResponse.json(courses, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json("Internal server error", { status: 500 });
  }
};
