import { NextRequest, NextResponse } from "next/server";

export const DELETE = async (req: NextRequest) => {
  try {
    const response = NextResponse.json("Signed out successfully", {
      status: 200,
    });
    response.cookies.delete({ name: "auth_token", path: "/" });
    return response;
  } catch (err) {
    return NextResponse.json("Internal server error", { status: 500 });
  }
};
