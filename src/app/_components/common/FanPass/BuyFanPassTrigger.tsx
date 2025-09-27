import Image from "next/image";
import React from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import FanPassModalContent from "./FanPassModalContent";

interface BuyFanPassTriggerProps {
  channelHandle: string;
  channelName: string;
  channelProfileUrl: string;
  creatorTokenSymbol: string;
  variant: "primary" | "inverted";
}

const BuyFanPassTrigger = ({
  channelHandle,
  channelName,
  channelProfileUrl,
  creatorTokenSymbol,
  variant,
}: BuyFanPassTriggerProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={variant}>
          <Image
            src="/icons/fan-pass.svg"
            alt="Fan Pass"
            width={17}
            height={17}
          />
          Become a Fan
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[440px] flex flex-col pt-1">
        <DialogTitle>{}</DialogTitle>
        <FanPassModalContent
          channelProfileUrl={channelProfileUrl}
          channelName={channelName}
          channelHandle={channelHandle}
          creatorTokenSymbol={creatorTokenSymbol}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BuyFanPassTrigger;
