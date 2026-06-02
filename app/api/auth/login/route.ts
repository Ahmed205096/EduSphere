import dbConnect from "@/app/db/dbConnect";
import User from "@/app/db/models/User";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

export const POST = async (req: NextRequest) => {
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json("Invalid credentials", { status: 400 });

    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json("Invalid credentials", { status: 400 });
    if (!user.isConfirmed)
      return NextResponse.json("Please confirm your email", { status: 403 });

    if (user.rateLimitCount >= 5) {
      if (user.rateLimitReset && Date.now() > user.rateLimitReset.getTime()) {
        user.rateLimitCount = 0;
        user.rateLimitReset = null;
        await user.save();
      } else {
        return NextResponse.json("Too many attempts. Try again later.", {
          status: 429,
        });
      }
    }
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      user.rateLimitCount++;
      user.rateLimitReset = new Date(Date.now() + 15 * 60000);
      await user.save();
      return NextResponse.json("Invalid credentials", { status: 400 });
    }
    user.rateLimitCount = 0;
    user.rateLimitReset = null;
    await user.save();

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    const response = NextResponse.json("Login successfully", { status: 200 });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.log("Login ERROR ", err);

    return NextResponse.json("Internal server error", { status: 500 });
  }
};
