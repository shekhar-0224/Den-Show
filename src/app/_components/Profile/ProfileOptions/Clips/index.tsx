import React from "react";
import StreamCard from "~/app/_components/common/StreamCard";
import { api } from "~/trpc/react";

const Clips = () => {
  const { data: clips, isLoading } = api.clips.getClipsByUser.useQuery();

  if (isLoading)
    return (
      <div className="text-center text-sm font-medium mt-4">
        Fetching clips...
      </div>
    );

  if (!clips)
    return (
      <div className="text-center text-sm font-medium mt-4">
        No clips created yet
      </div>
    );

  return (
    <div className="pl-6 mt-6 flex flex-wrap">
      {clips.map((clip) => (
        <StreamCard
          key={clip.id}
          streamId={clip.streamId}
          title={clip.title}
          username={clip.stream.channel.name}
          handle={clip.stream.channel.handle}
          thumbnail={clip.thumbnailUrl ?? "/images/default-thumbnail.png"}
          creatorPfp={
            clip.stream.channel.profileUrl ?? "/images/default-channel-logo.png"
          }
          isLive={false}
          views={0}
          clipId={clip.id}
          className="mr-4 mb-4"
          hlsUrl={`https://cdn.den.show/${clip.streamId}.m3u8`}
        />
      ))}
    </div>
  );
};

export default Clips;
