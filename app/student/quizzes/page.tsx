"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SolvedQuestion = {
  _id: string;
  questionText: string;
  options: string[];
  selectedOptionIndex: number;
  selectedOption: string | null;
  correctOptionIndex: number;
  correctOption: string;
  isCorrect: boolean;
  points: number;
  earnedPoints: number;
};

type SolvedQuiz = {
  _id: string;
  score: number;
  totalPoints: number;
  status: "passed" | "failed";
  createdAt: string;
  quiz: {
    _id: string;
    title: string;
    passingScore: number;
    courseTitle: string;
    lessonTitle: string;
  };
  questions: SolvedQuestion[];
};

const SOLVED_QUIZZES_URL = process.env.NEXT_PUBLIC_SOLVED_QUIZZES_URL as string;

function timeLabel(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function SolvedQuizzesPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<SolvedQuiz[]>([]);
  const [openSubmissionId, setOpenSubmissionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSubmissions() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(SOLVED_QUIZZES_URL, { cache: "no-store" });
        const data = await res.json();

        if (!res.ok || !Array.isArray(data)) {
          throw new Error(
            typeof data === "string" ? data : "Could not load solved quizzes.",
          );
        }

        setSubmissions(data);
        setOpenSubmissionId(data[0]?._id ?? "");
      } catch (err: any) {
        setError(err.message ?? "Could not load solved quizzes.");
      } finally {
        setLoading(false);
      }
    }

    loadSubmissions();
  }, []);

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-on-surface">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <button
              onClick={() => router.push("/student")}
              className="mb-4 inline-flex items-center gap-1 text-[13px] text-on-surface-variant transition-colors hover:text-primary"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 16 }}
              >
                arrow_back
              </span>
              Student dashboard
            </button>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-primary">
              Quiz history
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Solved quizzes
            </h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              Review your score, answers, and the correct choices.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
            {submissions.length} solved quiz
            {submissions.length !== 1 ? "zes" : ""}
          </div>
        </header>

        {loading ? (
          <div className="rounded-lg border border-white/10 bg-surface-container-low py-16 text-center text-on-surface-variant">
            <span
              className="material-symbols-outlined mb-3 block animate-spin"
              style={{ fontSize: 34 }}
            >
              progress_activity
            </span>
            <p className="text-sm">Loading solved quizzes...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-error/20 bg-error/10 py-16 text-center text-error">
            <p className="text-sm">{error}</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-surface-container-low py-16 text-center text-on-surface-variant">
            <p className="text-sm">No solved quizzes yet.</p>
          </div>
        ) : (
          <section className="space-y-4">
            {submissions.map((submission) => {
              const percentage =
                submission.totalPoints > 0
                  ? Math.round(
                      (submission.score / submission.totalPoints) * 100,
                    )
                  : 0;
              const isOpen = openSubmissionId === submission._id;

              return (
                <article
                  key={submission._id}
                  className="overflow-hidden rounded-xl border border-white/10 bg-surface-container-low"
                >
                  <button
                    onClick={() =>
                      setOpenSubmissionId(isOpen ? "" : submission._id)
                    }
                    className="flex w-full flex-col gap-4 p-5 text-left sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="min-w-0">
                      <span className="line-clamp-1 text-base font-semibold">
                        {submission.quiz.title}
                      </span>
                      <span className="mt-1 block text-[12px] text-on-surface-variant">
                        {submission.quiz.courseTitle} ·{" "}
                        {submission.quiz.lessonTitle} ·{" "}
                        {timeLabel(submission.createdAt)}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span
                        className={`rounded px-2 py-1 text-[11px] font-semibold uppercase ${
                          submission.status === "passed"
                            ? "bg-primary/10 text-primary"
                            : "bg-error/10 text-error"
                        }`}
                      >
                        {submission.status}
                      </span>
                      <span className="text-sm font-semibold text-on-surface">
                        {submission.score}/{submission.totalPoints} (
                        {percentage}%)
                      </span>
                      <span className="material-symbols-outlined text-on-surface-variant">
                        {isOpen ? "expand_less" : "expand_more"}
                      </span>
                    </span>
                  </button>

                  {isOpen && (
                    <div className="space-y-3 border-t border-white/10 p-5">
                      {submission.questions.map((question, index) => (
                        <div
                          key={question._id}
                          className="rounded-lg border border-white/10 bg-surface-container p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <h2 className="text-sm font-semibold">
                              {index + 1}. {question.questionText}
                            </h2>
                            <span
                              className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-semibold ${
                                question.isCorrect
                                  ? "bg-primary/10 text-primary"
                                  : "bg-error/10 text-error"
                              }`}
                            >
                              {question.earnedPoints}/{question.points}
                            </span>
                          </div>

                          <div className="mt-3 grid gap-2">
                            {question.options.map((option, optionIndex) => {
                              const isSelected =
                                question.selectedOptionIndex === optionIndex;
                              const isCorrect =
                                question.correctOptionIndex === optionIndex;

                              return (
                                <div
                                  key={`${question._id}-${optionIndex}`}
                                  className={`rounded-lg border px-3 py-2 text-sm ${
                                    isCorrect
                                      ? "border-primary/40 bg-primary/10 text-primary"
                                      : isSelected
                                        ? "border-error/40 bg-error/10 text-error"
                                        : "border-white/10 text-on-surface-variant"
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <span>{option}</span>
                                    <span className="text-[11px] font-semibold uppercase">
                                      {isCorrect
                                        ? "Correct"
                                        : isSelected
                                          ? "Your answer"
                                          : ""}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
