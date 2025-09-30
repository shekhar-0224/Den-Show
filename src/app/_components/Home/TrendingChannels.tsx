"use client";

import Image from "next/image";
import React, { useRef, useEffect } from "react";
import { api } from "~/trpc/react";
import ChannelCircle, { ChannelCircleSkeleton } from "../common/ChannelCircle";

const TrendingChannels = () => {
  const { data: channels, isLoading } =
    api.channel.getTrendingChannels.useQuery();
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
  }, [channels]);

  return (
    <div className="px-4 md:px-0 md:pl-6 mt-10">
      <div className="flex items-center justify-between md:pr-6">
        <div className="flex items-center gap-1">
        <span className="text-black font-semibold text-lg font-chromate tracking-tighter">
              Channels{" "}
            </span>
          <span className="text-lg font-semibold">Trending Now</span>
          <Image
            src="/icons/trending.svg"
            alt="Trending"
            width={16}
            height={16}
          />
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
        <div className="w-full flex mt-2 flex-wrap gap-4">
          {Array.from({ length: 11 }, (_, index) => (
            <ChannelCircleSkeleton key={index} />
          ))}
        </div>
      ) : channels && channels.length > 0 ? (
        <div
          ref={scrollContainerRef}
          className="w-full flex overflow-x-scroll overflow-y-visible mt-2 flex-wrap gap-4"
          style={{
            scrollbarWidth: "none",
          }}
        >
          {channels.map((channel) => (
            <ChannelCircle
              key={channel.id}
              id={channel.id}
              handle={channel.handle}
              profileUrl={channel.profileUrl}
              name={channel.name}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-sm md:text-lg font-semibold font-cream-medium">
            No channels found
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendingChannels;
