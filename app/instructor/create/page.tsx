"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomeSession } from "@/store";
import StepIndicator from "@/app/components/instructor/create/StepIndicator";
import Step1CourseInfo from "@/app/components/instructor/create/Step1CourseInfo";
import Step2Curriculum from "@/app/components/instructor/create/Step2Curriculum";
import Step3Review from "@/app/components/instructor/create/Step3Review";
import type { CourseData, ModuleDraft } from "@/app/components/instructor/create/types";

const COURSES_URL = process.env.NEXT_PUBLIC_MANAGE_COURSES!;
const MODULES_URL = process.env.NEXT_PUBLIC_MANAGE_MODULES!;
const LESSONS_URL = process.env.NEXT_PUBLIC_MANAFE_LESSONS!;

const initCourse: CourseData = {
  title: "",
  description: "",
  thumbnail: null,
  thumbnailPreview: null,
  category: "",
  level: "",
  status: "draft",
};

export default function CreateCoursePage() {
  const router = useRouter();
  const { session } = useCustomeSession();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [courseData, setCourseData] = useState<CourseData>(initCourse);
  const [modules, setModules] = useState<ModuleDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function patchCourse(patch: Partial<CourseData>) {
    setCourseData((prev) => ({ ...prev, ...patch }));
  }

  async function handlePublish() {
    if (!session?.user?.id) {
      setError("Session expired. Please log in again.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // Step 1: Create course
      const form = new FormData();
      form.append("title", courseData.title);
      form.append("description", courseData.description);
      form.append("thumbnail", courseData.thumbnail!);
      form.append("category", courseData.category);
      form.append("level", courseData.level);
      form.append("status", courseData.status);
      form.append("instructorId", session.user.id);

      const courseRes = await fetch(COURSES_URL, { method: "POST", body: form });
      const course = await courseRes.json();
      if (!courseRes.ok) throw new Error(typeof course === "string" ? course : "Failed to create course");

      const courseId: string = course._id;

      // Step 2: Create modules sequentially
      const moduleIds: Record<string, string> = {};
      for (const mod of modules) {
        const modRes = await fetch(MODULES_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId, title: mod.title, order: mod.order }),
        });
        const modData = await modRes.json();
        if (!modRes.ok) throw new Error(typeof modData === "string" ? modData : "Failed to create module");
        moduleIds[mod.id] = modData._id;
      }

      // Step 3: Create lessons sequentially (FormData to support video upload)
      for (const mod of modules) {
        const moduleId = moduleIds[mod.id];
        for (const lesson of mod.lessons) {
          const lessonForm = new FormData();
          lessonForm.append("courseId", courseId);
          lessonForm.append("moduleId", moduleId);
          lessonForm.append("title", lesson.title);
          lessonForm.append("description", lesson.description);
          lessonForm.append("order", String(lesson.order));
          lessonForm.append("isPreview", String(lesson.isPreview));
          if (lesson.duration) lessonForm.append("duration", lesson.duration);
          if (lesson.videoFile) lessonForm.append("video", lesson.videoFile);
          if (lesson.attachmentFile) lessonForm.append("file", lesson.attachmentFile);

          const lessonRes = await fetch(LESSONS_URL, { method: "POST", body: lessonForm });
          const lessonData = await lessonRes.json();
          if (!lessonRes.ok) throw new Error(typeof lessonData === "string" ? lessonData : "Failed to create lesson");
        }
      }

      router.push("/instructor");
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <main className="pt-8 pb-16 px-4 flex justify-center">
        <div className="w-full max-w-2xl">
          <StepIndicator current={step} />

          <div className="glass-card rounded-2xl p-6 sm:p-8">
            {step === 1 && (
              <Step1CourseInfo
                data={courseData}
                onChange={patchCourse}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <Step2Curriculum
                modules={modules}
                onChange={setModules}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
              />
            )}
            {step === 3 && (
              <Step3Review
                courseData={courseData}
                modules={modules}
                loading={loading}
                error={error}
                onBack={() => setStep(2)}
                onPublish={handlePublish}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
