"use client";

import { useQuery } from "convex/react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useMobile } from "~/app/_hooks/useMobile";
import { Button } from "~/components/ui/button";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import BuyFanPassTrigger from "../common/FanPass/BuyFanPassTrigger";
import { useStreamData } from "../common/StreamContext";
import SendTipTrigger from "../common/TipStreamer/SendTipTrigger";
import ChannelDetails from "./ChannelDetails";
import ClipButton from "./ClipButton";
import CreatorTokenStats from "./CreatorTokenStats";
import LiveStreamControls from "./StreamControls";

const StreamDetails = ({ streamId }: { streamId: Id<"streams"> }) => {
  const [isStreamUrlVisible, setIsStreamUrlVisible] = useState(false);
  const [isStreamKeyVisible, setIsStreamKeyVisible] = useState(false);
  const { isMobile } = useMobile();
  const streamData = useQuery(api.stream.getStream, {
    streamId,
  });
  const myChannel = useQuery(api.channel.getMyChannel);

  if (!streamData) return null;

  const isMyStream = streamData.channel._id === myChannel?._id;

  return (
    <div className="px-2">
      <div className="flex items-center gap-4 mt-4">
        <div>
          <Link href={`/${streamData.channel.handle}`}>
            <Image
              src={
                streamData.channel.profilePicUrl ??
                "/images/default-channel-logo.png"
              }
              alt="channel profile"
              width={isMobile ? 40 : 60}
              height={isMobile ? 40 : 60}
              className="object-cover rounded-full"
            />
          </Link>
        </div>
        <div className="flex-1">
          <div className="text-sm md:text-lg font-cream-medium">
            {streamData.stream.title}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-white text-sm underline decoration-dotted font-cream-regular">
              @{streamData.channel.handle}
            </span>
            <div className="w-px h-4 bg-white border-dashed border-l"></div>
            <div className="flex items-center gap-1">
              <span className="text-white text-sm font-instrument-sans">
                Fans
              </span>
              <span className="text-white text-sm font-cream-medium">121</span>
            </div>
            <div className="w-px h-4 bg-white border-dashed border-l"></div>
            <div className="flex items-center gap-2">
              <div
                className="text-black px-3 py-1 rounded text-sm font-instrument-sans font-semibold"
                style={{ backgroundColor: "#B3D4DC" }}
              >
                {streamData.channel.name}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://den.show/${streamData.channel.handle}`
                  );
                  toast.success("Channel link copied to clipboard");
                }}
                className="w-4 h-4 flex items-center justify-center"
              >
                <Image
                  src="/icons/copy.svg"
                  alt="Copy Channel Link"
                  width={12}
                  height={12}
                  className="text-white"
                />
              </button>
            </div>
            <div className="w-px h-4 bg-white border-dashed border-l"></div>
            <div className="flex items-center gap-1">
              <span className="text-white text-sm font-instrument-sans">
                Mcap
              </span>
              <span className="text-white text-sm font-cream-medium">
                $13.7M
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-4">
              {isMyStream && (
                <div className="flex items-center gap-2">
                  <div className="font-cream-medium">
                    {isStreamUrlVisible
                      ? "rtmp://global-live.mux.com:5222/app"
                      : "RTMP URL"}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        "rtmp://global-live.mux.com:5222/app"
                      );
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
              {isMyStream && (
                <div className="flex items-center gap-2">
                  <div className="font-cream-medium">
                    {isStreamKeyVisible
                      ? myChannel.creds?.muxStreamKey
                      : "Stream Key"}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        myChannel.creds?.muxStreamKey ?? ""
                      );
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
            </div>
          </div>
        </div>
        <div>
          {isMyStream ? (
            <div className="flex items-center justify-between">
              {/* Left side - Channel Profile Picture and Info */}
              <div className="flex items-center gap-4">
                {streamData.channel.profilePicUrl && (
                  <Image
                    src={streamData.channel.profilePicUrl}
                    alt={streamData.channel.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}

                {/* Channel details */}
              </div>

              {/* Right side - Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="inverted"
                  onClick={() => {
                    toast.success("Coming soon");
                  }}
                >
                  <Image
                    src="/icons/scissors.svg"
                    alt="Clip"
                    width={16}
                    height={16}
                    className="mr-2"
                  />
                  Clip
                </Button>
                <Button
                  variant="inverted"
                  onClick={() => {
                    toast.success("Coming soon");
                  }}
                >
                  Share Stream
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              {/* Left side - Channel Profile Picture */}
              <div className="flex items-center gap-4">
                {streamData.channel.profilePicUrl && (
                  <Image
                    src={streamData.channel.profilePicUrl}
                    alt={streamData.channel.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
              </div>

              {/* Right side - Action Buttons */}
              <div className="flex items-center gap-3">
                {/* Tip Button */}
                <button className="flex items-center gap-3 bg-black border border-white text-white px-4 py-2 rounded shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,1)] transition-all cursor-pointer">
                  <div className="w-6 h-6 border border-white rounded-full flex items-center justify-center relative">
                    <span className="text-white font-bold text-sm">$</span>
                    <div className="absolute -top-1 -right-1 w-1 h-1 bg-white transform rotate-45"></div>
                    <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-white transform rotate-45"></div>
                  </div>
                  <span className="text-white font-medium">Tip</span>
                </button>

                {/* Boost Button */}
                <button className="flex items-center gap-3 bg-black border border-white text-white px-4 py-2 rounded shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,1)] transition-all cursor-pointer">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <Image
                      src="/icons/boost.svg"
                      alt="Boost"
                      width={16}
                      height={16}
                      className="text-white"
                    />
                  </div>
                  <span className="text-white font-medium">Boost</span>
                </button>

                {/* Clip Button */}
                <button className="flex items-center gap-3 bg-black border border-white text-white px-4 py-2 rounded shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,1)] transition-all cursor-pointer">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <Image
                      src="/icons/scissors.svg"
                      alt="Clip"
                      width={16}
                      height={16}
                      className="text-white"
                    />
                  </div>
                  <span className="text-white font-medium">Clip</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* {type !== "clip" && !isMobile && (
        <CreatorTokenStats tokenAddress={channel.creatorTokenAddress} />
      )} */}

      {/* Stream Control Buttons */}
      <div className="mt-6 flex items-center justify-between gap-12">
        {isMyStream ? (
          <>
            {/* RTMP and Stream Key Container */}
            <div className="flex items-center gap-8">
              {/* RTMP Section */}
              <div className="flex items-center gap-4">
                <span className="font-cream-medium text-white text-lg">
                  rtmp://global-live.mux.com:5222/app
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        "rtmp://global-live.mux.com:5222/app"
                      );
                      toast.success("RTMP url copied to clipboard");
                    }}
                    className="w-6 h-6 flex items-center justify-center"
                  >
                    <Image
                      src="/icons/copy.svg"
                      alt="Copy"
                      width={16}
                      height={16}
                      className="text-white"
                    />
                  </button>
                  <button
                    onClick={() => {
                      // Toggle visibility logic would go here
                      toast.success("Visibility toggled");
                    }}
                    className="w-6 h-6 flex items-center justify-center"
                  >
                    <Image
                      src="/icons/eye-hidden.svg"
                      alt="Toggle Visibility"
                      width={16}
                      height={16}
                      className="text-white"
                    />
                  </button>
                </div>
              </div>

              {/* Vertical Separator */}
              <div className="w-px h-8 bg-white border-dashed border-l"></div>

              {/* Stream Key Section */}
              <div className="flex items-center gap-4">
                <span className="font-cream-medium text-white text-lg">
                  StreamKey
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        myChannel.creds?.muxStreamKey ?? "your-stream-key"
                      );
                      toast.success("Stream key copied to clipboard");
                    }}
                    className="w-6 h-6 flex items-center justify-center"
                  >
                    <Image
                      src="/icons/copy.svg"
                      alt="Copy"
                      width={16}
                      height={16}
                      className="text-white"
                    />
                  </button>
                  <button
                    onClick={() => {
                      // Toggle visibility logic would go here
                      toast.success("Visibility toggled");
                    }}
                    className="w-6 h-6 flex items-center justify-center"
                  >
                    <Image
                      src="/icons/eye-hidden.svg"
                      alt="Toggle Visibility"
                      width={16}
                      height={16}
                      className="text-white"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Stream Control Buttons Container */}
            <div className="flex items-center gap-4">
              {/* Pause Stream Button */}
              <button
                onClick={() => {
                  toast.success("Stream paused");
                }}
                className="flex items-center gap-3 border border-white text-white px-6 py-3 rounded-lg shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,1)] transition-all"
                style={{ backgroundColor: "#9ED7E0" }}
              >
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <div className="w-2 h-3 flex gap-0.5">
                    <div
                      className="w-0.5 h-full"
                      style={{ backgroundColor: "#9ED7E0" }}
                    ></div>
                    <div
                      className="w-0.5 h-full"
                      style={{ backgroundColor: "#9ED7E0" }}
                    ></div>
                  </div>
                </div>
                <span className="font-semibold text-sm uppercase">
                  PAUSE STREAM
                </span>
              </button>

              {/* End Stream Button */}
              <button
                onClick={() => {
                  toast.success("Stream ended");
                }}
                className="flex items-center gap-3 border border-white text-white px-6 py-3 rounded-lg shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,1)] transition-all"
                style={{ backgroundColor: "#B84944" }}
              >
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 relative">
                    <div
                      className="w-full h-2 rounded-t-full"
                      style={{ backgroundColor: "#B84944" }}
                    ></div>
                    <div
                      className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ backgroundColor: "#B84944" }}
                    ></div>
                    <div
                      className="absolute top-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-0.5 rounded-full"
                      style={{ backgroundColor: "#B84944" }}
                    ></div>
                  </div>
                </div>
                <span className="font-semibold text-sm uppercase">
                  END STREAM
                </span>
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default StreamDetails;
