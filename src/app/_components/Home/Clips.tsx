"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import ClipCard, { ClipCardSkeleton } from "../common/ClipCard";

const Clips = () => {
  // Dummy data for clips
  const streams = [
    {
      streamId: "clip1",
      details: {
        title: "Best React Hooks Explained",
        channel: {
          name: "ReactDev",
          handle: "reactdev",
          profileUrl: "/images/default-channel-logo.png"
        },
        thumbnailUrl: "/images/default-thumbnail.png"
      },
      views: 1234
    },
    {
      streamId: "clip2",
      details: {
        title: "Quick Cooking Tips",
        channel: {
          name: "QuickChef",
          handle: "quickchef",
          profileUrl: "/images/default-channel-logo.png"
        },
        thumbnailUrl: "/images/default-thumbnail.png"
      },
      views: 567
    },
    {
      streamId: "clip3",
      details: {
        title: "Gaming Highlights",
        channel: {
          name: "GameHighlights",
          handle: "gamehighlights",
          profileUrl: "/images/default-channel-logo.png"
        },
        thumbnailUrl: "/images/default-thumbnail.png"
      },
      views: 890
    }
  ];
  const isLoading = false;
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

  return (
    <div className="px-4 md:px-0 md:pl-6 mt-10">
      <div className="flex items-center justify-between md:pr-6">
        <div className="flex items-center gap-1">
          <div>
            <span className="text-xl font-semibold">Clips </span>
            <Image
              src="/icons/scissors.svg"
              alt="Scissors"
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
          {Array.from({ length: 7 }, (_, index) => (
            <ClipCardSkeleton key={index} />
          ))}
        </div>
      ) : streams && streams.length > 0 ? (
        <div
          ref={scrollContainerRef}
          className="w-full flex overflow-x-scroll overflow-y-visible mt-2"
          style={{
            scrollbarWidth: "none",
          }}
        >
          {streams.map((stream) => (
            <ClipCard
              key={stream.streamId}
              clipId={stream.streamId}
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
              views={stream.views}
              hlsUrl={`https://cdn.den.show/${stream.streamId}.m3u8`}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-sm md:text-lg font-semibold font-cream-medium">
            No clips found
          </div>
        </div>
      )}
    </div>
  );
};

export default Clips;
