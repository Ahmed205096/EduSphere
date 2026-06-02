import dbConnect from "@/app/db/dbConnect";
import User from "@/app/db/models/User";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

export const POST = async (req: NextRequest) => {
  try {
    const { token, newPassword } = await req.json();
    if (!token || !newPassword) {
      return NextResponse.json("Token and new password are required", {
        status: 400,
      });
    }
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const encryptedPassword = await bcrypt.hash(newPassword, 12);

    await dbConnect();

    const user = await User.findOneAndUpdate(
      {
        resetPasswordToken: hashedToken,
        resetPasswordTokenExpires: { $gt: Date.now() },
      },
      {
        password: encryptedPassword,
        resetPasswordToken: null,
        resetPasswordTokenExpires: null,
      },
      { new: true, runValidators: true },
    );

    if (!user) {
      return NextResponse.json("Invalid or expired reset token", {
        status: 400,
      });
    }

    return NextResponse.json("Password reset successful", { status: 200 });
  } catch (err) {
    console.log("Reset password error", err);
    return NextResponse.json("Internal server error", { status: 500 });
  }
};
