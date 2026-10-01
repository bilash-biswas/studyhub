import {
  getStorage,
  FirebaseStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { app } from "./config";

export const storage: FirebaseStorage = getStorage(app);

/**
 * Client-side Canvas-based image compressor.
 * Converts input images into WebP format with a maximum width and 80% quality,
 * reducing standard 2-5MB photos down to ~80-180KB to strictly protect free-tier storage limits.
 */
export async function compressImageToWebP(
  file: File,
  maxWidth: number = 1000,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // If not in a browser environment, return original
    if (typeof window === "undefined" || !window.createImageBitmap) {
      resolve(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for compression"));
    };

    img.src = objectUrl;
  });
}

/**
 * Uploads a question diagram or chart image after compressing to WebP
 */
export async function uploadQuestionImage(
  file: File,
  questionId: string
): Promise<string> {
  const compressedBlob = await compressImageToWebP(file, 1000, 0.82);
  const storageRef = ref(storage, `question-images/${questionId}/image.webp`);

  await uploadBytes(storageRef, compressedBlob, {
    contentType: "image/webp",
  });

  return getDownloadURL(storageRef);
}

/**
 * Uploads a user avatar after compressing to WebP
 */
export async function uploadUserAvatar(
  file: File,
  userId: string
): Promise<string> {
  const compressedBlob = await compressImageToWebP(file, 400, 0.85);
  const storageRef = ref(storage, `user-avatars/${userId}/avatar.webp`);

  await uploadBytes(storageRef, compressedBlob, {
    contentType: "image/webp",
  });

  return getDownloadURL(storageRef);
}
