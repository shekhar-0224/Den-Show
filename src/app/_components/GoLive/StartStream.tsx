"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { uploadFile } from "~/lib/utils";
import { api } from "~/trpc/react";

interface StartStreamProps {
  onStartStream: () => void;
}

const StartStream = ({ onStartStream }: StartStreamProps) => {
  const router = useRouter();

  const [formData, setFormData] = useState<{
    streamTitle: string;
    thumbnail: File | null;
    description: string;
    fansOnly: boolean;
    audioOnly: boolean;
    clippingAllowed: boolean;
  }>({
    streamTitle: "",
    thumbnail: null,
    description: "",
    fansOnly: false,
    audioOnly: false,
    clippingAllowed: false,
  });

  const { mutateAsync: startStream } = api.stream.startInstant.useMutation({
    onSuccess: (data) => {
      setIsStartingStream(false);
      toast.success("Stream started successfully");
      onStartStream();
      router.push(`/live/${data.streamId}/dashboard`);
    },
    onError: () => {
      setIsStartingStream(false);
      toast.error("Failed to start stream");
    },
  });

  const [isStartingStream, setIsStartingStream] = useState(false);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFormData({ ...formData, thumbnail: file });
  };

  const startLivestreamHandler = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    setIsStartingStream(true);

    let thumbnailUrl: string | undefined = undefined;

    if (formData.thumbnail) {
      thumbnailUrl = await uploadFile(formData.thumbnail);
    }

    await startStream({
      title: formData.streamTitle,
      description: formData.description,
      categories: [],
      accessType: formData.fansOnly ? "Fan Only" : "Open to All",
      thumbnailUrl,
      clippingAllowed: formData.clippingAllowed,
    });
  };

  const isButtonDisabled =
    !formData.streamTitle || !formData.description || isStartingStream;

  return (
    <div className="p-4">
      <div className="text-lg font-cream-medium">Go Live</div>
      <form
        className="mt-6 flex flex-col gap-8"
        onSubmit={startLivestreamHandler}
      >
        <div className="flex flex-col gap-2">
          <label className="uppercase text-xs" htmlFor="channel-name">
            Stream Title
          </label>
          <Input
            id="channel-name"
            placeholder="Enter title here"
            className="text-sm py-6 shadow-small"
            value={formData.streamTitle}
            onChange={(e) =>
              setFormData({
                ...formData,
                streamTitle: e.target.value,
              })
            }
          />
        </div>

        <div className="flex items-center gap-8">
          <div className="w-[170px] flex flex-col gap-2">
            <label className="uppercase text-xs" htmlFor="thumbnail">
              Thumbnail
            </label>
            {formData.thumbnail ? (
              <Image
                src={URL.createObjectURL(formData.thumbnail)}
                alt="Thumbnail"
                width={170}
                height={100}
                className="object-cover cursor-pointer h-fit w-fit aspect-auto"
                onClick={() =>
                  document.getElementById("thumbnail-input")?.click()
                }
                style={{
                  width: "170px",
                  height: "100px",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                onClick={() =>
                  document.getElementById("thumbnail-input")?.click()
                }
                className="text-sm font-normal underline border-2 border-dashed border-border rounded-md p-4 flex items-center justify-center cursor-pointer w-[170px] h-[100px]"
              >
                Choose Thumbnail
              </div>
            )}
            <input
              id="thumbnail-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleThumbnailChange}
            />
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <label className="uppercase text-xs" htmlFor="stream-desc">
              Description (if any)
            </label>
            <Textarea
              id="stream-desc"
              className="text-sm h-[100px]"
              placeholder="Write about your stream here"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="uppercase text-xs" htmlFor="channel-name">
            Audience
          </label>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Switch
                id="fans-only"
                checked={formData.fansOnly}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    fansOnly: checked,
                  })
                }
              />
              <Label htmlFor="fans-only" className="font-normal text-sm">
                Open to <span className="font-semibold">FANS</span> only
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <Switch
                id="open-to-all"
                checked={!formData.fansOnly}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    fansOnly: !checked,
                  })
                }
              />
              <Label htmlFor="open-to-all" className="font-normal text-sm">
                Open to <span className="font-semibold">EVERYONE</span>
              </Label>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <label className="uppercase text-xs" htmlFor="channel-name">
              Clipping
            </label>
            <Tooltip>
              <TooltipTrigger>
                <Image
                  src="/icons/info.svg"
                  alt="Info"
                  width={16}
                  height={16}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Only fans will be allowed to clip your content</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Switch
                id="clipping-allowed"
                checked={formData.clippingAllowed}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    clippingAllowed: checked,
                  })
                }
              />
              <Label htmlFor="clipping-allowed" className="font-normal text-sm">
                Allow <span className="font-semibold">CLIPPING</span>
              </Label>
            </div>
          </div>
        </div>

        {/* <div className="flex flex-col gap-2">
          <label className="uppercase text-xs" htmlFor="audio-only">
            Audio-Only Mode
          </label>
          <div className="flex items-center space-x-2">
            <Switch
              id="audio-only"
              checked={formData.audioOnly}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  audioOnly: checked,
                })
              }
            />
            <Label htmlFor="audio-only" className="font-normal text-sm">
              {formData.audioOnly ? "Enabled" : "Disabled"}
            </Label>
          </div>
        </div> */}

        <div className="flex gap-6">
          <Button disabled={isButtonDisabled} className="w-full" type="submit">
            {isStartingStream ? "Starting..." : "Go Live Now"}
          </Button>
          {/* <Button disabled={isButtonDisabled} className="w-full">
            Schedule for Later
          </Button> */}
        </div>
      </form>
    </div>
  );
};

export default StartStream;
