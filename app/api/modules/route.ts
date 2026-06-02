import dbConnect from "@/app/db/dbConnect";
import Module from "@/app/db/models/Module";
import customeAuth from "@/utils/customeAuth/customeAuth";
import { deleteModuleWithContents } from "@/utils/deleteModuleWithContent/deleteModuleWithContent";
import { NextRequest, NextResponse } from "next/server";
import { ISession } from "../quiz/instructor/route";
import { checkIsAdminInstructor } from "@/utils/checkIsAdminInstructor/checkIsAdminInstructor";

export const POST = async (req: NextRequest) => {
  try {
    const isAuth = await checkIsAdminInstructor();
    if (!isAuth) return NextResponse.json("Unauthorized", { status: 403 });

    const { courseId, title, order } = await req.json();
    if (!courseId || !title || !order)
      return NextResponse.json("Bad Request", { status: 400 });

    await dbConnect();
    const module = await Module.create({
      courseId,
      title,
      order,
    });

    if (!module) return NextResponse.json("Bad Request", { status: 400 });
    return NextResponse.json(module, { status: 200 });
  } catch (err) {
    return NextResponse.json("Internal server error", { status: 500 });
  }
};

export const PATCH = async (req: NextRequest) => {
  const isAuth = await checkIsAdminInstructor();
  if (!isAuth) return NextResponse.json("Unauthorized", { status: 403 });
  try {
    const { moduleId, title, order } = await req.json();
    if (!moduleId) return NextResponse.json("Bad Request", { status: 400 });
    let update = Object();
    if (title) update.title = title;
    if (order !== undefined) update.order = order;
    await dbConnect();
    const module = await Module.findByIdAndUpdate(moduleId, update, {
      new: true,
      runValidators: true,
    });
    if (!module) return NextResponse.json("Bad Request", { status: 400 });
    return NextResponse.json(module, { status: 200 });
  } catch (err) {
    return NextResponse.json("Internal server error", { status: 500 });
  }
};

export const DELETE = async (req: NextRequest) => {
  const isAuth = await checkIsAdminInstructor();
  if (!isAuth) return NextResponse.json("Unauthorized", { status: 403 });
  try {
    const searchParams = req.nextUrl.searchParams;
    const moduleId = searchParams.get("id") as string;
    if (!moduleId) return NextResponse.json("Bad Request", { status: 400 });

    await dbConnect();

    const deletedModule = await deleteModuleWithContents(moduleId);
    if (!deletedModule)
      return NextResponse.json("Module not found", { status: 404 });

    return NextResponse.json(deletedModule, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json("Internal server error", { status: 500 });
  }
};
