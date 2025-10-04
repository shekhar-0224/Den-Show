"use client";

import { type Preloaded, usePreloadedQuery, useQuery } from "convex/react";
import { motion } from "motion/react";
import { useState } from "react";
import { useMobile } from "~/app/_hooks/useMobile";
import { api } from "../../../../convex/_generated/api";
import SideDrawer from "../LiveStream/SideDrawer";
import StreamDetails from "../LiveStream/StreamDetails";
import MuxPlayerComponent from "./MuxPlayer";

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

  const isMyStream = myChannel?._id === streamData.channel._id;

  return (
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
          <div className="w-full 2xl:w-3/4 mx-auto aspect-video relative">
            <MuxPlayerComponent
              title={streamData.stream.title}
              streamId={streamData.stream._id}
              playbackId={
                streamData.stream.playbackId ?? streamData.channel.playbackId
              }
              isMyStream={isMyStream}
              rtmpUrl="rtmp://global-live.mux.com:5222/app"
              streamKey={myChannel?.creds?.muxStreamKey ?? ""}
            />
          </div>

          <StreamDetails streamId={streamData.stream._id} />
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
  );
};

export default WatchContent;
