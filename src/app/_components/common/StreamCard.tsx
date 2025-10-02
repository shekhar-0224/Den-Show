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

  const boostBadge = (
    <div className="bg-black text-white text-xs px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
      <Image
        src="/icons/boost.svg"
        alt="Boost"
        width={8}
        height={11}
      />
      <span className="font-instrument-sans font-semibold">100x</span>
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
        "p-1.5 w-[240px] h-[220px] gap-2 flex-shrink-0 justify-between transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none border",
        className,
      )}
    >
      <CardHeader className="p-0 relative">
        <div
          className="relative w-[220px] h-[130px] overflow-hidden mx-auto"
          onMouseEnter={hlsUrl && !didntStart ? onEnter : undefined}
          onMouseLeave={hlsUrl && !didntStart ? onLeave : undefined}
        >
          <Image
            src={thumbnail}
            alt="Thumbnail"
            width={220}
            height={130}
            className={cn(
              "object-cover transition-opacity duration-150",
              showPreview ? "opacity-0" : "opacity-100",
            )}
            style={{ width: 220, height: 130 }}
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

          {/* Badges Container */}
          <div className="absolute top-1.5 left-1.5 right-1.5 flex justify-between items-center z-20">
            {/* Left side - LIVE badge */}
            <div>
              {isLive && liveBadge}
            </div>
            
            {/* Right side - Views and Boost badges */}
            <div className="flex items-center gap-1">
              {!clipId && !didntStart && viewsBadge}
              {isLive && boostBadge}
            </div>
          </div>

        </div>

        <CardTitle className="font-semibold text-sm mt-1 ml-1 line-clamp-2">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex justify-between items-center">
          <Link href={`/${handle}`}>
            <div className="flex items-center gap-1">
              <Image
                src={creatorPfp}
                alt="Creator"
                width={20}
                height={20}
                className="rounded-full"
              />
              <div className="flex flex-col flex-1">
                <div className="text-xs underline font-cream-regular">@{handle}</div>
              </div>
            </div>
          </Link>
          <button
            disabled={didntStart}
            onClick={goWatch}
            className="w-7 h-7 bg-black rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform cursor-pointer"
          >
            <Image
              src="/icons/play.svg"
              alt="Play"
              width={9}
              height={9}
              className="ml-0.5"
            />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreamCard;

export const StreamCardSkeleton = () => {
  return (
    <div className="p-1.5 w-[240px] h-[220px] gap-2 flex-shrink-0 justify-between mr-4 mb-4 border border-black rounded-md">
      <div className="p-0 relative">
        <Skeleton className="w-[220px] h-[130px]" />
        <Skeleton className="w-[60px] h-[12px] rounded-base mt-1" />
      </div>
      <div className="p-0 mt-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <Skeleton className="w-[20px] h-[20px] rounded-full" />
            <div className="flex flex-col flex-1">
              <Skeleton className="w-[60px] h-[12px] rounded-base" />
              <Skeleton className="w-[60px] h-[10px] rounded-base mt-0.5" />
            </div>
          </div>
          <Skeleton className="w-[28px] h-[28px] rounded-full" />
        </div>
      </div>
    </div>
  );
};
