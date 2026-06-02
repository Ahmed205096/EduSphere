import Quiz from "@/app/db/models/Quiz";
import { checkIsAdminInstructor } from "@/utils/checkIsAdminInstructor/checkIsAdminInstructor";
import customeAuth from "@/utils/customeAuth/customeAuth";
import { notifyEnrolledStudents } from "@/utils/notifications/notifications";
import { NextRequest, NextResponse } from "next/server";

export interface ISession {
  user: {
    role: string;
    id: string;
  };
}

export const POST = async (req: NextRequest) => {
  try {
    const isAuth = await checkIsAdminInstructor();
    if (!isAuth) return NextResponse.json("Unauthorized", { status: 403 });

    const { courseId, lessonId, title, questions, passingScore } = await req.json();
    if (!courseId || !lessonId || !title || questions === undefined || !passingScore)
      return NextResponse.json("Bad request all filed are needed", {
        status: 400,
      });
    const createQuiz = await Quiz.create({
      courseId,
      lessonId,
      title,
      questions,
      passingScore,
    });
    if (!createQuiz) return NextResponse.json("Bad request", { status: 400 });

    await notifyEnrolledStudents(courseId, {
      type: "quiz_added",
      message: `New quiz added: ${createQuiz.title}`,
      link: `/quiz/student?quizId=${createQuiz._id}`,
      metadata: {
        courseId,
        lessonId,
        quizId: createQuiz._id,
      },
    });

    return NextResponse.json("Quiz created successfully", { status: 201 });
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
    const quizId = searchParams.get("quizId");
    const { courseId, title, questions, passingScore } = await req.json();
    if (!quizId) return NextResponse.json("Bad request", { status: 400 });
    if (!courseId && !title && questions === undefined && !passingScore)
      return NextResponse.json(
        "Bad request, we need at least one value to make update.",
        { status: 400 },
      );
    let updateOnly: any = {};
    if (courseId) updateOnly.courseId = courseId;
    if (title) updateOnly.title = title;
    if (questions !== undefined) updateOnly.questions = questions;
    if (passingScore) updateOnly.passingScore = passingScore;

    const updated_quiz = await Quiz.findByIdAndUpdate(
      { _id: quizId },
      updateOnly,
      { new: true, runValidators: true },
    );
    if (!updated_quiz) return NextResponse.json("Bad request", { status: 400 });
    return NextResponse.json(updated_quiz, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json("Internal server error", { status: 500 });
  }
};

export const DELETE = async (req: NextRequest) => {
  try {
    const isAuth = await checkIsAdminInstructor();
    if (!isAuth) return NextResponse.json("Unauthorized", { status: 403 });

    const searchParams = await req.nextUrl.searchParams;
    const quizId = searchParams.get("quizId");
    const lessonId = searchParams.get("lessonId");
    if (!quizId || !lessonId)
      return NextResponse.json("Bad request", { status: 400 });

    const deleted_quiz = await Quiz.findOneAndDelete({ _id: quizId, lessonId });
    if (!deleted_quiz) return NextResponse.json("Not found", { status: 404 });
    return NextResponse.json("Deleted successfully", { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json("Internal server error", { status: 500 });
  }
};

export const GET = async (req: NextRequest) => {
  try {
    const isAuth = await checkIsAdminInstructor();
    if (!isAuth) return NextResponse.json("Unauthorized", { status: 403 });

    const searchParams = await req.nextUrl.searchParams;
    const lessonId = searchParams.get("lessonId");
    const quizId = searchParams.get("quizId");
    if (!lessonId) return NextResponse.json("Bad request", { status: 400 });

    if (!quizId) {
      const quizzes = await Quiz.find({ lessonId })
        .select("_id courseId lessonId title passingScore questions createdAt updatedAt")
        .sort({ createdAt: -1 })
        .lean();

      return NextResponse.json(quizzes, { status: 200 });
    }

    const quiz = await Quiz.findOne({ lessonId, _id: quizId }).lean();
    if (!quiz) return NextResponse.json("Not found", { status: 404 });
    return NextResponse.json(quiz, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json("Internal server error", { status: 500 });
  }
};
