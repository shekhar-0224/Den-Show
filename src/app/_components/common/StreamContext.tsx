"use client";

import React, { createContext, useContext, type ReactNode } from "react";

export interface StreamData {
  streamId: string;
  streamTitle: string;
  streamDescription?: string;
  streamUrl?: string;
  streamKey?: string;
  demoPlaybackId?: string;
  isDashboard: boolean;
  type: "live" | "vod" | "clip";
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

interface StreamContextType {
  streamData: StreamData;
}

const StreamContext = createContext<StreamContextType | undefined>(undefined);

export const useStreamData = () => {
  const context = useContext(StreamContext);
  if (!context) {
    throw new Error("useStreamData must be used within a StreamProvider");
  }
  return context;
};

interface StreamProviderProps {
  children: ReactNode;
  streamData: StreamData;
}

export const StreamProvider = ({ children, streamData }: StreamProviderProps) => {
  return (
    <StreamContext.Provider value={{ streamData }}>
      {children}
    </StreamContext.Provider>
  );
};
