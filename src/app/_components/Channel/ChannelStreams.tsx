import React from "react";
// tRPC removed - using dummy data instead
import StreamCard, { StreamCardSkeleton } from "../common/StreamCard";

interface ChannelStreamsProps {
  channelId: string;
}

const ChannelStreams = ({ channelId }: ChannelStreamsProps) => {
  // Dummy query for channel.getPublicChannelStreams.useQuery({ channelId })
  const data, isLoading = { data: [], isLoading: false, error: null };

  if (isLoading) {
    return (
      <div className="pl-6 mt-10 w-full flex">
        {Array.from({ length: 4 }, (_, index) => (
          <StreamCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (streams && streams.length > 0) {
    return (
      <div className="pl-6 mt-10 flex flex-wrap">
        {streams.map((stream) => (
          <StreamCard
            key={stream.streamId}
            streamId={stream.streamId}
            title={stream.title}
            username={stream.channelName}
            handle={stream.channelHandle}
            thumbnail={stream.thumbnailUrl ?? "/images/default-thumbnail.png"}
            creatorPfp={
              stream.channelProfileUrl ?? "/images/default-channel-logo.png"
            }
            className="mr-4 mb-4"
            isLive={!stream.endedAt}
            views={stream.views}
            hlsUrl={`https://cdn.den.show/${stream.streamId}.m3u8`}
            didntStart={!stream.startedAt}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-lg font-semibold font-cream-medium">
        No streams found
      </div>
    </div>
  );
};

export default ChannelStreams;
