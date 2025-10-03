"use client";
import MuxPlayer from "@mux/mux-player-react";

interface MuxPlayerProps {
  playbackId: string;
  streamId: string;
  title: string;
  className?: string;
}

const MuxPlayerComponent = ({
  playbackId,
  streamId,
  title,
  className = "w-full h-full",
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
        controls // This enables the default controls including progress bar
        className="w-full h-full rounded-lg"
        style={{
          aspectRatio: "16/9",
        }}
      />
      <style jsx>{`
        /* Custom styling for the progress bar */
        mux-player::part(media-time-range) {
          --media-time-range-buffered-color: rgba(255, 255, 255, 0.3);
          --media-time-range-played-color: #3b82f6;
          --media-time-range-knob-color: #3b82f6;
          --media-time-range-knob-focus-color: #1d4ed8;
        }
        
        mux-player::part(media-time-range-bar) {
          height: 4px;
          border-radius: 2px;
        }
        
        mux-player::part(media-time-range-knob) {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default MuxPlayerComponent;
