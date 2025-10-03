"use client";

import { useQuery } from "convex/react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { api } from "../../../../convex/_generated/api";
import ChannelCircle, { ChannelCircleSkeleton } from "../common/ChannelCircle";

const TrendingChannels = () => {
  const trendingChannels = useQuery(api.channel.getTrendingChannels);

  const isLoading = trendingChannels === undefined;
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
  }, []);

  return (
    <div className="px-4 md:px-0 md:pl-6 mt-10">
      <div className="flex items-center justify-between md:pr-6">
        <div className="flex items-center gap-1">
          <span className="text-black font-semibold text-xl font-chromate tracking-tighter">
            Channels{" "}
          </span>
          <span className="text-xl font-semibold">Trending Now</span>
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
          {Array.from({ length: 5 }, (_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: this is fine here, data will not change
            <ChannelCircleSkeleton key={index} />
          ))}
        </div>
      ) : trendingChannels.length > 0 ? (
        <div
          ref={scrollContainerRef}
          className="w-full flex overflow-x-scroll overflow-y-visible mt-2 flex-wrap gap-4"
          style={{
            scrollbarWidth: "none",
          }}
        >
          {trendingChannels.map((channel) => (
            <ChannelCircle
              key={channel._id}
              id={channel._id}
              handle={channel.handle}
              profileUrl={channel.profilePicUrl}
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
