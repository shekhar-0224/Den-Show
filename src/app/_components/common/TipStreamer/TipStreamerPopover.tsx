import Image from "next/image";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import useAddress from "~/app/_hooks/useAddress";
import { Button } from "~/components/ui/button";
import { PopoverClose } from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPrimitive,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
// tRPC removed - using dummy data instead
import { SendTipButton, SendTipButtonRoom } from "./SendTipButton";

interface TipStreamerPopoverProps {
  channelPfp: string;
  channelHandle: string;
  streamId?: string;
  streamerAddress: string;
  username: string;
  channelId: string;
  creatorTokenSymbol: string;
  creatorTokenAddress: string;
  isLive?: boolean;
}

type TokenData = {
  address: `0x${string}` | "native";
  symbol: string;
  decimals: number;
  balanceRaw: string;
  balance: string;
  name: string;
  logo: string | null;
};

const TipStreamerPopover = ({
  channelPfp,
  channelHandle,
  streamId,
  streamerAddress,
  username,
  channelId,
  creatorTokenSymbol,
  creatorTokenAddress,
  isLive = false,
}: TipStreamerPopoverProps) => {
  const { address } = useAddress();

  const [amount, setAmount] = useState<number>(0);
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
  const [selectedTokenSource, setSelectedTokenSource] = useState<
    "preset" | "other"
  >("preset");

  // Dummy data for token balances
  const data = { data: [], isLoading: false, error: null };

  // Define preset token addresses for easy reference
  const presetTokenAddresses = {
    ETH: "native" as const,
    USDC: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913" as const,
    CREATOR: creatorTokenAddress as `0x${string}`,
    NOICE: "0x9cb41fd9dc6891bae8187029461bfaadf6cc0c69" as const,
  };

  // Initialize with ETH when tokens are loaded
  useEffect(() => {
    if (tokens && !selectedToken) {
      const ethToken = tokens.presetTokens.find((t) => t.address === "native");
      if (ethToken) {
        setSelectedToken(ethToken as TokenData);
        setSelectedTokenSource("preset");
      }
    }
  }, [tokens, selectedToken]);

  // Helper function to find token by address
  const findTokenByAddress = (address: string): TokenData | null => {
    if (!tokens) return null;

    return (
      (tokens.presetTokens.find(
        (t) => t.address === address,
      ) as TokenData | null) ||
      (tokens.otherTokens.find(
        (t) => t.address === address,
      ) as TokenData | null) ||
      null
    );
  };

  // Handle preset token selection
  const handlePresetTokenSelect = (tokenAddress: string) => {
    const token = findTokenByAddress(tokenAddress);
    if (token) {
      setSelectedToken(token);
      setSelectedTokenSource("preset");
    }
  };

  // Handle dropdown token selection
  const handleDropdownTokenSelect = (tokenAddress: string) => {
    const token = tokens?.otherTokens.find((t) => t.address === tokenAddress);
    if (token) {
      setSelectedToken(token);
      setSelectedTokenSource("other");
    }
  };

  // Get display data for preset buttons
  const getPresetTokenData = (tokenKey: keyof typeof presetTokenAddresses) => {
    const address = presetTokenAddresses[tokenKey];
    const token = findTokenByAddress(address);

    return {
      address,
      token,
      isSelected:
        selectedToken?.address === address && selectedTokenSource === "preset",
    };
  };

  return (
    <div className="w-full">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div>Tip Streamer</div>
          <div className="flex items-center gap-2">
            <Image
              src={channelPfp}
              alt={channelHandle}
              width={30}
              height={30}
              className="rounded-full object-cover"
            />
            <div className="text-sm/[16px] font-cream-regular border-b border-dotted border-black">
              @{channelHandle}
            </div>
          </div>
        </div>
        <PopoverClose>
          <div className="font-cream-medium tracking-tighter cursor-pointer inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-white transition-all gap-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 size-9">
            <Image src="/icons/cross.svg" alt="Close" width={11} height={11} />
          </div>
        </PopoverClose>
      </div>

      {selectedToken && (
        <div className="mt-4 rounded-base border-2 border-border">
          <div className="bg-black w-full flex items-center justify-between text-white p-2.5">
            <div className="text-xs font-semibold uppercase">Balance</div>
            {Number(selectedToken.balance).toFixed(4)} {selectedToken.symbol}
          </div>
          <div className="p-4 flex flex-col gap-0">
            <div className="bg-white w-full flex items-center justify-center text-black gap-1 text-2xl">
              <input
                type="number"
                className="text-center min-w-0 focus:ring-0 focus:ring-offset-0 outline-none"
                placeholder="0.00"
                value={amount > 0 ? amount : undefined}
                onChange={(e) => setAmount(Number(e.target.value))}
                style={{
                  width: `${Math.max(String(amount || "0.00").length, 2)}ch`,
                }}
              />
              <div>{selectedToken.symbol}</div>
            </div>

            {/* <div className="bg-white w-full flex items-center justify-center text-black gap-2 text-base">
              <div>${(amount * 43).toFixed(2)}</div>
            </div> */}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 mt-4">
        <div className="grid grid-cols-4 gap-4 mb-2">
          {/* ETH Button */}
          {(() => {
            const { isSelected } = getPresetTokenData("ETH");
            return (
              <Button
                className="flex flex-col items-center gap-2 h-full justify-center hover:bg-primary"
                variant={isSelected ? "primary" : "default"}
                onClick={() =>
                  handlePresetTokenSelect(presetTokenAddresses.ETH)
                }
              >
                <Image
                  src="/images/eth-logo.png"
                  alt="ETH"
                  width={20}
                  height={20}
                />
                <div className="text-sm">ETH</div>
              </Button>
            );
          })()}

          {/* USDC Button */}
          {(() => {
            const { isSelected } = getPresetTokenData("USDC");
            return (
              <Button
                className="flex flex-col items-center gap-2 h-full justify-center hover:bg-primary"
                variant={isSelected ? "primary" : "default"}
                onClick={() =>
                  handlePresetTokenSelect(presetTokenAddresses.USDC)
                }
              >
                <Image
                  src="/images/usdc-logo.png"
                  alt="USDC"
                  width={20}
                  height={20}
                />
                <div className="text-sm">USDC</div>
              </Button>
            );
          })()}

          {/* Creator Token Button */}
          {(() => {
            const { isSelected } = getPresetTokenData("CREATOR");
            return (
              <Button
                disabled
                className="flex flex-col items-center gap-2 h-full justify-center hover:bg-primary"
                variant={isSelected ? "primary" : "default"}
                onClick={() =>
                  handlePresetTokenSelect(presetTokenAddresses.CREATOR)
                }
              >
                <Image
                  src={channelPfp}
                  alt={creatorTokenSymbol}
                  height={20}
                  width={20}
                />
                <div className="text-sm">{creatorTokenSymbol}</div>
              </Button>
            );
          })()}

          {/* NOICE Button */}
          {(() => {
            const { isSelected } = getPresetTokenData("NOICE");
            return (
              <Button
                className="flex flex-col items-center gap-2 h-full justify-center hover:bg-primary"
                variant={isSelected ? "primary" : "default"}
                onClick={() =>
                  handlePresetTokenSelect(presetTokenAddresses.NOICE)
                }
              >
                <Image
                  src="/images/noice-logo.png"
                  alt="NOICE"
                  width={30}
                  height={30}
                />
                <div className="text-sm">NOICE</div>
              </Button>
            );
          })()}
        </div>
      </div>

      <div className="mt-4">
        <Select
          value={selectedTokenSource === "other" ? selectedToken?.address : ""}
          onValueChange={handleDropdownTokenSelect}
        >
          <SelectTrigger id="currency">
            {selectedTokenSource === "other" && selectedToken ? (
              <SelectValue placeholder="Other tokens" />
            ) : (
              "Other tokens"
            )}
          </SelectTrigger>
          <SelectContent className="SelectContent">
            {isLoading ? (
              <div className="text-center text-sm font-cream-medium py-2">
                Fetching tokens...
              </div>
            ) : tokens && tokens.otherTokens.length > 0 ? (
              tokens.otherTokens.map((token) => (
                <SelectItem
                  key={token.address}
                  value={token.address}
                  className="w-full hover:bg-primary cursor-pointer flex items-center justify-between gap-2"
                >
                  <Image
                    src={token.logo ?? "/icons/transactions.svg"}
                    alt={token.symbol}
                    width={20}
                    height={20}
                  />
                  <div className="flex-1 flex flex-col">
                    <SelectPrimitive.ItemText>
                      <div>{token.symbol}</div>
                    </SelectPrimitive.ItemText>
                    <div className="text-xs">{token.name}</div>
                  </div>
                  <div className="text-right">
                    {Number(token.balance).toFixed(2)}
                  </div>
                </SelectItem>
              ))
            ) : (
              <div className="text-center text-sm font-cream-medium py-2">
                No tokens found.
              </div>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-2">
        {selectedToken &&
          (isLive ? (
            <SendTipButtonRoom
              amount={amount}
              tokenAddress={selectedToken.address}
              streamId={streamId}
              streamerAddress={streamerAddress}
              decimals={selectedToken.decimals}
              tokenSymbol={selectedToken.symbol}
              balanceRaw={selectedToken.balanceRaw}
              username={username}
              channelId={channelId}
            />
          ) : (
            <SendTipButton
              amount={amount}
              tokenAddress={selectedToken.address}
              streamId={streamId}
              streamerAddress={streamerAddress}
              decimals={selectedToken.decimals}
              tokenSymbol={selectedToken.symbol}
              balanceRaw={selectedToken.balanceRaw}
              username={username}
              channelId={channelId}
            />
          ))}
      </div>
    </div>
  );
};

export default TipStreamerPopover;
