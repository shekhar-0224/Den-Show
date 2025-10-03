"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useMobile } from "~/app/_hooks/useMobile";
import { Button } from "~/components/ui/button";
import BuyFanPassTrigger from "../common/FanPass/BuyFanPassTrigger";
import SendTipTrigger from "../common/TipStreamer/SendTipTrigger";
import { useStreamData } from "../common/StreamContext";
import ChannelDetails from "./ChannelDetails";
import ClipButton from "./ClipButton";
import CreatorTokenStats from "./CreatorTokenStats";
import LiveStreamControls from "./StreamControls";

const StreamDetails = () => {
  const { streamData } = useStreamData();
  const {
    streamId,
    streamTitle,
    streamDescription,
    streamUrl,
    streamKey,
    isDashboard,
    channel,
    type,
  } = streamData;
  const [isStreamUrlVisible, setIsStreamUrlVisible] = useState(false);
  const [isStreamKeyVisible, setIsStreamKeyVisible] = useState(false);
  const { isMobile } = useMobile();

  return (
    <div className="px-2">
      <div className="flex items-center gap-4 mt-4">
        <div>
          <Link href={`/${channel.handle}`}>
            <Image
              src={channel.profileUrl ?? "/images/default-channel-logo.png"}
              alt="channel profile"
              width={isMobile ? 40 : 60}
              height={isMobile ? 40 : 60}
              className="object-cover rounded-full"
            />
          </Link>
        </div>
        <div className="flex-1">
          <div className="text-sm md:text-lg font-cream-medium">
            {streamTitle}
          </div>
          <div className="text-xs md:text-sm">{streamDescription}</div>
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-4">
              {streamUrl && (
                <div className="flex items-center gap-2">
                  <div className="font-cream-medium">
                    {isStreamUrlVisible ? streamUrl : "RTMP URL"}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(streamUrl);
                      toast.success("Copied Stream URL to clipboard");
                    }}
                    className="cursor-pointer"
                  >
                    <Image
                      src="/icons/copy.svg"
                      alt="copy"
                      width={14}
                      height={15}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsStreamUrlVisible(true);
                      setTimeout(() => {
                        setIsStreamUrlVisible(false);
                      }, 3000);
                    }}
                    className="cursor-pointer"
                  >
                    <Image
                      src="/icons/eye-hidden.svg"
                      alt="show"
                      width={14}
                      height={15}
                    />
                  </button>
                </div>
              )}
              {streamKey && (
                <div className="flex items-center gap-2">
                  <div className="font-cream-medium">
                    {isStreamKeyVisible ? streamKey : "Stream Key"}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(streamKey);
                      toast.success("Copied Stream Key to clipboard");
                    }}
                    className="cursor-pointer"
                  >
                    <Image
                      src="/icons/copy.svg"
                      alt="copy"
                      width={14}
                      height={15}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsStreamKeyVisible(true);
                      setTimeout(() => {
                        setIsStreamKeyVisible(false);
                      }, 3000);
                    }}
                    className="cursor-pointer"
                  >
                    <Image
                      src="/icons/eye-hidden.svg"
                      alt="show"
                      width={14}
                      height={15}
                    />
                  </button>
                </div>
              )}
              {!isDashboard && (
                <div className="flex items-center gap-2">
                  <Link href={`/${channel.handle}`}>
                    <div className="text-sm md:text-base font-cream-medium border-dotted border-b border-white">
                      @{channel.handle}
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          {isDashboard ? (
            <div className="flex items-center gap-2">
              <ClipButton
                hlsUrl={`https://cdn.den.show/${streamId}.m3u8`}
                streamId={streamId}
              />
              <Button
                variant="inverted"
                onClick={() => {
                  toast.success("Coming soon");
                }}
              >
                Share Stream
              </Button>
            </div>
          ) : (
            <>
              {!isDashboard && (
                <div className="flex items-center gap-2">
                  <ClipButton
                    hlsUrl={`https://cdn.den.show/${streamId}.m3u8`}
                    streamId={streamId}
                  />
                  <SendTipTrigger
                    channelPfp={channel.profileUrl}
                    channelHandle={channel.handle}
                    streamId={streamId}
                    streamerAddress={channel.user.denWalletAddress}
                    channelId={channel.id}
                    creatorTokenSymbol={channel.creatorTokenSymbol}
                    creatorTokenAddress={channel.creatorTokenAddress}
                    isLive={type === "live"}
                  />
                  <BuyFanPassTrigger
                    channelHandle={channel.handle}
                    channelName={channel.name}
                    channelProfileUrl={
                      channel.profileUrl ?? "/images/default-channel-logo.png"
                    }
                    creatorTokenSymbol={channel.creatorTokenSymbol}
                    variant="inverted"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {/* {type !== "clip" && !isMobile && (
        <CreatorTokenStats tokenAddress={channel.creatorTokenAddress} />
      )} */}
      {isDashboard ? (
        <LiveStreamControls streamId={streamId} />
      ) : (
        <ChannelDetails channel={channel} />
      )}
    </div>
  );
};

export default StreamDetails;
