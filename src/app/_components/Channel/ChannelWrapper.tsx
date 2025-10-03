"use client";

import Image from "next/image";

// tRPC removed - using dummy data instead
import BuyFanPassTrigger from "../common/FanPass/BuyFanPassTrigger";
import SendTipTrigger from "../common/TipStreamer/SendTipTrigger";
import ChannelStreams from "./ChannelStreams";

interface ChannelWrapperProps {
  handle: string;
}

const ChannelWrapper = ({ handle }: ChannelWrapperProps) => {
  // Dummy query for channel.getPublicChannelDetails.useQuery({
    handle,
  })
  const data = { data: [], isLoading: false, error: null };

  // TODO: Add skeleton loading

  if (!channel) return null;

  const {
    channelId,
    bannerUrl,
    profileUrl,
    name,
    bio,
    user: { xHandle, farcasterHandle },
    fanCount,
    videos,
  } = channel;

  return (
    <div>
      <div className="flex flex-col">
        <div className="w-full relative h-[180px]">
          {bannerUrl ? (
            <Image
              src={bannerUrl}
              width={0}
              height={0}
              alt={name}
              sizes="100vw"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-primary" />
          )}
        </div>

        <div className="flex items-start gap-4 p-4">
          <div>
            <Image
              src={profileUrl ?? "/images/default-channel-logo.png"}
              width={112}
              height={112}
              alt={name}
              className="object-cover rounded-full"
            />
          </div>

          <div className="flex flex-col flex-1">
            <div className="text-2xl font-cream-medium">{name}</div>
            <div className="font-medium text-sm flex items-center gap-2 mt-2">
              <div className="">@{handle}</div>
              {xHandle && (
                <div className="border-l border-dashed border-black pl-2">
                  X {` @${xHandle}`}
                </div>
              )}
              {farcasterHandle && (
                <div className="border-l border-dashed border-black pl-2">
                  Farcaster{` @${farcasterHandle}`}
                </div>
              )}
            </div>
            <div className="text-sm mt-1.5">{bio}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="text-sm border-r border-dashed border-black pr-2">
                Fans{" "}
                <span className="font-cream-medium text-base">{fanCount}</span>
              </div>
              <div className="text-sm">
                Videos{" "}
                <span className="font-cream-medium text-base">{videos}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <SendTipTrigger
                variant="primary"
                side="bottom"
                channelHandle={handle}
                channelPfp={profileUrl}
                streamerAddress={channel.user.denWalletAddress}
                channelId={channelId}
                creatorTokenSymbol={channel.creatorTokenSymbol}
                creatorTokenAddress={channel.creatorTokenAddress}
              />
              <BuyFanPassTrigger
                channelHandle={handle}
                channelName={name}
                channelProfileUrl={
                  profileUrl ?? "/images/default-channel-logo.png"
                }
                creatorTokenSymbol={channel.creatorTokenSymbol}
                variant="primary"
              />
            </div>
          </div>
        </div>
      </div>
      <ChannelStreams channelId={channelId} />
    </div>
  );
};

export default ChannelWrapper;
