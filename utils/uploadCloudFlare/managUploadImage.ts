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
// Upload Image
// =========================

export async function uploadCourseImage(file: File): Promise<UploadResult> {
  try {
    if (!file) {
      return {
        success: false,
        error: "No file provided",
      };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${extension}`;
    const key = `courses/${fileName}`;

    await S3.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      }),
    );

    const imageUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    return {
      success: true,
      url: imageUrl,
      key,
    };
  } catch (error: any) {
    console.error("Upload Error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}

export async function uploadUserImage(imageDataUrl: string): Promise<UploadResult> {
  try {
    if (!imageDataUrl) {
      return {
        success: false,
        error: "No image provided",
      };
    }

    const match = imageDataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
    if (!match) {
      return {
        success: false,
        error: "Invalid image format",
      };
    }

    const [, contentType, base64] = match;
    const extension = contentType.split("/")[1].replace("jpeg", "jpg");
    const key = `users/${crypto.randomUUID()}.${extension}`;
    const buffer = Buffer.from(base64, "base64");

    await S3.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    return {
      success: true,
      url: `${process.env.R2_PUBLIC_URL}/${key}`,
      key,
    };
  } catch (error: any) {
    console.error("Upload User Image Error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}

// =========================
// Delete Image
// =========================

export async function deleteCourseImage(key: string): Promise<UploadResult> {
  try {
    if (!key) {
      return {
        success: false,
        error: "Image key is required",
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
    console.error("Delete Error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}

// =========================
// Update Image
// =========================

export async function updateCourseImage(
  oldKey: string,
  newFile: File,
): Promise<UploadResult> {
  try {
    if (oldKey) {
      await deleteCourseImage(oldKey);
    }

    const upload = await uploadCourseImage(newFile);

    if (!upload.success) {
      return {
        success: false,
        error: upload.error,
      };
    }

    return {
      success: true,
      url: upload.url,
      key: upload.key,
    };
  } catch (error: any) {
    console.error("Update Error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}
