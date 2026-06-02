import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

import crypto from "crypto";
import { S3 } from "./r2";

interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

// =========================
// Upload File
// =========================

export async function uploadCourseFile(file: File): Promise<UploadResult> {
  try {
    if (!file) {
      return {
        success: false,
        error: "No file provided",
      };
    }

    const extension = file.name.split(".").pop() || "file";
    const fileName = `${crypto.randomUUID()}.${extension}`;
    const key = `course-files/${fileName}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await S3.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
      }),
    );

    const fileUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    return {
      success: true,
      url: fileUrl,
      key,
    };
  } catch (error: any) {
    console.error("File Upload Error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}

// =========================
// Delete File
// =========================

export async function deleteCourseFile(key: string): Promise<UploadResult> {
  try {
    if (!key) {
      return {
        success: false,
        error: "File key is required",
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
    console.error("File Delete Error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}

// =========================
// Update File
// =========================

export async function updateCourseFile(
  oldKey: string,
  newFile: File,
): Promise<UploadResult> {
  try {
    if (oldKey) {
      await deleteCourseFile(oldKey);
    }

    const upload = await uploadCourseFile(newFile);

    return upload;
  } catch (error: any) {
    console.error("File Update Error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}
