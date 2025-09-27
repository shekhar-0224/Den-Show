"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

const LiveStreamControls = ({ streamId }: { streamId: string }) => {
  const router = useRouter();

  const { mutateAsync: endStream } = api.stream.endStream.useMutation({
    onSuccess: () => {
      toast.success("Stream ended successfully");
      router.push("/");
    },
  });

  const endStreamHandler = async () => {
    await endStream({
      streamId,
    });
  };

  return (
    <div className="flex items-center gap-4 mt-4">
      <Button
        variant="inverted"
        onClick={endStreamHandler}
        className="h-fit flex flex-col items-center gap-2 cursor-pointer bg-[#B84944] text-white"
      >
        <Image
          src="/icons/end-stream.svg"
          alt="End Stream"
          width={36}
          height={36}
        />
        <div className="uppercase font-medium text-sm">End Stream</div>
      </Button>
    </div>
  );
};

export default LiveStreamControls;
