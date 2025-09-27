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
      <div className="max-w-full flex items-center justify-between">
        <div className="font-cream-medium text-2xl text-[#413E3E]">
          [ $1000 {creatorTokenSymbol} ]
        </div>
        {!isCreatingChannel && (
          <Button variant="primary" onClick={() => {}}>
            Get Fan Pass
          </Button>
        )}
      </div>
      <div className="font-medium text-sm">
        {isCreatingChannel
          ? `FANs will have to hold ${creatorTokenSymbol} to back you, and unlock exclusive perks:`
          : `HODL ${creatorTokenSymbol} tokens, back @${channelHandle}, and unlock
        these exclusive perks:`}
      </div>
      <Card className="w-full p-2.5 text-sm flex flex-col gap-1">
        <div> Earn Revenue Share</div>
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
    </>
  );
};

export default FanPassModalContent;
