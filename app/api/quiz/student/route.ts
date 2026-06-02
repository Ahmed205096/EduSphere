import dbConnect from "@/app/db/dbConnect";
import Quiz from "@/app/db/models/Quiz";
import QuizSubmission from "@/app/db/models/QuizSubmission";
import { Student } from "@/app/db/models/Student";
import customeAuth from "@/utils/customeAuth/customeAuth";
import { notifyCourseInstructor } from "@/utils/notifications/notifications";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

interface ISession {
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
    role: string;
  };
}

export const GET = async (req: NextRequest) => {
  try {
    const session = (await customeAuth()) as ISession;
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json("Unauthorized", { status: 403 });

    const searchParams = req.nextUrl.searchParams;
    const quizId = searchParams.get("quizId");
    if (!quizId) return NextResponse.json("Bad request", { status: 400 });

    await dbConnect();

    const isAnswerdBefore = await QuizSubmission.find({
      quizId,
      studentId: userId,
    }).lean();

    if (isAnswerdBefore.length > 0) {
      return NextResponse.json("Forbidden, you can't repeat this quiz", {
        status: 403,
      });
    }

    const quiz = await Quiz.findById(quizId)
      .select("-questions.correctOptionIndex")
      .lean();
    if (!quiz) return NextResponse.json("Not found", { status: 404 });

    return NextResponse.json(quiz, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json("Internal server error", { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const session = (await customeAuth()) as ISession;
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json("Unauthorized", { status: 401 });

    const { quizId, answers } = await req.json();
    if (!quizId || !answers || !Array.isArray(answers))
      return NextResponse.json("Bad request", { status: 400 });

    await dbConnect();

    const originalQuiz = await Quiz.findById(quizId).lean();
    if (!originalQuiz) return NextResponse.json("Not found", { status: 404 });

    let score = 0;
    let totalPoints = 0;

    const comparison = originalQuiz.questions.map((question: any) => {
      totalPoints += question.points;

      const studentAnswer = answers.find(
        (ans: any) => ans.questionId === question._id.toString(),
      );

      const isCorrect = studentAnswer
        ? studentAnswer.selectedOptionIndex === question.correctOptionIndex
        : false;

      const pointsEarned = isCorrect ? question.points : 0;
      score += pointsEarned;

      return {
        questionId: question._id,
        selectedOptionIndex: studentAnswer
          ? studentAnswer.selectedOptionIndex
          : -1,
        isCorrect,
        points: question.points,
      };
    });

    const studentPercentage = (score / totalPoints) * 100;
    const status =
      studentPercentage >= originalQuiz.passingScore ? "passed" : "failed";

    const quizSubmission = await QuizSubmission.create({
      quizId,
      studentId: userId,
      answers: comparison,
      score,
      status,
      totalPoints,
    });

    if (!quizSubmission)
      return NextResponse.json("Internal error creating submission", {
        status: 400,
      });

    const studentId = new mongoose.Types.ObjectId(userId);
    await Student.findOneAndUpdate(
      { studentId },
      {
        $setOnInsert: { studentId },
        $push: {
          activities: { type: "quiz_submitted" },
          completedQuizzes: quizSubmission._id,
        },
      },
      { new: true, runValidators: true, upsert: true },
    )
      .lean()
      .exec();

    await notifyCourseInstructor(originalQuiz.courseId, {
      type: "quiz_submitted",
      message: `${session.user.name ?? "A student"} submitted quiz: ${originalQuiz.title}`,
      link: `/instructor/quizzes`,
      metadata: {
        courseId: originalQuiz.courseId,
        quizId,
      },
    });

    return NextResponse.json(quizSubmission, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json("Internal server error", { status: 500 });
  }
};
