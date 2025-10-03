// tRPC removed - using dummy data instead
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import StreamCard, { StreamCardSkeleton } from "../common/StreamCard";

interface ChannelStreamsProps {
  channelId: Id<"channels">;
  handle: string;
}

const ChannelStreams = ({ channelId, handle }: ChannelStreamsProps) => {
  const streams = useQuery(api.stream.getStreamsByChannel, { channelId });
  const channel = useQuery(api.channel.getChannelByHandle, { handle });

  if (!streams || !channel) {
    return (
      <div className="pl-6 mt-10 w-full flex">
        {Array.from({ length: 4 }, (_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: its fine here
          <StreamCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (streams.length > 0) {
    return (
      <div className="pl-6 mt-10 flex flex-wrap">
        {streams.map((stream) => (
          <StreamCard
            key={stream._id}
            streamId={stream._id}
            title={stream.title}
            username={channel.name}
            handle={channel.handle}
            thumbnail={
              stream.thumbnailPicUrl ?? "/images/default-thumbnail.png"
            }
            creatorPfp={
              channel.profilePicUrl ?? "/images/default-channel-logo.png"
            }
            className="mr-4 mb-4"
            isLive={stream.state === "live"}
            views={0} // TODO: add view count
            hlsUrl={stream.playbackId ?? channel.playbackId}
            didntStart={stream.state === "scheduled"}
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
