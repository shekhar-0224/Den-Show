"use client";

import MuxPlayer from "@mux/mux-player-react";

interface MuxPlayerProps {
  playbackId: string;
  streamId: string;
  title?: string;
  className?: string;
}

const MuxPlayerComponent = ({ 
  playbackId, 
  streamId, 
  title = "Live Stream",
  className = "w-full h-full"
}: MuxPlayerProps) => {
  return (
    <div className={className}>
      <MuxPlayer
        playbackId={playbackId}
        streamType="live"
        metadata={{
          video_title: title,
          video_id: streamId,
        }}
        autoPlay
        muted={false}
        className="w-full h-full rounded-lg"
        style={{
          aspectRatio: "16/9",
        }}
      />
    </div>
  );
};

export default MuxPlayerComponent;
