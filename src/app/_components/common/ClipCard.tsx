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

interface ClipCardProps {
  title: string;
  username: string;
  handle: string;
  thumbnail: string;
  creatorPfp: string;
  className?: string;
  clipId: string;
  views: number;
  hlsUrl?: string;
}

const HOVER_DELAY_MS = 150;

const ClipCard = ({
  title,
  username,
  handle,
  thumbnail,
  className,
  creatorPfp,
  clipId,
  views,
  hlsUrl,
}: ClipCardProps) => {
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
    router.push(`/clip/${clipId}`);
  };

  return (
    <Card
      className={cn(
        "p-1.5 w-[183px] h-[303px] gap-2 flex-shrink-0 justify-between transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none border",
        className,
      )}
    >
      <CardHeader className="p-0 relative">
        <div
          className="relative w-[171px] h-[240px] overflow-hidden mx-auto"
          onMouseEnter={hlsUrl ? onEnter : undefined}
          onMouseLeave={hlsUrl ? onLeave : undefined}
        >
          <Image
            src={thumbnail}
            alt="Thumbnail"
            width={171}
            height={240}
            className={cn(
              "object-cover transition-opacity duration-150",
              showPreview ? "opacity-0" : "opacity-100",
            )}
            style={{ width: 171, height: 240 }}
            priority={false}
          />

          {showPreview && hlsUrl ? (
            <div
              className="absolute inset-0 z-10 cursor-pointer"
              onClick={goWatch}
            >
              <HlsPlayer src={hlsUrl} autoPlay muted />
            </div>
          ) : null}

          {/* Title overlay on thumbnail */}
          <div className="absolute bottom-0 left-0 right-0 text-white p-2 z-10">
            <div className="text-xs font-semibold line-clamp-2">{title}</div>
          </div>

          {/* Badges Container - Right side only */}
          <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-20">
            {viewsBadge}
            {boostBadge}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex justify-between items-center p-2">
          <Link href={`/${handle}`}>
            <div className="flex items-center gap-1">
              <Image
                src={creatorPfp}
                alt="Creator"
                width={16}
                height={16}
                className="rounded-full"
              />
              <div className="text-xs font-cream-regular">@{handle}</div>
            </div>
          </Link>
          
          <div className="flex items-center gap-1">
            {/* Square button */}
            <button
              onClick={goWatch}
              className="w-6 h-6 bg-white flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <div className="w-3 h-3 bg-black"></div>
            </button>
            
            {/* Play button - same as StreamCard */}
            <button
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
        </div>
      </CardContent>
    </Card>
  );
};

export default ClipCard;

export const ClipCardSkeleton = () => {
  return (
    <div className="p-1.5 w-[183px] h-[303px] gap-2 flex-shrink-0 justify-between mr-4 mb-4 border border-black rounded-md">
      <div className="p-0 relative">
        <Skeleton className="w-[171px] h-[240px]" />
        <Skeleton className="w-[120px] h-[12px] rounded-base mt-2" />
      </div>
      <div className="p-0">
        <div className="flex justify-between items-center p-2">
          <div className="flex items-center gap-1">
            <Skeleton className="w-[16px] h-[16px] rounded-full" />
            <Skeleton className="w-[60px] h-[12px] rounded-base" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="w-[24px] h-[24px] rounded" />
            <Skeleton className="w-[28px] h-[28px] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};