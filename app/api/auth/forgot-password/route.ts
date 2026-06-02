import dbConnect from "@/app/db/dbConnect";
import User from "@/app/db/models/User";
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { Resend } from "resend";

interface IUser {
  _id: string;
  email: string;
  name: string;
  resetPasswordToken: string | null;
  resetPasswordTokenExpire: Date | null;
}

export const sendEmail = (
  email: string,
  html: string,
  subject = "EduSphere Notification",
) => {
  if (!process.env.RESEND_KEY) {
    throw new Error("RESEND_KEY is not configured.");
  }

  const resend = new Resend(process.env.RESEND_KEY);

  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "EduSphere <onboarding@resend.dev>",
    to: email,
    subject,
    html,
  }).then((response) => {
    if (response.error) {
      console.error("Resend email failed:", response.error);
      throw new Error(response.error.message);
    }

    return response.data;
  });
};
export const htmlCode = (url: string, bodyText: string, btnText: string) => `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0b0f; padding: 40px 20px; text-align: center; color: #f4f4f5;">
      <div style="max-width: 480px; margin: 0 auto; background-color: #121214; padding: 32px; border-radius: 12px; border: 1px solid #27272a; text-align: left;">
        <h2 style="font-size: 24px; font-weight: 700; color: #a855f7; margin-top: 0; margin-bottom: 24px; text-align: center;">EduSphere</h2>
        <p style="font-size: 16px; color: #e4e4e7;">Hi there,</p>
        <p style="font-size: 14px; color: #a1a1aa; margin-bottom: 24px;">${bodyText}</p>
        <div style="text-align: center; margin-bottom: 28px;">
          <a href="${url}" target="_blank" style="background-color: #a855f7; color: #ffffff; padding: 12px 24px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block;">
            ${btnText}
          </a>
        </div>
        <hr style="border: 0; border-top: 1px solid #27272a; margin-bottom: 20px;" />
        <p style="font-size: 11px; color: #52525b; word-break: break-all;">
          If button doesn't work: <a href="${url}" style="color: #a855f7;">${url}</a>
        </p>
      </div>
    </div>
`;

export const POST = async (req: NextRequest) => {
  try {
    const { email } = await req.json();
    if (!email)
      return NextResponse.json("The email field is needed.", { status: 400 });
    await dbConnect();
    const user = (await User.findOne({ email }).lean()) as IUser;
    if (!user) return NextResponse.json("User not found!", { status: 404 });

    const passwordToken = crypto.randomBytes(32).toString("hex");
    const passwordTokenExpirey = Date.now() + 15 * 60000;
    const hashedPasswordToken = crypto
      .createHash("sha256")
      .update(passwordToken)
      .digest("hex");

    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: hashedPasswordToken,
      resetPasswordTokenExpires: passwordTokenExpirey,
    });

    const url = `${process.env.NEXT_PUBLIC_HOST}/reset-password/${passwordToken}`;

    await sendEmail(
      email,
      htmlCode(
        url,
        "  We received a request to reset the password for your <strong>EduSphere</strong> account. You can reset it by clicking the button below, 🚨 This link is valid for <strong>15 minutes only</strong>. If you did not request this change, you can safely ignore this email.",
        " Reset Password",
      ),
      "Reset Your EduSphere Password",
    );

    return NextResponse.json("Password reset link sent successfully.", {
      status: 200,
    });
  } catch (err) {
    console.log("ERROR IS", err);
    return NextResponse.json("Internal server error.", { status: 500 });
  }
};
