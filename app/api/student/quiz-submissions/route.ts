import dbConnect from "@/app/db/dbConnect";
import Course from "@/app/db/models/Course";
import Lesson from "@/app/db/models/Lesson";
import Quiz from "@/app/db/models/Quiz";
import QuizSubmission from "@/app/db/models/QuizSubmission";
import customeAuth from "@/utils/customeAuth/customeAuth";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const session = await customeAuth();
    if (!session || !session.user?.id) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }
    const userId = session.user.id;

    await dbConnect();

    const submissions = await QuizSubmission.find({
      studentId: new mongoose.Types.ObjectId(userId),
    })
      .populate({
        path: "quizId",
        model: Quiz,
        select: "title passingScore questions courseId lessonId",
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const quizSubmissions = submissions.filter(
      (submission) => submission.quizId && typeof submission.quizId === "object",
    );

    const courseIds = quizSubmissions
      .map((submission: any) => submission.quizId.courseId)
      .filter(Boolean);
    const lessonIds = quizSubmissions
      .map((submission: any) => submission.quizId.lessonId)
      .filter(Boolean);

    const [courses, lessons] = await Promise.all([
      Course.find({ _id: { $in: courseIds } }).select("title").lean().exec(),
      Lesson.find({ _id: { $in: lessonIds } }).select("title").lean().exec(),
    ]);

    const courseTitleById = new Map(
      courses.map((course) => [String(course._id), course.title]),
    );
    const lessonTitleById = new Map(
      lessons.map((lesson) => [String(lesson._id), lesson.title]),
    );

    const payload = quizSubmissions.map((submission: any) => {
      const quiz = submission.quizId;
      const answerByQuestionId = new Map<string, any>(
        submission.answers.map((answer: any) => [String(answer.questionId), answer]),
      );

      return {
        _id: submission._id,
        score: submission.score,
        totalPoints: submission.totalPoints,
        status: submission.status,
        createdAt: submission.createdAt,
        quiz: {
          _id: quiz._id,
          title: quiz.title,
          passingScore: quiz.passingScore,
          courseId: quiz.courseId,
          courseTitle: courseTitleById.get(String(quiz.courseId)) ?? "Course",
          lessonId: quiz.lessonId,
          lessonTitle: lessonTitleById.get(String(quiz.lessonId)) ?? "Lesson",
        },
        questions: quiz.questions.map((question: any) => {
          const answer = answerByQuestionId.get(String(question._id));
          const selectedOptionIndex = answer?.selectedOptionIndex ?? -1;

          return {
            _id: question._id,
            questionText: question.questionText,
            options: question.options,
            selectedOptionIndex,
            selectedOption:
              selectedOptionIndex >= 0 ? question.options[selectedOptionIndex] : null,
            correctOptionIndex: question.correctOptionIndex,
            correctOption: question.options[question.correctOptionIndex],
            isCorrect: answer?.isCorrect ?? false,
            points: question.points,
            earnedPoints: answer?.isCorrect ? question.points : 0,
          };
        }),
      };
    });

    return NextResponse.json(payload, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json("Internal server error", { status: 500 });
  }
};
