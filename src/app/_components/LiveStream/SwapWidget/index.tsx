import { useWallets } from "@privy-io/react-auth";
import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface SwapWidgetProps {
  streamId: string;
  creatorTokenSymbol: string;
  creatorTokenAddress: string;
  fanPassAmount?: string;
}

const SwapWidget = ({
  creatorTokenSymbol,
  creatorTokenAddress,
  fanPassAmount = "100",
}: SwapWidgetProps) => {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { wallets } = useWallets();

  const embeddedWallet = wallets.find(
    (wallet) => wallet.walletClientType === "privy"
  );

  const address = embeddedWallet?.address;

  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [inputAmount, setInputAmount] = useState("");
  const [outputAmount, setOutputAmount] = useState("");
  const [isExecutingSwap, setIsExecutingSwap] = useState(false);

  useEffect(() => {
    if (mode === "buy") setInputAmount(fanPassAmount);
  }, [mode]);

  // Dummy data
  const priceData = {
    data: { price: "0.001", estimatedGas: "0.0001" },
    isLoading: false,
    error: null
  };

  const quoteData = {
    data: { 
      buyAmount: "100", 
      sellAmount: "0.1",
      to: "0x1234567890123456789012345678901234567890",
      data: "0x"
    },
    isLoading: false,
    error: null
  };

  const handleSwap = async () => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsExecutingSwap(true);
    
    try {
      // Simulate swap
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Swap completed successfully!");
      console.log("Dummy swap executed:", {
        mode,
        inputAmount,
        outputAmount,
        creatorTokenAddress
      });
    } catch (error) {
      toast.error("Swap failed");
      console.error("Swap error:", error);
    } finally {
      setIsExecutingSwap(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white text-black p-4 rounded-lg">
        <div className="text-center">
          <p className="text-sm">Please connect your wallet to use the swap widget</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-black p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Swap {creatorTokenSymbol}</h3>
        <div className="flex gap-2">
          <Button
            variant={mode === "buy" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("buy")}
          >
            Buy
          </Button>
          <Button
            variant={mode === "sell" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("sell")}
          >
            Sell
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">
            {mode === "buy" ? "ETH Amount" : `${creatorTokenSymbol} Amount`}
          </label>
          <input
            type="number"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            className="w-full p-2 border rounded mt-1"
            placeholder="0.0"
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            {mode === "buy" ? `${creatorTokenSymbol} Amount` : "ETH Amount"}
          </label>
          <input
            type="number"
            value={outputAmount}
            onChange={(e) => setOutputAmount(e.target.value)}
            className="w-full p-2 border rounded mt-1"
            placeholder="0.0"
            readOnly
          />
        </div>

        {priceData.data && (
          <div className="text-sm text-gray-600">
            Price: {priceData.data.price} ETH per {creatorTokenSymbol}
          </div>
        )}

        <Button
          onClick={handleSwap}
          disabled={isExecutingSwap || !inputAmount}
          className="w-full"
        >
          {isExecutingSwap ? "Swapping..." : `Swap ${mode === "buy" ? "Buy" : "Sell"}`}
        </Button>
      </div>
    </div>
  );
};

export default SwapWidget;