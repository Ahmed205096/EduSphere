import dbConnect from "@/app/db/dbConnect";
import Course from "@/app/db/models/Course";
import { NextRequest, NextResponse } from "next/server";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const GET = async (req: NextRequest) => {
  try {
    await dbConnect();

    const searchParams = req.nextUrl.searchParams;
    const searchQuery = searchParams.get("searchQuery")?.trim() ?? "";
    const level = searchParams.get("level")?.trim() ?? "all";
    const query: Record<string, unknown> = { status: "published" };

    if (level !== "all") {
      query.level = level;
    }

    if (searchQuery) {
      const searchRegex = new RegExp(escapeRegExp(searchQuery), "i");
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { level: searchRegex },
      ];
    }

    const searchResult = await Course.find(query)
      .sort({ createdAt: -1 })
      .select(
        "_id title slug description thumbnailURL category level enrollmentCount",
      )
      .lean()
      .exec();

    return NextResponse.json(searchResult);
  } catch (err) {
    console.log(err);
    return NextResponse.json("Internal server error", { status: 500 });
  }
};
