"use client";

import React from "react";
import LiveStreamWrapper from "../LiveStream/LiveStreamWrapper";
import WatchContent from "./WatchContent";

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
  if (props.type === "vod" || props.type === "clip") {
    return <WatchContent {...props} />;
  }

  return <LiveStreamWrapper {...props} />;
};

export default WatchWrapper;
