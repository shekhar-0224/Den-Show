import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const uploadFile = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/r2-upload", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as { url: string };

    return data.url;
  } catch (error) {
    console.error("Error uploading file", error);
    return undefined;
  }
};

export const uploadBase64 = async (base64Data: string) => {
  try {
    const response = await fetch("/api/r2-upload-base64", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        base64Data,
      }),
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = (await response.json()) as { url: string; message: string };
    return data.url;
  } catch (error) {
    console.error("Error uploading base64:", error);
    return undefined;
  }
};

export const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
};
