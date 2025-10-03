import MuxPlayerComponent from "./MuxPlayer";

interface LiveStreamRendererProps {
  streamId: string;
  demoPlaybackId?: string;
}

const LiveStreamRenderer = ({
  streamId,
  demoPlaybackId,
}: LiveStreamRendererProps) => {
  return (
    <div className="w-full h-full">
      <MuxPlayerComponent
        playbackId={demoPlaybackId || "DS00Spx1CV902MCtPj5WknGlR102V5HFkDe"}
        streamId={streamId}
        title="Demo Live Stream"
        className="w-full h-full rounded-lg"
      />
    </div>
  );
};

export default LiveStreamRenderer;
