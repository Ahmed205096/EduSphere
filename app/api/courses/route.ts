import dbConnect from "@/app/db/dbConnect";
import Course from "@/app/db/models/Course";
import { NextRequest, NextResponse } from "next/server";
import {
  deleteCourseImage,
  updateCourseImage,
  uploadCourseImage,
} from "@/utils/uploadCloudFlare/managUploadImage";
import Module from "@/app/db/models/Module";
import { deleteModuleWithContents } from "@/utils/deleteModuleWithContent/deleteModuleWithContent";
import generateSlug from "@/utils/generateSlug/generateSlug";
import Lesson from "@/app/db/models/Lesson";
import { checkIsAdminInstructor } from "@/utils/checkIsAdminInstructor/checkIsAdminInstructor";
import customeAuth from "@/utils/customeAuth/customeAuth";
import Enrollment from "@/app/db/models/Enrollment";
import { notifyAllStudents } from "@/utils/notifications/notifications";

export const POST = async (req: NextRequest) => {
  try {
    const isAuth = await checkIsAdminInstructor();
    if (!isAuth) return NextResponse.json("Unauthorized", { status: 403 });

    const form = await req.formData();
    const title = form.get("title") as string;
    const description = form.get("description") as string;
    const thumbnail = form.get("thumbnail") as File | null;
    const category = form.get("category") as string;
    const level = form.get("level") as string;
    const status = form.get("status") as string;
    const instructorId = form.get("instructorId") as string;
    const slug = generateSlug(title);
    if (
      !title ||
      !description ||
      !thumbnail ||
      !category ||
      !level ||
      !instructorId
    ) {
      return NextResponse.json("All fields are required", { status: 400 });
    }

    await dbConnect();
    const existingCourse = await Course.findOne({ slug });
    if (existingCourse) {
      return NextResponse.json("Course already exists", { status: 400 });
    }

    const cover = await uploadCourseImage(thumbnail);
    if (!cover.success) return NextResponse.json(cover.error, { status: 400 });

    const newCourse = await Course.create({
      title,
      slug,
      description,
      thumbnailURL: cover.url,
      thumbnailKEY: cover.key,
      category,
      level,
      status,
      instructorId,
      enrollmentCount: 0,
    });

    if (!newCourse) {
      await deleteCourseImage(cover.key!);
      return NextResponse.json("Bad request", { status: 400 });
    }

    if (newCourse.status === "published") {
      await notifyAllStudents({
        type: "course_created",
        message: `New course published: ${newCourse.title}`,
        link: `/courses/${newCourse._id}`,
        metadata: { courseId: newCourse._id },
      });
    }

    return NextResponse.json(newCourse, { status: 201 });
  } catch (err) {
    console.log(err);
    return NextResponse.json("Internal server error", { status: 500 });
  }
};

export const PATCH = async (req: NextRequest) => {
  try {
    const isAuth = await checkIsAdminInstructor();
    if (!isAuth) return NextResponse.json("Unauthorized", { status: 403 });

    const searchParams = req.nextUrl.searchParams;
    const courseId = searchParams.get("id") as string;

    if (!courseId)
      return NextResponse.json("Course ID is required", { status: 400 });

    await dbConnect();
    const course = await Course.findById(courseId);
    if (!course) return NextResponse.json("Course not found", { status: 404 });

    const { title, description, image, status } = await req.json();

    if (!title && !description && !image && !status) {
      return NextResponse.json("No fields provided", { status: 400 });
    }

    const previousStatus = course.status;

    if (title) {
      course.title = title;
      course.slug = generateSlug(title);
    }
    if (description) course.description = description;
    if (status) {
      if (!["draft", "published", "suspended"].includes(status)) {
        return NextResponse.json("Invalid course status", { status: 400 });
      }
      course.status = status;
    }
    if (image) {
      const cover = await updateCourseImage(course.thumbnailKEY, image);
      if (!cover.success)
        return NextResponse.json(cover.error, { status: 400 });
      course.thumbnailURL = cover.url;
      course.thumbnailKEY = cover.key;
    }

    await course.save();

    if (previousStatus !== "published" && course.status === "published") {
      await notifyAllStudents({
        type: "course_created",
        message: `New course published: ${course.title}`,
        link: `/courses/${course._id}`,
        metadata: { courseId: course._id },
      });
    }

    return NextResponse.json(course, { status: 200 });
  } catch (err) {
    console.log(err);

    return NextResponse.json("Internal server error", { status: 500 });
  }
};

export const DELETE = async (req: NextRequest) => {
  try {
    const isAuth = await checkIsAdminInstructor();
    if (!isAuth) return NextResponse.json("Unauthorized", { status: 403 });

    const searchParams = req.nextUrl.searchParams;
    const courseId = searchParams.get("id") as string;

    if (!courseId) return NextResponse.json("Bad Request", { status: 400 });
    await dbConnect();

    const modules = await Module.find({ courseId });
    const course = await Course.findById(courseId);

    if (!course) return NextResponse.json("Bad Request", { status: 400 });

    if (modules.length > 0) {
      const deleteModulePromises = modules.map((module) =>
        deleteModuleWithContents(module._id.toString()),
      );
      await Promise.all(deleteModulePromises);
    }

    if (course.thumbnailKEY) {
      await deleteCourseImage(course.thumbnailKEY);
    }

    await course.deleteOne();
    return NextResponse.json(course, { status: 200 });
  } catch (err) {
    return NextResponse.json("Internal server error", { status: 500 });
  }
};

export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const courseId = searchParams.get("id") as string;

    if (!courseId) return NextResponse.json("Bad Request", { status: 400 });
    await dbConnect();

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const session = await customeAuth();
    const canManage =
      !!session &&
      ["admin", "instructor"].includes(session.user.role);

    let canReadFullCourse = canManage;
    if (!canReadFullCourse && session) {
      const enrollment = await Enrollment.findOne({
        courseId,
        studentId: session.user.id,
      })
        .lean()
        .exec();

      canReadFullCourse = !!enrollment;
    }

    if (!canReadFullCourse && course.status !== "published") {
      return NextResponse.json("Unauthorized", { status: 403 });
    }

    const modules = await Module.find({ courseId }).sort({ order: 1 });

    let lessons: any[] = [];
    if (modules.length > 0) {
      const moduleIds = modules.map((module) => module._id);
      const lessonQuery = canReadFullCourse
        ? { moduleId: { $in: moduleIds } }
        : { moduleId: { $in: moduleIds }, isPreview: true };

      const lessonsRequest = Lesson.find(lessonQuery);
      if (!canReadFullCourse) {
        lessonsRequest.select(
          "courseId moduleId title description videoURL fileURL duration order isPreview",
        );
      }

      lessons = await lessonsRequest.sort({
        order: 1,
      });
    }

    const coursePayload = canReadFullCourse
      ? course
      : {
          _id: course._id,
          title: course.title,
          slug: course.slug,
          description: course.description,
          thumbnailURL: course.thumbnailURL,
          category: course.category,
          level: course.level,
          status: course.status,
          enrollmentCount: course.enrollmentCount,
        };

    return NextResponse.json(
      {
        course: coursePayload,
        modules,
        lessons,
        access: canReadFullCourse ? "full" : "preview",
      },
      { status: 200 },
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json("Internal server error", { status: 500 });
  }
};
