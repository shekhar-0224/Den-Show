import Image from "next/image";
import React from "react";
import useAddress from "~/app/_hooks/useAddress";
import useLogin from "~/app/_hooks/useLogin";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
// tRPC removed - using dummy data instead
import TipStreamerPopover from "./TipStreamerPopover";

interface SendTipTriggerProps {
  channelPfp: string | null;
  channelHandle: string;
  streamId?: string;
  streamerAddress: string;
  channelId: string;
  variant?: "primaryInverted" | "primary";
  side?: "top" | "bottom";
  creatorTokenSymbol: string;
  creatorTokenAddress: string;
  isLive?: boolean;
}

const SendTipTrigger = ({
  channelPfp,
  channelHandle,
  streamId,
  streamerAddress,
  channelId,
  variant = "primaryInverted",
  side = "top",
  creatorTokenSymbol,
  creatorTokenAddress,
  isLive = false,
}: SendTipTriggerProps) => {
  const { address } = useAddress();
  const { login } = useLogin();
  // Dummy user data
  const user = { id: "mock-user", username: "mock-username" };

  if (!address || !user)
    return (
      <Button variant={variant} onClick={login}>
        <Image src="/icons/money.svg" alt="Money" width={17} height={16} />
        Send Tip
      </Button>
    );

  return (
    <div>
      <Popover>
        <PopoverTrigger className="w-full">
          <div
            className={cn(
              "h-10 px-4 py-2 font-cream-medium tracking-tighter cursor-pointer inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-white transition-all gap-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              variant === "primary" &&
                "text-main-foreground bg-primary border-2 border-border shadow-small hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none",
              variant === "primaryInverted" &&
                "text-main-foreground bg-primary border-2 border-main shadow-small-inverted hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none",
            )}
          >
            <Image src="/icons/money.svg" alt="Money" width={17} height={16} />
            Send Tip
          </div>
        </PopoverTrigger>
        <PopoverContent className="bg-white w-[360px]" side={side}>
          <TipStreamerPopover
            channelPfp={channelPfp ?? "/images/default-channel-logo.png"}
            channelHandle={channelHandle}
            streamId={streamId}
            streamerAddress={streamerAddress}
            username={user.username}
            channelId={channelId}
            creatorTokenSymbol={creatorTokenSymbol}
            creatorTokenAddress={creatorTokenAddress}
            isLive={isLive}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SendTipTrigger;
