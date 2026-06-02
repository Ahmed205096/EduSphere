import dbConnect from "@/app/db/dbConnect";
import User from "@/app/db/models/User";
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { htmlCode, sendEmail } from "../forgot-password/route";

export const POST = async (req: NextRequest) => {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json("Email is required", { status: 400 });
    await dbConnect();
    const user = await User.findOne({ email });
    if (!user) return NextResponse.json("User not found", { status: 404 });
    if (user.isConfirmed)
      return NextResponse.json("User is already confirmed", { status: 400 });
    const confirmationToken = crypto.randomBytes(32).toString("hex");
    user.confirmationToken = confirmationToken;
    user.confirmationTokenExpires = new Date(Date.now() + 5 * 60000);
    await user.save();

    const url = `${process.env.NEXT_PUBLIC_HOST}/confirm-email?token=${confirmationToken}`;
    await sendEmail(
      email,
      htmlCode(
        url,
        " This is a new confirmation email for <strong>LMS</strong> . You can verify your email by clicking the button below, 🚨 This link is valid for <strong>5 minutes only</strong>.",
        " Verify Email",
      ),
    );
    return NextResponse.json("Confirmation email sent successfully", {
      status: 200,
    });
  } catch (err) {
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
};
