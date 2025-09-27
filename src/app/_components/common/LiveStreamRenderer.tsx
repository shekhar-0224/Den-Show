import {
  RoomAudioRenderer,
  TrackLoop,
  VideoTrack,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";

interface LiveStreamRendererProps {
  streamId: string;
}

const LiveStreamRenderer = ({ streamId }: LiveStreamRendererProps) => {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: true },
  ).filter((track) => track.participant.identity === streamId);

  return (
    <div className="w-full h-full">
      <div className="rounded-lg w-full h-full p-2">
        {tracks.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <div className="text-lg font-cream-medium text-white">
              Waiting for stream to start...
            </div>
          </div>
        ) : (
          <TrackLoop tracks={tracks}>
            <VideoTrack />
          </TrackLoop>
        )}
      </div>
      <RoomAudioRenderer />
    </div>
  );
};

export default LiveStreamRenderer;
