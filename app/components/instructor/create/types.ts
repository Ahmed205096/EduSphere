export type LessonDraft = {
  id: string;
  title: string;
  description: string;
  order: number;
  isPreview: boolean;
  videoFile: File | null;
  videoPreview: string | null;
  attachmentFile: File | null;
  duration: string | undefined;
};

export type ModuleDraft = {
  id: string;
  title: string;
  order: number;
  lessons: LessonDraft[];
};

export type CourseData = {
  title: string;
  description: string;
  thumbnail: File | null;
  thumbnailPreview: string | null;
  category: string;
  level: string;
  status: string;
};
