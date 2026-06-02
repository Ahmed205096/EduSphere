import dbConnect from "@/app/db/dbConnect";
import User from "@/app/db/models/User";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const { token } = await req.json();
    if (!token)
      return NextResponse.json("Email and token are required!", {
        status: 400,
      });
    await dbConnect();
    const user = await User.findOneAndUpdate(
      {
        confirmationToken: token,
        confirmationTokenExpires: { $gt: Date.now() },
      },
      {
        isConfirmed: true,
        confirmationToken: null,
        confirmationTokenExpires: null,
      },
      {
        new: true,
        runValidators: true,
      },
    );
    if (!user)
      return NextResponse.json("Invalid or expired token", { status: 404 });

    return NextResponse.json("Email confirmed successfully", { status: 200 });
  } catch (err) {
    console.log("confirm email ERROR", err);

    return NextResponse.json("Internal server error", { status: 500 });
  }
};
