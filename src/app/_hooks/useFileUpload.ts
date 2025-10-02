import { useMutation } from "@tanstack/react-query";
import { useMutation as useCvxMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export const useFileUpload = () => {
  const generateUploadUrl = useCvxMutation(api.file.generateUploadUrl);

  return useMutation({
    mutationFn: async (file: File) => {
      const uploadUrl = await generateUploadUrl({
        contentType: file.type,
        size: file.size,
      });

      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const { storageId } = await result.json();

      if (typeof storageId !== "string") {
        throw new Error("Failed to upload file");
      }

      return storageId as Id<"_storage">;
    },

    onError: (error) => {
      console.error("File upload failed:", error);
      toast.error(`File upload failed: ${error.message}`);
    },
  });
};
