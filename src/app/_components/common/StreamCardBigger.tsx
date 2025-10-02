"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import HlsPlayer from "./HlsPlayer";

interface StreamCardProps {
  title: string;
  username: string;
  handle: string;
  thumbnail: string;
  creatorPfp: string;
  className?: string;
  streamId: string;
  isLive?: boolean;
  views: number;
  clipId?: string;
  hlsUrl?: string;
  didntStart?: boolean;
}

const HOVER_DELAY_MS = 150;

const StreamCard = ({
  title,
  username,
  handle,
  thumbnail,
  className,
  creatorPfp,
  streamId,
  isLive = false,
  views,
  clipId,
  hlsUrl,
  didntStart = false,
}: StreamCardProps) => {
  const router = useRouter();
  const [hovering, setHovering] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const timerRef = useRef<number | null>(null);

  const onEnter = useCallback(() => {
    setHovering(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(
      () => setShowPreview(true),
      HOVER_DELAY_MS,
    );
  }, []);

  const onLeave = useCallback(() => {
    setHovering(false);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setShowPreview(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const liveBadge = (
    <div className="bg-[#FF4141] text-white text-xs px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
      <div className="w-2 h-2 bg-white rounded-full" />
      <span>LIVE</span>
    </div>
  );

  const viewsBadge = (
    <div className="bg-black text-white text-xs px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
      <Image
        src="/icons/watching.svg"
        alt="Views"
        width={12}
        height={12}
      />
      <span className="font-instrument-sans font-semibold">{views}</span>
    </div>
  );

  const badgesContainer = (
    <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-20">
      {liveBadge}
      {viewsBadge}
    </div>
  );

  const goWatch = () => {
    if (didntStart) return;
    if (isLive) router.push(`/live/${streamId}`);
    else if (!clipId) router.push(`/watch/${streamId}`);
    else router.push(`/clip/${clipId}`);
  };

  return (
    <Card
      className={cn(
        "p-2.5 w-[355px] gap-4 flex-shrink-0 justify-between",
        className,
      )}
    >
      <CardHeader className="p-0 relative">
        <div
          className="relative w-[330px] h-[200px] overflow-hidden rounded-none mx-auto"
          onMouseEnter={hlsUrl && !didntStart ? onEnter : undefined}
          onMouseLeave={hlsUrl && !didntStart ? onLeave : undefined}
        >
          <Image
            src={thumbnail}
            alt="Thumbnail"
            width={330}
            height={200}
            className={cn(
              "object-cover transition-opacity duration-150",
              showPreview ? "opacity-0" : "opacity-100",
            )}
            style={{ width: 330, height: 200 }}
            priority={false}
          />

          {showPreview && hlsUrl && !didntStart ? (
            <div
              className="absolute inset-0 z-10 cursor-pointer"
              onClick={goWatch}
            >
              <HlsPlayer src={hlsUrl} autoPlay muted />
            </div>
          ) : null}

          {isLive ? badgesContainer : !clipId && !didntStart ? viewsBadge : null}
        </div>

        <CardTitle className="font-semibold text-sm mt-1 line-clamp-2">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex justify-between items-center">
          <Link href={`/${handle}`}>
            <div className="flex items-center gap-2">
              <Image
                src={creatorPfp}
                alt="Creator"
                width={30}
                height={30}
                className="rounded-full"
              />
              <div className="flex flex-col flex-1">
                <div className="text-sm underline">@{handle}</div>
                <div className="font-medium text-xs flex items-center gap-1 mt-1">
                  <div className="">Fans: 123</div>
                  <div className="border-l border-dashed border-black pl-1">
                    MCap: $123
                  </div>
                </div>
              </div>
            </div>
          </Link>
          <Button
            disabled={didntStart}
            onClick={goWatch}
            className="py-1 px-3 text-sm w-[127px]"
          >
            {didntStart ? "Didn't Start" : isLive ? "Enter Den" : "Watch"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreamCard;

export const StreamCardSkeleton = () => {
  return (
    <div className="p-2.5 w-[298px] gap-4 flex-shrink-0 justify-between mr-4 mb-4 border border-black rounded-md">
      <div className="p-0 relative">
        <Skeleton className="w-[270px] h-[152px]" />
        <Skeleton className="w-[100px] h-[20px] rounded-base mt-2" />
      </div>
      <div className="p-0 mt-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Skeleton className="w-[30px] h-[30px] rounded-full" />
            <div className="flex flex-col flex-1">
              <Skeleton className="w-[100px] h-[20px] rounded-base" />
              <Skeleton className="w-[100px] h-[20px] rounded-base mt-2" />
            </div>
          </div>
          <Skeleton className="w-[100px] h-[30px] rounded-base" />
        </div>
      </div>
    </div>
  );
};
