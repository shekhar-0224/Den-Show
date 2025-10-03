import { motion } from "motion/react";
import { useState } from "react";
import { useMobile } from "~/app/_hooks/useMobile";
import SideDrawer from "../LiveStream/SideDrawer";
import StreamDetails from "../LiveStream/StreamDetails";
import HlsPlayer from "./HlsPlayer";
import LiveStreamRenderer from "./LiveStreamRenderer";
import { useStreamData } from "./StreamContext";

const WatchContent = () => {
  const { streamData } = useStreamData();
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
            {streamData.streamUrl ? (
              <div className="w-full h-full">
                <HlsPlayer
                  src={streamData.streamUrl}
                  controls
                  muted={false}
                  absStart={undefined}
                  absEnd={undefined}
                />
              </div>
            ) : (
              <LiveStreamRenderer
                streamId={streamData.streamId}
                demoPlaybackId={streamData.demoPlaybackId}
              />
            )}
          </div>

          <StreamDetails />
        </div>
      </motion.div>
      <SideDrawer
        isSideDrawerOpen={isSideDrawerOpen}
        setIsSideDrawerOpen={setIsSideDrawerOpen}
        streamId={streamData.streamId}
        creatorTokenSymbol={streamData.channel.creatorTokenSymbol}
        creatorTokenAddress={streamData.channel.creatorTokenAddress}
        type={streamData.type}
      />
    </div>
  );
};

export default WatchContent;
