"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Question = {
  _id: string;
  questionText: string;
  options: string[];
  points: number;
};

type Quiz = {
  _id: string;
  title: string;
  passingScore: number;
  questions: Question[];
};

type Submission = {
  score: number;
  totalPoints: number;
  status: "passed" | "failed";
};

const QUIZ_URL = process.env.NEXT_PUBLIC_MANAGE_QUIZ_STUD as string;

function StudentQuizFallback() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">
      <p className="text-sm text-on-surface-variant">Loading quiz...</p>
    </div>
  );
}

export default function StudentQuizPage() {
  return (
    <Suspense fallback={<StudentQuizFallback />}>
      <StudentQuizContent />
    </Suspense>
  );
}

function StudentQuizContent() {
  const router = useRouter();
  const params = useSearchParams();
  const initialQuizId = params.get("quizId") ?? "";

  const [quizId, setQuizId] = useState(initialQuizId);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (initialQuizId) loadQuiz(initialQuizId);
  }, [initialQuizId]);

  const answeredCount = useMemo(
    () => (quiz ? quiz.questions.filter((q) => answers[q._id] !== undefined).length : 0),
    [answers, quiz],
  );

  async function loadQuiz(nextQuizId = quizId) {
    if (!nextQuizId.trim()) {
      setMessage("Enter a quiz id first.");
      return;
    }

    setLoading(true);
    setMessage("");
    setSubmission(null);
    try {
      const res = await fetch(`${QUIZ_URL}?quizId=${nextQuizId}`);
      const data = (await res.json()) as Quiz | string;
      if (!res.ok || typeof data === "string") {
        throw new Error(typeof data === "string" ? data : "Failed to load quiz.");
      }
      setQuiz(data);
      setAnswers({});
    } catch (err: any) {
      setQuiz(null);
      setMessage(err.message ?? "Could not load quiz.");
    } finally {
      setLoading(false);
    }
  }

  async function submitQuiz() {
    if (!quiz) return;
    if (answeredCount !== quiz.questions.length) {
      setMessage("Answer all questions before submitting.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(QUIZ_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz._id,
          answers: quiz.questions.map((question) => ({
            questionId: question._id,
            selectedOptionIndex: answers[question._id],
          })),
        }),
      });
      const data = (await res.json()) as Submission | string;
      if (!res.ok || typeof data === "string") {
        throw new Error(typeof data === "string" ? data : "Failed to submit quiz.");
      }
      setSubmission(data);
    } catch (err: any) {
      setMessage(err.message ?? "Could not submit quiz.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-on-surface">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <button
            onClick={() => router.push("/courses")}
            className="mb-4 inline-flex items-center gap-1 text-[13px] text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              arrow_back
            </span>
            Courses
          </button>
          <h1 className="text-2xl font-semibold tracking-tight">Student Quiz</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Load a quiz and submit your answers once.
          </p>
        </header>

        <section className="glass-card rounded-xl p-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              value={quizId}
              onChange={(e) => setQuizId(e.target.value)}
              placeholder="Quiz ID"
              className="rounded-lg border border-white/10 bg-surface-container-low px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            <button
              onClick={() => loadQuiz()}
              disabled={loading}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-on-primary hover:brightness-110 disabled:opacity-50"
            >
              Load Quiz
            </button>
          </div>
        </section>

        {message && (
          <div className="rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
            {message}
          </div>
        )}

        {submission && (
          <div
            className={`rounded-xl border px-5 py-4 ${
              submission.status === "passed"
                ? "border-primary/20 bg-primary/10 text-primary"
                : "border-error/20 bg-error/10 text-error"
            }`}
          >
            <p className="text-sm font-semibold uppercase tracking-wider">
              {submission.status}
            </p>
            <p className="mt-1 text-sm">
              Score: {submission.score} / {submission.totalPoints}
            </p>
          </div>
        )}

        {quiz && (
          <section className="glass-card rounded-xl p-5">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">{quiz.title}</h2>
                <p className="text-[13px] text-on-surface-variant">
                  Passing score: {quiz.passingScore}% · {answeredCount}/
                  {quiz.questions.length} answered
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {quiz.questions.map((question, index) => (
                <div
                  key={question._id}
                  className="rounded-xl border border-white/10 bg-surface-container/30 p-4"
                >
                  <div className="mb-3 flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[12px] font-bold text-primary">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{question.questionText}</p>
                      <p className="mt-0.5 text-[11px] text-on-surface-variant">
                        {question.points} point{question.points !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    {question.options.map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${
                          answers[question._id] === optionIndex
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-white/10 bg-surface-container-low text-on-surface hover:border-white/20"
                        }`}
                      >
                        <input
                          type="radio"
                          name={question._id}
                          checked={answers[question._id] === optionIndex}
                          onChange={() =>
                            setAnswers((prev) => ({
                              ...prev,
                              [question._id]: optionIndex,
                            }))
                          }
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={submitQuiz}
              disabled={loading || !!submission}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary hover:brightness-110 disabled:opacity-50"
            >
              {loading && (
                <span
                  className="material-symbols-outlined animate-spin"
                  style={{ fontSize: 18 }}
                >
                  progress_activity
                </span>
              )}
              Submit Quiz
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
