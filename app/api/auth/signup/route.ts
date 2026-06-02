import dbConnect from "@/app/db/dbConnect";
import User from "@/app/db/models/User";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { htmlCode, sendEmail } from "../forgot-password/route";
import { uploadUserImage } from "@/utils/uploadCloudFlare/managUploadImage";

export const POST = async (req: NextRequest) => {
  try {
    const { name, email, password, image, role, bio } = await req.json();
    if (!name || !email || !password)
      return NextResponse.json("Invalid credentials", { status: 400 });

    await dbConnect();

    const isUserExists = await User.findOne({ email }).lean();
    if (isUserExists)
      return NextResponse.json("User already exists", { status: 400 });

    const hashed_password = await bcrypt.hash(password, 12);
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedConfirmationToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    const confirmationTokenExpires = Date.now() + 5 * 60000;
    let imageUrl: string | undefined;

    if (image) {
      const upload = await uploadUserImage(image);
      if (!upload.success) {
        return NextResponse.json(upload.error || "Failed to upload image", {
          status: 400,
        });
      }
      imageUrl = upload.url;
    }

    const url = `${process.env.NEXT_PUBLIC_HOST}/confirm-email/?token=${hashedConfirmationToken}`;
    await sendEmail(
      email,
      htmlCode(
        url,
        " You have successfully signed up for <strong>LMS</strong> . You can verify your email by clicking the button below, 🚨 This link is valid for <strong>5 minutes only</strong>.",
        " Verify Email",
      ),
    );

    await User.create({
      name,
      email,
      password: hashed_password,
      confirmationToken: hashedConfirmationToken,
      confirmationTokenExpires,
      image: imageUrl,
      role,
      bio,
    });
    return NextResponse.json("User created successfully", { status: 201 });
  } catch (err) {
    console.log("Signup ERROR", err);

    return NextResponse.json("Internal server error", { status: 500 });
  }
};
