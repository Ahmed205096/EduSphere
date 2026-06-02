import customAuth from "@/utils/customeAuth/customeAuth";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const session = await customAuth();
    return NextResponse.json({ session: session || null }, { status: 200 });
  } catch {
    return NextResponse.json("Internal server error", { status: 500 });
  }
};
