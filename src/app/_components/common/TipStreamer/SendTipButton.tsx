import { useSendTransaction } from "@privy-io/react-auth";
import React, { useCallback, useRef } from "react";
import { toast } from "sonner";
import { encodeFunctionData, formatUnits, parseEther } from "viem";
import { Button } from "~/components/ui/button";

import { useChat } from "@livekit/components-react";
import { erc20Abi } from "viem";
import { base } from "viem/chains";
import { api } from "~/trpc/react";

interface SendTipButtonProps {
  amount: number;
  tokenAddress: `0x${string}` | "native";
  streamId?: string;
  streamerAddress: string;
  decimals: number;
  tokenSymbol: string;
  balanceRaw: string;
  username: string;
  channelId: string;
}

const SendTipButtonRoom = ({
  amount,
  tokenAddress,
  streamId,
  streamerAddress,
  decimals,
  tokenSymbol,
  balanceRaw,
  username,
  channelId,
}: SendTipButtonProps) => {
  const isTipSent = useRef(false);

  const { send } = useChat();

  const handleSend = useCallback(
    (message: string) => {
      send(message, {
        attributes: {
          label: "tip",
        },
      });
    },
    [send],
  );

  const { sendTransaction } = useSendTransaction({
    onSuccess: async ({ hash }) => {
      if (isTipSent.current) return;

      console.log("Tip successful", { hash });

      await sendTipMutation({
        amount,
        token: tokenAddress,
        chain: "base",
        hash: hash,
        streamId,
        channelId,
      });

      isTipSent.current = true;
      toast.success("Tip sent successfully");

      handleSend(`@${username} tipped ${amount} ${tokenSymbol}!`);
    },
    onError: (error) => {
      console.log({ error });
      toast.error("Failed to send tip");
    },
  });

  const { mutateAsync: sendTipMutation } = api.tip.sendTip.useMutation();

  const sendTipHandler = async () => {
    console.log("sendTipHandler", amount);

    isTipSent.current = false;

    const recipientAddress = streamerAddress as `0x${string}`;

    if (tokenAddress === "native") {
      await sendTransaction({
        to: recipientAddress,
        value: parseEther(amount.toString()),
      });
      return;
    }

    const encodedData = encodeFunctionData({
      abi: erc20Abi,
      functionName: "transfer",
      args: [recipientAddress, BigInt(amount * 10 ** decimals)],
    });

    await sendTransaction({
      to: tokenAddress,
      data: encodedData,
      chainId: base.id,
    });
  };

  return (
    <Button
      disabled={
        amount === 0 ||
        amount > Number(formatUnits(BigInt(balanceRaw), decimals))
      }
      onClick={sendTipHandler}
      className="w-full mt-2"
    >
      {amount === 0
        ? "Enter an amount"
        : amount > Number(formatUnits(BigInt(balanceRaw), decimals))
          ? "Insufficient balance"
          : "Tip"}
    </Button>
  );
};

const SendTipButton = ({
  amount,
  tokenAddress,
  streamId,
  streamerAddress,
  decimals,
  tokenSymbol,
  balanceRaw,
  username,
  channelId,
}: SendTipButtonProps) => {
  const isTipSent = useRef(false);

  const { sendTransaction } = useSendTransaction({
    onSuccess: async ({ hash }) => {
      if (isTipSent.current) return;

      console.log("Tip successful", { hash });

      await sendTipMutation({
        amount,
        token: tokenAddress,
        chain: "base",
        hash: hash,
        streamId,
        channelId,
      });

      isTipSent.current = true;
      toast.success("Tip sent successfully");
    },
    onError: (error) => {
      console.log({ error });
      toast.error("Failed to send tip");
    },
  });

  const { mutateAsync: sendTipMutation } = api.tip.sendTip.useMutation();

  const sendTipHandler = async () => {
    console.log("sendTipHandler", amount);

    isTipSent.current = false;

    const recipientAddress = streamerAddress as `0x${string}`;

    if (tokenAddress === "native") {
      await sendTransaction({
        to: recipientAddress,
        value: parseEther(amount.toString()),
      });
      return;
    }

    const encodedData = encodeFunctionData({
      abi: erc20Abi,
      functionName: "transfer",
      args: [recipientAddress, BigInt(amount * 10 ** decimals)],
    });

    await sendTransaction({
      to: tokenAddress,
      data: encodedData,
      chainId: base.id,
    });
  };

  return (
    <Button
      disabled={
        amount === 0 ||
        amount > Number(formatUnits(BigInt(balanceRaw), decimals))
      }
      onClick={sendTipHandler}
      className="w-full mt-2"
    >
      {amount === 0
        ? "Enter an amount"
        : amount > Number(formatUnits(BigInt(balanceRaw), decimals))
          ? "Insufficient balance"
          : "Tip"}
    </Button>
  );
};

export { SendTipButtonRoom, SendTipButton };
