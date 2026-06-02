import Lesson from "@/app/db/models/Lesson";
import { deleteCourseFile } from "../uploadCloudFlare/manageUploadFiles";
import { deleteCourseVideo } from "../uploadCloudFlare/manageUploadVideo";
import Module from "@/app/db/models/Module";

export async function deleteModuleWithContents(moduleId: string) {
  const lessons = await Lesson.find({ moduleId });

  if (lessons.length > 0) {
    const deleteLessonAssetsPromises = lessons.flatMap((lesson) => {
      const deletes = [];

      if (lesson.videoKEY) deletes.push(deleteCourseVideo(lesson.videoKEY));
      if (lesson.fileKEY) deletes.push(deleteCourseFile(lesson.fileKEY));

      return deletes;
    });

    await Promise.all(deleteLessonAssetsPromises);

    await Lesson.deleteMany({ moduleId });
  }

  return await Module.findByIdAndDelete(moduleId);
}
