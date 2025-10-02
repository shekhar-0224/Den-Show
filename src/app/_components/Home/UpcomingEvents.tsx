"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import UpcomingEventCard, { UpcomingEventCardSkeleton } from "../common/UpcomingEventCard";

const UpcomingEvents = () => {
  const { data: streams, isLoading } = api.stream.getLiveStreams.useQuery();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleWheel = (e: WheelEvent) => {
      const isOverflowing =
        scrollContainer.scrollWidth > scrollContainer.clientWidth;

      if (isOverflowing) {
        e.preventDefault();
        scrollContainer.scrollLeft += e.deltaY;
      }
    };

    const handleMouseEnter = () => {
      scrollContainer.addEventListener("wheel", handleWheel, {
        passive: false,
      });
    };

    const handleMouseLeave = () => {
      scrollContainer.removeEventListener("wheel", handleWheel);
    };

    scrollContainer.addEventListener("mouseenter", handleMouseEnter);
    scrollContainer.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      scrollContainer.removeEventListener("mouseenter", handleMouseEnter);
      scrollContainer.removeEventListener("mouseleave", handleMouseLeave);
      scrollContainer.removeEventListener("wheel", handleWheel);
    };
  }, [streams]);

  // Filter streams to only show upcoming ones (for now, we'll use all streams as upcoming)
  // In a real implementation, you'd filter by scheduled time
  const upcomingStreams = streams || [];

  return (
    <div className="px-4 md:px-0 md:pl-6 mt-10">
      <div className="flex items-center justify-between md:pr-6">
        <div className="flex items-center gap-1">
          <div>
            <span className="text-black font-semibold text-xl font-instrument-sans tracking-tighter">
              Upcoming Events{" "}
            </span>
            <Image
              src="/icons/clock.svg"
              alt="Clock"
              width={20}
              height={20}
              className="inline ml-1"
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="font-semibold text-lg">View All</div>
          <Image
            src="/icons/chevron-right.svg"
            alt="Chevron Right"
            width={9}
            height={14}
          />
        </div>
      </div>
      {isLoading ? (
        <div className="w-full flex mt-2">
          {Array.from({ length: 4 }, (_, index) => (
            <UpcomingEventCardSkeleton key={index} />
          ))}
        </div>
      ) : upcomingStreams && upcomingStreams.length > 0 ? (
        <div
          ref={scrollContainerRef}
          className="w-full flex overflow-x-scroll overflow-y-visible mt-2"
          style={{
            scrollbarWidth: "none",
          }}
        >
          {upcomingStreams.map((stream) => (
            <UpcomingEventCard
              key={stream.streamId}
              streamId={stream.streamId}
              title={stream.details.title}
              username={stream.details.channel.name}
              handle={stream.details.channel.handle}
              thumbnail={
                stream.details.thumbnailUrl ?? "/images/default-thumbnail.png"
              }
              creatorPfp={
                stream.details.channel.profileUrl ??
                "/images/default-channel-logo.png"
              }
              className="mr-4 mb-4"
              scheduledTime={new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000)} // Random time within next 7 days
              views={stream.views}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full mt-2">
          <div className="text-sm md:text-lg font-semibold font-cream-medium">
            No upcoming events scheduled
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingEvents;
