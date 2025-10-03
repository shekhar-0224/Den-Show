"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";

const LiveStreamControls = ({ streamId }: { streamId: string }) => {
  const router = useRouter();

  // Dummy end stream function
  const endStream = async () => {
    try {
      console.log("Dummy stream ended:", streamId);
      toast.success("Stream ended successfully");
      router.push("/");
    } catch (error) {
      toast.error("Failed to end stream");
      console.error("Failed to end stream:", error);
    }
  };

  return (
    <div className="flex items-center gap-4 mt-4">
      <Button
        variant="inverted"
        onClick={endStream}
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