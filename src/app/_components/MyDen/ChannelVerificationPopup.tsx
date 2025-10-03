"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "~/components/ui/button";

interface ChannelVerificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  channelName: string;
  channelHandle: string;
  tokenSymbol: string;
  isCreatingChannel: boolean;
}

const ChannelVerificationPopup = ({
  isOpen,
  onClose,
  onConfirm,
  channelName,
  channelHandle,
  tokenSymbol,
  isCreatingChannel,
}: ChannelVerificationPopupProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      {/* White Box - 612x434 */}
      <div className="bg-white rounded-lg w-[774px] h-[504px] p-2 animate-in zoom-in-95 duration-500">
        {/* Black Box - 598x338 aligned to top with equal padding */}
        <div className="bg-black w-[760px] h-[398px] rounded-none p-8">
          <div className="flex gap-12 h-full">
            {/* Left Div - Content */}
            <div className="flex-1 flex flex-col gap-6">
              {/* Logo */}
              <div className="flex items-center">
                <Image
                  src="/images/logowhite.svg"
                  alt="Den Logo"
                  width={140}
                  height={60}
                  className="bg-black p-2 rounded"
                />
              </div>

              {/* Content Group */}
              <div className="flex flex-col gap-1">
                {/* Live Status */}
                <div className="bg-[#C34144] text-white px-3 py-1 rounded text-xs font-medium w-fit">
                  • LIVE
                </div>
                {/* Channel Name */}
                <div className="text-[32px] font-cream-medium text-white">
                  Welcome to {channelName}
                </div>
                <div className="text-[17px] font-cream-medium text-white">
                  @{channelHandle}
                </div>
                <div className="text-[15px] font-cream-regular text-white">
                  Ticker: {tokenSymbol}
                </div>
              </div>

              {/* Channel Link Box with Icon */}
              <div className="flex flex-row items-center gap-2">
                <div className="bg-white rounded-[30px] px-2 py-1 text-center w-fit">
                  <span className="text-black text-xs font-cream-medium">
                    den.show/{channelHandle}
                  </span>
                </div>
                <Image
                  src="/images/small-icon.png"
                  alt="Small Icon"
                  width={55}
                  height={55}
                  className="w-10 h-10"
                />
              </div>
            </div>

            {/* Right Div - Image */}
            <div className="flex-1">
              <Image
                src="/images/scheduledstream.png"
                alt="Channel Created"
                width={280}
                height={271}
                className="w-full h-auto object-cover rounded"
              />
            </div>
          </div>
        </div>

        {/* 5 Buttons Below Black Box */}
        <div className="flex items-center justify-between p-4 mt-2 rounded">
          <div className="flex gap-4">
            <Button
              onClick={onConfirm}
              disabled={isCreatingChannel}
              className="bg-white border-2 border-black text-black hover:bg-gray-100 px-6 py-2 shadow-[0_4px_0_0_rgba(0,0,0,1)]"
            >
              {isCreatingChannel ? "Creating..." : "Create Den"}
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-black font-medium">Share via</span>
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-white border-2 border-black rounded flex items-center justify-center shadow-[0_4px_0_0_rgba(0,0,0,1)]">
                <span className="text-black text-sm font-bold">X</span>
              </div>
              <div className="w-8 h-8 bg-white border-2 border-black rounded flex items-center justify-center shadow-[0_4px_0_0_rgba(0,0,0,1)]">
                <span className="text-black text-sm font-bold">↗</span>
              </div>
              <div className="w-8 h-8 bg-white border-2 border-black rounded flex items-center justify-center shadow-[0_4px_0_0_rgba(0,0,0,1)]">
                <span className="text-black text-sm font-bold">📁</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelVerificationPopup;
