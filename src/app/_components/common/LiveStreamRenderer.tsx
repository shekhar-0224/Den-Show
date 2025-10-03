import MuxPlayerComponent from "./MuxPlayer";

interface LiveStreamRendererProps {
  streamId: string;
  playbackId: string;
}

const LiveStreamRenderer = ({
  streamId,
  playbackId,
}: LiveStreamRendererProps) => {
  return (
    <div className="w-full h-full">
      <MuxPlayerComponent
        playbackId={playbackId}
        streamId={streamId}
        title="Demo Live Stream"
        className="w-full h-full rounded-lg"
      />
    </div>
  );
};

export default LiveStreamRenderer;
