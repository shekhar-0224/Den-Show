"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

interface UpcomingEventCardProps {
  title: string;
  username: string;
  handle: string;
  thumbnail: string;
  creatorPfp: string;
  className?: string;
  streamId: string;
  scheduledTime: Date;
  views: number;
}

const UpcomingEventCard = ({
  title,
  username,
  handle,
  thumbnail,
  className,
  creatorPfp,
  streamId,
  scheduledTime,
  views,
}: UpcomingEventCardProps) => {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState("");

  const calculateTimeLeft = useCallback(() => {
    const now = new Date();
    const diff = scheduledTime.getTime() - now.getTime();

    if (diff <= 0) {
      setTimeLeft("Starting now");
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) {
      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    } else if (hours > 0) {
      setTimeLeft(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    } else {
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }
  }, [scheduledTime]);

  useEffect(() => {
    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [calculateTimeLeft]);

  const goToEvent = () => {
    router.push(`/watch/${streamId}`);
  };

  return (
    <Card
      className={cn(
        "p-1.5 w-[240px] h-[220px] gap-2 flex-shrink-0 justify-between transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none border",
        className
      )}
    >
      <CardContent className="p-0 h-full flex flex-col">
        {/* Thumbnail with Starts in counter */}
        <div className="relative w-[220px] h-[130px] overflow-hidden mx-auto">
          <Image
            src={thumbnail}
            alt={title}
            width={220}
            height={130}
            className="object-cover w-full h-full"
            sizes="220px"
          />
          
          {/* Starts in counter */}
          <div className="absolute top-1.5 right-1.5 bg-black rounded-md px-2 py-1 flex items-center gap-1">
            <Image
              src="/icons/clockwhite.svg"
              alt="Clock"
              width={12}
              height={12}
            />
            <span className="text-white text-xs font-medium">
              Starts in {timeLeft}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between p-2">
          <div className="flex-1">
            <h3 className="text-sm font-medium line-clamp-2 mb-2">
              {title}
            </h3>
          </div>

          {/* Bottom section with profile and notification */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Image
                src={creatorPfp}
                alt={username}
                width={20}
                height={20}
                className="rounded-full"
              />
              <div className="flex flex-col">
                <span className="text-xs font-medium">{username}</span>
                <span className="text-xs text-gray-500">@{handle}</span>
              </div>
            </div>
            
            {/* Notification icon instead of play button */}
            <button
              onClick={goToEvent}
              className="w-7 h-7 flex items-center justify-center hover:scale-105 transition-transform"
            >
              <Image
                src="/icons/notif.svg"
                alt="Notification"
                width={20}
                height={24}
              />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const UpcomingEventCardSkeleton = () => (
  <Card className="p-1.5 w-[240px] h-[220px] gap-2 flex-shrink-0 border">
    <CardContent className="p-0 h-full flex flex-col">
      <Skeleton className="w-[220px] h-[130px] mx-auto" />
      <div className="flex-1 flex flex-col justify-between p-2">
        <Skeleton className="h-8 w-full mb-2" />
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
          <Skeleton className="w-7 h-7 rounded-full" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default UpcomingEventCard;
