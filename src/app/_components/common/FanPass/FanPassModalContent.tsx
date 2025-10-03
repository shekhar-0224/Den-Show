import Image from "next/image";
import React from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

interface FanPassModalContentProps {
  channelProfileUrl: string;
  channelName: string;
  channelHandle: string;
  creatorTokenSymbol: string;
  isCreatingChannel?: boolean;
  onCreateChannel?: () => void;
}

const FanPassModalContent = ({
  channelProfileUrl,
  channelName,
  channelHandle,
  creatorTokenSymbol,
  isCreatingChannel = false,
  onCreateChannel,
}: FanPassModalContentProps) => {
  return (
    <>
      <div className="w-full rounded-md bg-black text-white relative overflow-hidden flex flex-col items-center justify-center gap-2 p-4">
        <div className="absolute top-7 -left-10 -rotate-45 bg-white flex gap-2 py-1">
          <Image
            src="/images/den-full-logo-black.svg"
            alt="Den Logo"
            width={54}
            height={18}
          />
          <Image
            src="/images/den-full-logo-black.svg"
            alt="Den Logo"
            width={54}
            height={18}
          />
          <Image
            src="/images/den-full-logo-black.svg"
            alt="Den Logo"
            width={54}
            height={18}
          />
        </div>
        <Image
          src={channelProfileUrl}
          alt={channelName}
          width={80}
          height={80}
        />
        <div className="text-xl font-cream-medium">{channelName}'s</div>
        <div>FAN PASS</div>
        <div className="text- bg-white rounded-3xl py-1 px-2 text-black font-cream-medium tracking-tighter font-semibold">
          den.show/{channelHandle}
        </div>
      </div>
      <div className="w-full flex flex-row gap-8">
        {/* Left side - Perks */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="font-medium text-sm">
            FANs will have to hold DAI to back you, and unlock exclusive perks:
          </div>
          <Card className="w-full p-2.5 text-sm flex flex-col gap-1">
            <div>Earn Revenue Share</div>
            <div className="text-[#9da3ac] text-xs">
              % of creator's trading fees & tips
            </div>
          </Card>
          <Card className="w-full p-2.5 text-sm flex flex-col gap-1">
            <div>Clip & Earn Rewards</div>
            <div className="text-[#9da3ac] text-xs">
              Create clips, earn as per views/fans you drive
            </div>
          </Card>
          <Card className="w-full p-2.5 text-sm flex flex-col gap-1">
            <div>Exclusive Live Events</div>
            <div className="text-[#9da3ac] text-xs">
              Fans-only streams & sessions
            </div>
          </Card>
        </div>

        {/* Right side - Price */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="text-center">
            <div className="text-[#9da3ac] text-sm">Price</div>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold text-black font-cream-medium">20</span>
              <span className="text-xl text-black font-cream-medium">USDC</span>
            </div>
            <div className="border-b border-dotted border-gray-400 w-full mt-2"></div>
            <div className="text-[#9da3ac] text-sm mt-2 font-cream-medium">= 100{creatorTokenSymbol}</div>
          </div>
          
          <div className="text-center">
            <div className="text-[#9da3ac] text-sm mb-2">Step 2 of 2</div>
            {!isCreatingChannel && (
              <Button variant="primary" onClick={() => {}}>
                Get Fan Pass
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FanPassModalContent;
