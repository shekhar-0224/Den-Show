import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { uploadBase64 } from "~/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

import useAddress from "~/app/_hooks/useAddress";
import useLogin from "~/app/_hooks/useLogin";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import ClippableHlsPlayer from "../common/ClippableHlsPlayer";
import EditorPlayer from "../common/EditorPlayer";

interface ClipButtonProps {
  streamId: string;
  hlsUrl: string;
}

const ClipButton = ({ streamId, hlsUrl }: ClipButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { address } = useAddress();
  const { login } = useLogin();

  const [title, setTitle] = useState("");

  const { mutateAsync: createClip } = api.clips.createClipMizan.useMutation({
    onSuccess: () => {
      toast.success("Clip created and can be viewed on your profile");
      setIsDialogOpen(false);
      // Reset form
      setTitle("");
    },
    onError: (error) => {
      toast.error("Failed to create clip");
      console.error("Failed to create clip:", error);
    },
  });

  const captureCurrentFrame = (): string | null => {
    const video = document.querySelector("video") as HTMLVideoElement;

    if (!video) {
      console.error("No video element found");
      return null;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8);
  };

  const handleTrimSubmit = async (absStart: number, absEnd: number) => {
    if (!title.trim()) {
      toast.error("Please enter a clip title first");
      return;
    }

    try {
      const thumbnailDataUrl = captureCurrentFrame();

      if (!thumbnailDataUrl) throw new Error("Failed to capture thumbnail");

      const thumbnailUrl = await uploadBase64(thumbnailDataUrl);

      if (!thumbnailUrl) throw new Error("Failed to upload thumbnail");

      // Pass the window positions instead of currentStreamTime
      await createClip({
        streamId: streamId,
        absEnd,
        absStart,
        title: title.trim(),
        thumbnailUrl,
      });
    } catch (error) {
      console.error("Failed to create clip:", error);
      toast.error("Failed to create clip");
    }
  };

  if (!address)
    return (
      <Button onClick={login} variant="inverted">
        Clip
      </Button>
    );

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="inverted">Clip</Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col pt-1 shadow-large w-[600px] p-4">
        <DialogTitle className="text-lg font-cream-medium tracking-tighter text-left">
          Create New Clip
        </DialogTitle>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="uppercase text-xs" htmlFor="clip-title">
              Clip Title
            </label>
            <Input
              maxLength={30}
              id="clip-title"
              placeholder="Enter title here"
              className="text-sm py-3 shadow-small"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <EditorPlayer
              src={hlsUrl}
              onSubmit={(start, end) => {
                handleTrimSubmit(start, end);
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClipButton;
