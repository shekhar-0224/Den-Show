"use client";

import { useQuery } from "convex/react";
import Image from "next/image";
import { api } from "../../../../convex/_generated/api";
import BuyFanPassTrigger from "../common/FanPass/BuyFanPassTrigger";
import SendTipTrigger from "../common/TipStreamer/SendTipTrigger";
import ChannelStreams from "./ChannelStreams";

interface ChannelWrapperProps {
  handle: string;
}

const ChannelWrapper = ({ handle }: ChannelWrapperProps) => {
  const channel = useQuery(api.channel.getChannelByHandle, { handle });

  // TODO: Add skeleton loading

  if (!channel) return null;

  return (
    <div>
      <div className="flex flex-col">
        <div className="w-full relative h-[180px]">
          {channel.bannerPicUrl ? (
            <Image
              src={channel.bannerPicUrl}
              width={0}
              height={0}
              alt={channel.name}
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
              src={channel.profilePicUrl ?? "/images/default-channel-logo.png"}
              width={112}
              height={112}
              alt={channel.name}
              className="object-cover rounded-full"
            />
          </div>

          <div className="flex flex-col flex-1">
            <div className="text-2xl font-cream-medium">{channel.name}</div>
            <div className="font-medium text-sm flex items-center gap-2 mt-2">
              <div className="">@{handle}</div>
              {channel.user?.loginMethod === "x" && (
                <div className="border-l border-dashed border-black pl-2">
                  X {` @${channel.user.username}`}
                </div>
              )}
              {channel.user?.loginMethod === "farcaster" && (
                <div className="border-l border-dashed border-black pl-2">
                  Farcaster{` @${channel.user.username}`}
                </div>
              )}
            </div>
            <div className="text-sm mt-1.5">{channel.bio}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="text-sm border-r border-dashed border-black pr-2">
                Fans {/* TODO: update this */}
                <span className="font-cream-medium text-base">{0}</span>
              </div>
              <div className="text-sm">
                Videos {/* TODO: update this */}
                <span className="font-cream-medium text-base">{0}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <SendTipTrigger
                variant="primary"
                side="bottom"
                channelHandle={handle}
                channelPfp={channel.profilePicUrl}
                // streamerAddress={channel.user.walletAddress}
                streamerAddress={"0xGG"} // TODO: fix this
                channelId={channel._id}
                creatorTokenSymbol={channel.token.symbol}
                creatorTokenAddress={channel.token.address}
              />
              <BuyFanPassTrigger
                channelHandle={handle}
                channelName={channel.name}
                channelProfileUrl={
                  channel.profilePicUrl ?? "/images/default-channel-logo.png"
                }
                creatorTokenSymbol={channel.token.symbol}
                variant="primary"
              />
            </div>
          </div>
        </div>
      </div>
      <ChannelStreams channelId={channel._id} handle={handle} />
    </div>
  );
};

export default ChannelWrapper;
