import dbConnect from "@/app/db/dbConnect";
import Notification from "@/app/db/models/Notification";
import User from "@/app/db/models/User";
import customeAuth from "@/utils/customeAuth/customeAuth";
import { NextRequest, NextResponse } from "next/server";
import { htmlCode, sendEmail } from "../auth/forgot-password/route";
import mongoose from "mongoose";

export const POST = async (req: NextRequest) => {
  try {
    const { recipientId, type, message, link, metadata } = await req.json();
    if (!recipientId || !type || !message || !link) {
      return NextResponse.json("missing required fields", { status: 400 });
    }
    const session = await customeAuth();
    if (!session) return NextResponse.json("unauthorized", { status: 401 });
    const userId = new mongoose.Types.ObjectId(session?.user?.id);
    if (!userId) return NextResponse.json("unauthorized", { status: 401 });
    await dbConnect();
    const user = await User.findById(userId).select("_id email").lean().exec();
    const recipientUser = await User.findById(recipientId)
      .select("email")
      .lean()
      .exec();
    if (!user) return NextResponse.json("unauthorized", { status: 401 });
    const notification = await Notification.create({
      recipientId,
      type,
      message,
      link,
      metadata,
    });
    if (!notification) {
      return NextResponse.json("failed to create notification", {
        status: 500,
      });
    }

    const html = htmlCode(link, message, "Show notification");
    await sendEmail(recipientUser.email, html, "New EduSphere Notification");

    return NextResponse.json(notification, { status: 201 });
  } catch (err) {
    console.log(err);
    return NextResponse.json("Internal server error", { status: 500 });
  }
};

export const GET = async (req: NextRequest) => {
  try {
    const session = await customeAuth();
    if (!session) return NextResponse.json("unauthorized", { status: 401 });
    const userId = new mongoose.Types.ObjectId(session?.user?.id);
    if (!userId) return NextResponse.json("unauthorized", { status: 401 });
    await dbConnect();
    const notifications = await Notification.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    if (!notifications) {
      return NextResponse.json("failed to get notifications", {
        status: 500,
      });
    }
    return NextResponse.json(notifications, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json("Internal server error", { status: 500 });
  }
};

export const PUT = async (req: NextRequest) => {
  try {
    const { notificationId } = await req.json();
    if (!notificationId) {
      return NextResponse.json("missing required fields", { status: 400 });
    }
    const session = await customeAuth();
    if (!session || !session?.user?.id)
      return NextResponse.json("unauthorized", { status: 401 });

    const userId = session.user.id;
    await dbConnect();

    const notification = await Notification.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(notificationId),
        recipientId: new mongoose.Types.ObjectId(userId),
      },
      { isRead: true },
      { new: true, runValidators: true },
    )
      .lean()
      .exec();

    if (!notification) {
      return NextResponse.json("Notification not found or unauthorized", {
        status: 404,
      });
    }

    return NextResponse.json(notification, { status: 200 });
  } catch (err) {
    console.error("Error in Notification PUT:", err);
    return NextResponse.json("Internal server error", { status: 500 });
  }
};
