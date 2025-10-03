import { motion } from "motion/react";
import { useState } from "react";
import { useMobile } from "~/app/_hooks/useMobile";
import SideDrawer from "../LiveStream/SideDrawer";
import StreamDetails from "../LiveStream/StreamDetails";
import HlsPlayer from "./HlsPlayer";
import LiveStreamRenderer from "./LiveStreamRenderer";
import type { WatchProps } from "./WatchWrapper";

const WatchContent = (props: WatchProps) => {
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(true);
  const { isMobile } = useMobile();

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
          <div className="w-full 2xl:w-3/4 mx-auto aspect-video">
            {props.hlsUrl ? (
              <div className="w-full h-full">
                <HlsPlayer
                  src={props.hlsUrl}
                  controls
                  muted={false}
                  absStart={props.absStart}
                  absEnd={props.absEnd}
                />
              </div>
            ) : (
              <LiveStreamRenderer
                streamId={props.streamId}
                demoPlaybackId={props.demoPlaybackId}
              />
            )}
          </div>

          <StreamDetails {...props} />
        </div>
      </motion.div>
      <SideDrawer
        isSideDrawerOpen={isSideDrawerOpen}
        setIsSideDrawerOpen={setIsSideDrawerOpen}
        streamId={props.streamId}
        creatorTokenSymbol={props.channel.creatorTokenSymbol}
        creatorTokenAddress={props.channel.creatorTokenAddress}
        type={props.type}
      />
    </div>
  );
};

export default WatchContent;
