import dbConnect from "@/app/db/dbConnect";
import Lesson from "@/app/db/models/Lesson";
import Module from "@/app/db/models/Module";
import customeAuth from "@/utils/customeAuth/customeAuth";
import {
  deleteCourseFile,
  updateCourseFile,
  uploadCourseFile,
} from "@/utils/uploadCloudFlare/manageUploadFiles";
import {
  deleteCourseVideo,
  updateCourseVideo,
  uploadCourseVideo,
} from "@/utils/uploadCloudFlare/manageUploadVideo";
import { NextRequest, NextResponse } from "next/server";
import { checkIsAdminInstructor } from "@/utils/checkIsAdminInstructor/checkIsAdminInstructor";
import { notifyEnrolledStudents } from "@/utils/notifications/notifications";

export const POST = async (req: NextRequest) => {
  try {
    const isAuth = await checkIsAdminInstructor();
    if (!isAuth) return  NextResponse.json("Unauthorized", { status: 403 });
    const form = await req.formData();
    const courseId = form.get("courseId") as string;
    const moduleId = form.get("moduleId") as string;
    const title = form.get("title") as string;
    const file = form.get("file") as File | null;
    const description = form.get("description") as string | null;
    const video = form.get("video") as File | null;
    const duration = form.get("duration")
      ? Number(form.get("duration"))
      : undefined;
    const order = Number(form.get("order"));
    const isPreview = form.get("isPreview") === "true";

    if (!courseId || !moduleId || !title || isNaN(order) || !video) {
      return NextResponse.json(
        {
          error:
            "Bad Request, Missing required fields (courseId, moduleId, title, order, video).",
        },
        { status: 400 },
      );
    }

    await dbConnect();
    const moduleExists = await Module.findById(moduleId);
    if (!moduleExists)
      return NextResponse.json({ error: "Module not found" }, { status: 404 });

    const videoRes = await uploadCourseVideo(video);
    if (!videoRes || !videoRes.success) {
      return NextResponse.json(
        { error: videoRes?.error || "Failed to upload video" },
        { status: 400 },
      );
    }

    let fileRes = null;
    if (file && file.size > 0) {
      fileRes = await uploadCourseFile(file);
      if (!fileRes || !fileRes.success) {
        await deleteCourseVideo(videoRes.key!);
        return NextResponse.json(
          { error: fileRes?.error || "Failed to upload attached file" },
          { status: 400 },
        );
      }
    }

    try {
      const lesson = await Lesson.create({
        courseId,
        moduleId,
        title,
        description,
        videoURL: videoRes.url,
        videoKEY: videoRes.key,
        fileURL: fileRes?.url || null,
        fileKEY: fileRes?.key || null,
        duration,
        order,
        isPreview,
      });

      await notifyEnrolledStudents(courseId, {
        type: "lesson_added",
        message: `New lesson added: ${lesson.title}`,
        link: `/student/course?courseId=${courseId}`,
        metadata: {
          courseId,
          lessonId: lesson._id,
        },
      });

      return NextResponse.json(lesson, { status: 201 });
    } catch (dbError) {
      if (videoRes?.key) await deleteCourseVideo(videoRes.key);
      if (fileRes?.key) await deleteCourseFile(fileRes.key);

      console.error("DB Save Error:", dbError);
      return NextResponse.json(
        { error: "Failed to create lesson in database" },
        { status: 500 },
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
};

export const PATCH = async (req: NextRequest) => {
  try {
    const isAuth = await checkIsAdminInstructor();
    if (!isAuth) return NextResponse.json("Unauthorized", { status: 403 });

    const contentType = req.headers.get("content-type") || "";
    let lessonId: string | null = null;
    let courseId: string | null = null;
    let file: File | null = null;
    let oldFile: string | null = null;
    let title: string | null = null;
    let description: string | null = null;
    let video: File | null = null;
    let oldVideoKey: string | null = null;
    let duration: number | undefined;
    let attachments: unknown;
    let order: number | undefined;
    let isPreview: boolean | undefined;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      lessonId = form.get("lessonId") as string | null;
      courseId = form.get("courseId") as string | null;
      title = form.get("title") as string | null;
      file = form.get("file") as File | null;
      oldFile = form.get("oldFile") as string | null;
      description = form.get("description") as string | null;
      video = form.get("video") as File | null;
      oldVideoKey = form.get("oldVideoKey") as string | null;
      duration = form.get("duration")
        ? Number(form.get("duration"))
        : undefined;
      order = form.get("order") ? Number(form.get("order")) : undefined;
      isPreview = form.get("isPreview")
        ? form.get("isPreview") === "true"
        : undefined;
      const attachmentsValue = form.get("attachments") as string | null;
      attachments = attachmentsValue ? JSON.parse(attachmentsValue) : undefined;
    } else {
      const body = await req.json();
      lessonId = body.lessonId;
      courseId = body.courseId;
      title = body.title;
      description = body.description;
      duration = body.duration;
      attachments = body.attachments;
      order = body.order;
      isPreview = body.isPreview;
    }

    if (!lessonId)
      return NextResponse.json(
        { error: "Lesson ID is required" },
        { status: 400 },
      );

    const updateFields: Record<string, any> = {};
    if (courseId) updateFields.courseId = courseId;
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (duration !== undefined) updateFields.duration = duration;
    if (attachments !== undefined) updateFields.attachments = attachments;
    if (order !== undefined) updateFields.order = order;
    if (isPreview !== undefined) updateFields.isPreview = isPreview;

    if (video && video.size > 0 && oldVideoKey) {
      const videoRes = await updateCourseVideo(oldVideoKey, video);
      if (!videoRes.success)
        return NextResponse.json({ error: videoRes.error }, { status: 400 });
      updateFields.videoURL = videoRes.url;
      updateFields.videoKEY = videoRes.key;
    }

    if (file && file.size > 0) {
      let fileRes;
      if (oldFile) {
        fileRes = await updateCourseFile(oldFile, file);
      } else {
        fileRes = await uploadCourseFile(file);
      }

      if (!fileRes.success)
        return NextResponse.json({ error: fileRes.error }, { status: 400 });
      updateFields.fileURL = fileRes.url;
      updateFields.fileKEY = fileRes.key;
    }

    await dbConnect();
    const lesson = await Lesson.findByIdAndUpdate(lessonId, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!lesson) {
      if (updateFields.videoKEY) await deleteCourseVideo(updateFields.videoKEY);
      if (updateFields.fileKEY) await deleteCourseFile(updateFields.fileKEY);
      return NextResponse.json(
        { error: "Lesson not found or update failed" },
        { status: 404 },
      );
    }

    return NextResponse.json(lesson, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
};

export const DELETE = async (req: NextRequest) => {
  try {
    const isAuth = await checkIsAdminInstructor();
    if (!isAuth) return NextResponse.json("Unauthorized", { status: 403 });
    
    const searchParams = req.nextUrl.searchParams;
    const lessonId = searchParams.get("id");

    if (!lessonId)
      return NextResponse.json({ error: "Bad request" }, { status: 400 });

    await dbConnect();
    const lesson = await Lesson.findByIdAndDelete(lessonId);
    if (!lesson)
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

    if (lesson.videoKEY) await deleteCourseVideo(lesson.videoKEY);
    if (lesson.fileKEY) await deleteCourseFile(lesson.fileKEY);

    return NextResponse.json(lesson, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
};
