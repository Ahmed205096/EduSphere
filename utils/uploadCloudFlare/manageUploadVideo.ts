import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { S3 } from "./r2";

interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

const SUPPORTED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/ogg"]);

// =========================
// Upload Video To R2
// =========================

export async function uploadCourseVideo(file: File): Promise<UploadResult> {
  try {
    if (!file) {
      return {
        success: false,
        error: "No video provided",
      };
    }

    if (!SUPPORTED_VIDEO_TYPES.has(file.type)) {
      console.log("FORMAT error");

      return {
        success: false,
        error: "Video must be MP4, WebM, or Ogg",
      };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = file.name.split(".").pop() || "mp4";
    const fileName = `${crypto.randomUUID()}.${extension}`;
    const key = `course-videos/${fileName}`;

    await S3.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      }),
    );

    const videoUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    return {
      success: true,
      url: videoUrl,
      key,
    };
  } catch (error: any) {
    console.error("Video Upload Error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}

// =========================
// Delete Video
// =========================

export async function deleteCourseVideo(key: string): Promise<UploadResult> {
  try {
    if (!key) {
      return {
        success: false,
        error: "Video key is required",
      };
    }

    await S3.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
      }),
    );

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Video Delete Error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}

// =========================
// Update Video
// =========================

export async function updateCourseVideo(
  oldKey: string,
  newFile: File,
): Promise<UploadResult> {
  try {
    if (oldKey) {
      await deleteCourseVideo(oldKey);
    }

    const upload = await uploadCourseVideo(newFile);

    return upload;
  } catch (error: any) {
    console.error("Video Update Error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}
