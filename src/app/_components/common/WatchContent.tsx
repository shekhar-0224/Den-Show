"use client";

import { type Preloaded, usePreloadedQuery, useQuery } from "convex/react";
import { motion } from "motion/react";
import { useState } from "react";
import { useMobile } from "~/app/_hooks/useMobile";
import { api } from "../../../../convex/_generated/api";
import SideDrawer from "../LiveStream/SideDrawer";
import StreamDetails from "../LiveStream/StreamDetails";
import MuxPlayerComponent from "./MuxPlayer";
import { StreamProvider, type StreamData } from "./StreamContext";

const WatchContent = ({
  preLoadedStream,
}: {
  preLoadedStream: Preloaded<typeof api.stream.getStream>;
}) => {
  const streamData = usePreloadedQuery(preLoadedStream);
  const myChannel = useQuery(api.channel.getMyChannel);

  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(true);
  const { isMobile } = useMobile();

  if (!streamData) return <div>Stream not found</div>;

  const isMyStream = streamData.channel._id === myChannel?._id;

  // Debug logging to show viewer vs streamer
  console.log("WatchContent - isMyStream:", isMyStream);
  console.log("WatchContent - Channel ID:", streamData.channel._id);
  console.log("WatchContent - My Channel ID:", myChannel?._id);
  console.log("WatchContent - View Type:", isMyStream ? "STREAMER VIEW" : "VIEWER VIEW");

  // Create streamData object for StreamContext
  const contextStreamData: StreamData = {
    streamId: streamData.stream._id,
    streamTitle: streamData.stream.title,
    streamDescription: streamData.stream.description,
    streamUrl: undefined, // Not available for Mux streams
    streamKey: undefined, // Not available for Mux streams
    demoPlaybackId: streamData.stream.playbackId ?? streamData.channel.playbackId,
    isDashboard: isMyStream, // Use isMyStream to determine if this is the streamer's view
    type: "live",
    channel: {
      name: streamData.channel.name,
      profileUrl: streamData.channel.profilePicUrl,
      handle: streamData.channel.handle,
      bio: streamData.channel.bio,
      id: streamData.channel._id,
      createdAt: streamData.channel._creationTime,
      creatorTokenSymbol: streamData.channel.token.symbol,
      creatorTokenAddress: streamData.channel.token.address,
      user: {
        denWalletAddress: "", // This might need to be fetched separately
      },
    },
  };

  return (
    <StreamProvider streamData={contextStreamData}>
      <div className="bg-black text-white h-full p-4 flex flex-col md:flex-row gap-4 overflow-hidden">
      <motion.div
        className="flex-1 overflow-scroll"
        animate={{
          width: isMobile ? "100%" : isSideDrawerOpen ? "75%" : "100%",
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
      >
        <div className="mac-13:h-[111%] mac-13:w-[111%] mac-13:origin-[0%_0%] mac-13:scale-[0.9]">
          <div className="w-full 2xl:w-3/4 mx-auto aspect-video">
            <MuxPlayerComponent
              title={streamData.stream.title}
              streamId={streamData.stream._id}
              playbackId={
                streamData.stream.playbackId ?? streamData.channel.playbackId
              }
            />
          </div>

          <StreamDetails />
        </div>
      </motion.div>
      <SideDrawer
        isSideDrawerOpen={isSideDrawerOpen}
        setIsSideDrawerOpen={setIsSideDrawerOpen}
        streamId={streamData.stream._id}
        creatorTokenSymbol={streamData.channel.token.symbol}
        creatorTokenAddress={streamData.channel.token.address}
        type="live"
      />
      </div>
    </StreamProvider>
  );
};

export default WatchContent;
