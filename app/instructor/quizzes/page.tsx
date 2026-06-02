"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Course = {
  _id: string;
  title: string;
  status: string;
};

type Module = {
  _id: string;
  title: string;
  order: number;
};

type Lesson = {
  _id: string;
  moduleId: string;
  title: string;
  order: number;
};

type Question = {
  _id?: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  points: number;
};

type Quiz = {
  _id: string;
  courseId: string;
  lessonId: string;
  title: string;
  questions: Question[];
  passingScore: number;
};

const INSTRUCTOR_COURSES_URL = process.env.NEXT_PUBLIC_INSTRUCTOR_COURSES!;
const MANAGE_COURSES_URL = process.env.NEXT_PUBLIC_MANAGE_COURSES!;
const QUIZ_URL = process.env.NEXT_PUBLIC_MANAGE_QUIZ_INST!;

function emptyQuestion(): Question {
  return {
    questionText: "",
    options: ["", "", "", ""],
    correctOptionIndex: 0,
    points: 1,
  };
}

function normalizeId(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "_id" in value) {
    return String((value as { _id: string })._id);
  }
  return String(value ?? "");
}

const input =
  "w-full rounded-lg border border-white/10 bg-surface-container-low px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary/50";

export default function InstructorQuizzesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courseId, setCourseId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [quizId, setQuizId] = useState("");
  const [lessonQuizzes, setLessonQuizzes] = useState<Quiz[]>([]);
  const [title, setTitle] = useState("");
  const [passingScore, setPassingScore] = useState(50);
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadCourses() {
      setLoading(true);
      setMessage("");
      try {
        const res = await fetch(INSTRUCTOR_COURSES_URL);
        const data = await res.json();
        if (!res.ok || !Array.isArray(data)) {
          throw new Error(typeof data === "string" ? data : "Failed to load courses.");
        }
        setCourses(data);
      } catch (err: any) {
        setMessage(err.message ?? "Could not load courses.");
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  async function loadCourseContent(nextCourseId: string) {
    setCourseId(nextCourseId);
    setLessonId("");
    setQuizId("");
    setLessonQuizzes([]);
    setModules([]);
    setLessons([]);
    if (!nextCourseId) return;

    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${MANAGE_COURSES_URL}?id=${nextCourseId}`);
      const data = await res.json();
      if (!res.ok || typeof data === "string") {
        throw new Error(typeof data === "string" ? data : "Failed to load course content.");
      }
      setModules(data.modules ?? []);
      setLessons(data.lessons ?? []);
    } catch (err: any) {
      setMessage(err.message ?? "Could not load course content.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLessonChange(nextLessonId: string) {
    setLessonId(nextLessonId);
    setQuizId("");
    setLessonQuizzes([]);
    resetForm();
    if (!nextLessonId) return;
    await loadLessonQuizzes(nextLessonId);
  }

  async function loadLessonQuizzes(nextLessonId = lessonId) {
    if (!nextLessonId) return;

    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${QUIZ_URL}?lessonId=${nextLessonId}`);
      const data = (await res.json()) as Quiz[] | string;
      if (!res.ok || !Array.isArray(data)) {
        throw new Error(typeof data === "string" ? data : "Failed to load quizzes.");
      }
      setLessonQuizzes(data);
    } catch (err: any) {
      setMessage(err.message ?? "Could not load quizzes.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setTitle("");
    setPassingScore(50);
    setQuestions([emptyQuestion()]);
  }

  const groupedLessons = useMemo(
    () =>
      modules.map((mod) => ({
        ...mod,
        lessons: lessons.filter((lesson) => normalizeId(lesson.moduleId) === mod._id),
      })),
    [lessons, modules],
  );

  function updateQuestion(index: number, patch: Partial<Question>) {
    setQuestions((prev) =>
      prev.map((question, i) => (i === index ? { ...question, ...patch } : question)),
    );
  }

  function updateOption(questionIndex: number, optionIndex: number, value: string) {
    setQuestions((prev) =>
      prev.map((question, i) =>
        i !== questionIndex
          ? question
          : {
              ...question,
              options: question.options.map((option, j) =>
                j === optionIndex ? value : option,
              ),
            },
      ),
    );
  }

  function validateQuiz() {
    if (!courseId) return "Choose a course first.";
    if (!lessonId) return "Choose a lesson first.";
    if (!title.trim()) return "Quiz title is required.";
    if (passingScore < 0 || passingScore > 100) return "Passing score must be 0-100.";
    if (questions.length === 0) return "Add at least one question.";
    for (const question of questions) {
      if (!question.questionText.trim()) return "Every question needs text.";
      if (question.options.some((option) => !option.trim())) {
        return "Every option needs text.";
      }
    }
    return "";
  }

  function payload() {
    return {
      courseId,
      lessonId,
      title,
      passingScore,
      questions: questions.map((question) => ({
        questionText: question.questionText,
        options: question.options,
        correctOptionIndex: question.correctOptionIndex,
        points: question.points,
      })),
    };
  }

  async function createQuiz() {
    const validation = validateQuiz();
    if (validation) {
      setMessage(validation);
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(QUIZ_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload()),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data === "string" ? data : "Failed to create quiz.");
      await loadLessonQuizzes();
      setQuizId("");
      resetForm();
      setMessage("Quiz created successfully. The form is ready for a new quiz.");
    } catch (err: any) {
      setMessage(err.message ?? "Could not create quiz.");
    } finally {
      setSaving(false);
    }
  }

  async function loadQuiz(nextQuizId = quizId) {
    if (!lessonId || !nextQuizId.trim()) {
      setMessage("Choose a quiz first.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`${QUIZ_URL}?lessonId=${lessonId}&quizId=${nextQuizId}`);
      const data = (await res.json()) as Quiz | string;
      if (!res.ok || typeof data === "string") {
        throw new Error(typeof data === "string" ? data : "Failed to load quiz.");
      }
      setTitle(data.title);
      setPassingScore(data.passingScore);
      setQuestions(data.questions.length ? data.questions : [emptyQuestion()]);
      setQuizId(nextQuizId);
      setMessage("Quiz loaded.");
    } catch (err: any) {
      setMessage(err.message ?? "Could not load quiz.");
    } finally {
      setSaving(false);
    }
  }

  async function updateQuiz() {
    const validation = validateQuiz();
    if (validation) {
      setMessage(validation);
      return;
    }
    if (!quizId.trim()) {
      setMessage("Choose a quiz before updating.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`${QUIZ_URL}?quizId=${quizId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          courseId,
          passingScore,
          questions: payload().questions,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data === "string" ? data : "Failed to update quiz.");
      setMessage("Quiz updated.");
      await loadLessonQuizzes();
    } catch (err: any) {
      setMessage(err.message ?? "Could not update quiz.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteQuiz() {
    if (!lessonId || !quizId.trim()) {
      setMessage("Choose a quiz before deleting.");
      return;
    }
    if (!confirm("Delete this quiz?")) return;

    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`${QUIZ_URL}?lessonId=${lessonId}&quizId=${quizId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data === "string" ? data : "Failed to delete quiz.");
      setMessage(typeof data === "string" ? data : "Quiz deleted.");
      setQuizId("");
      resetForm();
      await loadLessonQuizzes();
    } catch (err: any) {
      setMessage(err.message ?? "Could not delete quiz.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <main className="mx-auto max-w-5xl space-y-6 px-4 pb-14 pt-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <button
              onClick={() => router.push("/instructor/courses")}
              className="mb-4 inline-flex items-center gap-1 text-[13px] text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                arrow_back
              </span>
              Courses
            </button>
            <h1 className="text-2xl font-semibold tracking-tight">Quiz Management</h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              Create, load, update, and delete quizzes for lesson content.
            </p>
          </div>
        </header>

        <section className="glass-card rounded-xl p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                Course
              </span>
              <select
                value={courseId}
                onChange={(e) => loadCourseContent(e.target.value)}
                className={input}
              >
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title} ({course.status})
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                Lesson
              </span>
              <select
                value={lessonId}
                onChange={(e) => handleLessonChange(e.target.value)}
                className={input}
              >
                <option value="">Select lesson</option>
                {groupedLessons.map((mod) => (
                  <optgroup key={mod._id} label={mod.title}>
                    {mod.lessons.map((lesson) => (
                      <option key={lesson._id} value={lesson._id}>
                        {lesson.title}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="glass-card rounded-xl p-5">
            <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Quiz title"
                className={input}
              />
              <input
                type="number"
                min={0}
                max={100}
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
                placeholder="Passing score"
                className={input}
              />
            </div>

            <div className="mt-5 space-y-4">
              {questions.map((question, questionIndex) => (
                <div
                  key={questionIndex}
                  className="rounded-xl border border-white/10 bg-surface-container/30 p-4"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-[12px] font-bold text-primary">
                      {questionIndex + 1}
                    </span>
                    <input
                      value={question.questionText}
                      onChange={(e) =>
                        updateQuestion(questionIndex, { questionText: e.target.value })
                      }
                      placeholder="Question text"
                      className={input}
                    />
                    <button
                      onClick={() =>
                        setQuestions((prev) =>
                          prev.filter((_, index) => index !== questionIndex),
                        )
                      }
                      disabled={questions.length === 1}
                      className="h-9 w-9 rounded-lg text-on-surface-variant hover:bg-error/10 hover:text-error disabled:opacity-30"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                        delete
                      </span>
                    </button>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {question.options.map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className="flex items-center gap-2 rounded-lg border border-white/10 bg-surface-container-low px-3 py-2"
                      >
                        <input
                          type="radio"
                          name={`correct-${questionIndex}`}
                          checked={question.correctOptionIndex === optionIndex}
                          onChange={() =>
                            updateQuestion(questionIndex, {
                              correctOptionIndex: optionIndex,
                            })
                          }
                        />
                        <input
                          value={option}
                          onChange={(e) =>
                            updateOption(questionIndex, optionIndex, e.target.value)
                          }
                          placeholder={`Option ${optionIndex + 1}`}
                          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                        />
                      </label>
                    ))}
                  </div>

                  <label className="mt-3 block max-w-[150px] space-y-1.5">
                    <span className="text-[11px] text-on-surface-variant">Points</span>
                    <input
                      type="number"
                      min={1}
                      value={question.points}
                      onChange={(e) =>
                        updateQuestion(questionIndex, { points: Number(e.target.value) })
                      }
                      className={input}
                    />
                  </label>
                </div>
              ))}
            </div>

            <button
              onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 py-2.5 text-sm text-on-surface-variant hover:border-primary/40 hover:text-primary"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                add
              </span>
              Add Question
            </button>
          </div>

          <aside className="glass-card h-fit rounded-xl p-5">
            <label className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                Existing Quiz
              </span>
              <select
                value={quizId}
                onChange={(e) => {
                  setQuizId(e.target.value);
                  if (e.target.value) loadQuiz(e.target.value);
                  else resetForm();
                }}
                className={input}
                disabled={!lessonId}
              >
                <option value="">
                  {lessonId ? "Select quiz" : "Select a lesson first"}
                </option>
                {lessonQuizzes.map((quiz) => (
                  <option key={quiz._id} value={quiz._id}>
                    {quiz.title} · {quiz.questions.length} question
                    {quiz.questions.length !== 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </label>

            {lessonId && lessonQuizzes.length === 0 && (
              <p className="mt-2 text-[12px] text-on-surface-variant">
                No quizzes yet for this lesson.
              </p>
            )}

            <div className="mt-4 grid gap-2">
              <button
                onClick={createQuiz}
                disabled={saving}
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:brightness-110 disabled:opacity-50"
              >
                Create Quiz
              </button>
              <button
                onClick={() => loadQuiz()}
                disabled={saving}
                className="rounded-lg bg-surface-container-high px-4 py-2.5 text-sm font-semibold text-on-surface hover:bg-white/5 disabled:opacity-50"
              >
                Load Quiz
              </button>
              <button
                onClick={updateQuiz}
                disabled={saving}
                className="rounded-lg bg-surface-container-high px-4 py-2.5 text-sm font-semibold text-on-surface hover:bg-white/5 disabled:opacity-50"
              >
                Update Quiz
              </button>
              <button
                onClick={deleteQuiz}
                disabled={saving}
                className="rounded-lg bg-error/10 px-4 py-2.5 text-sm font-semibold text-error hover:bg-error/20 disabled:opacity-50"
              >
                Delete Quiz
              </button>
            </div>

            {message && (
              <p
                className={`mt-4 rounded-lg px-3 py-2 text-[13px] ${
                  message.toLowerCase().includes("failed") ||
                  message.toLowerCase().includes("bad") ||
                  message.toLowerCase().includes("required") ||
                  message.toLowerCase().includes("unauthorized")
                    ? "bg-error/10 text-error"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {message}
              </p>
            )}

            {loading && (
              <p className="mt-4 text-[13px] text-on-surface-variant">
                Loading data...
              </p>
            )}
          </aside>
        </section>
      </main>
    </div>
  );
}
