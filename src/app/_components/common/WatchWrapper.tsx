"use client";

import React from "react";
import LiveStreamWrapper from "../LiveStream/LiveStreamWrapper";
import WatchContent from "./WatchContent";
import { StreamProvider, type StreamData } from "./StreamContext";

export interface WatchProps {
  type: "live" | "vod" | "clip";
  hlsUrl?: string;
  absStart?: number;
  absEnd?: number;
  isDashboard: boolean;
  streamId: string;
  streamTitle: string;
  streamDescription?: string;
  streamUrl?: string;
  streamKey?: string;
  demoPlaybackId?: string;
  channel: {
    name: string;
    profileUrl: string | null;
    handle: string;
    bio: string | null;
    id: string;
    createdAt: Date;
    creatorTokenSymbol: string;
    creatorTokenAddress: string;
    user: {
      denWalletAddress: string;
    };
  };
}

const WatchWrapper = (props: WatchProps) => {
  const streamData: StreamData = {
    streamId: props.streamId,
    streamTitle: props.streamTitle,
    streamDescription: props.streamDescription,
    streamUrl: props.streamUrl,
    streamKey: props.streamKey,
    demoPlaybackId: props.demoPlaybackId,
    isDashboard: props.isDashboard,
    type: props.type,
    channel: props.channel,
  };

  return (
    <StreamProvider streamData={streamData}>
      {props.type === "vod" || props.type === "clip" ? (
        <WatchContent />
      ) : (
        <LiveStreamWrapper />
      )}
    </StreamProvider>
  );
};

export default WatchWrapper;
