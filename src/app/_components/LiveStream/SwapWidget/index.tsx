import { useWallets } from "@privy-io/react-auth";
import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

interface SwapWidgetProps {
  streamId: string;
  creatorTokenSymbol: string;
  creatorTokenAddress: string;
  fanPassAmount?: string;
}

const index = ({
  creatorTokenSymbol,
  creatorTokenAddress,
  fanPassAmount = "100", //TODO: Get from backend
}: SwapWidgetProps) => {
  const { isLoading, isAuthenticated } = useConvexAuth();

  const ready = isLoading;
  const authenticated = isAuthenticated;

  const { wallets } = useWallets();

  const embeddedWallet = wallets.find(
    (wallet) => wallet.walletClientType === "privy"
  );

  const address = embeddedWallet?.address;

  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [inputAmount, setInputAmount] = useState("");
  const [outputAmount, setOutputAmount] = useState("");
  const [isExecutingSwap, setIsExecutingSwap] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [isWaitingForTransaction, setIsWaitingForTransaction] = useState(false);
  const [ethBalance, setEthBalance] = useState<string>("0");
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [isSettingAllowance, setIsSettingAllowance] = useState(false);
  const [allowanceHash, setAllowanceHash] = useState<string | null>(null);
  const [isWaitingForAllowance, setIsWaitingForAllowance] = useState(false);

  useEffect(() => {
    if (mode === "buy") setInputAmount(fanPassAmount);
  }, [mode]);

  // Get price query for real-time display (lightweight)
  const { data: priceData, isLoading: isLoadingPrice } =
    api.token.getPrice.useQuery(
      {
        taker: address ?? "",
        amount: Number(inputAmount),
        buyToken:
          mode === "buy"
            ? creatorTokenAddress
            : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        sellToken:
          mode === "buy"
            ? "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
            : creatorTokenAddress,
      },
      {
        enabled: !!address && !!inputAmount && Number(inputAmount) > 0,
        retry: false,
      }
    );

  // Get quote query for execution (heavy, with transaction data)
  const {
    data: quote,
    isLoading: isLoadingQuote,
    isError,
    refetch: refetchQuote,
  } = api.token.getQuote.useQuery(
    {
      taker: address ?? "",
      amount: Number(inputAmount),
      buyToken:
        mode === "buy"
          ? creatorTokenAddress
          : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      sellToken:
        mode === "buy"
          ? "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
          : creatorTokenAddress,
    },
    {
      enabled: false, // Only fetch manually when needed for execution
      retry: false,
    }
  );

  // Fetch both ETH and token balances
  useEffect(() => {
    const fetchBalances = async () => {
      if (!embeddedWallet || !address) return;

      try {
        const provider = await embeddedWallet.getEthereumProvider();

        // Fetch ETH balance
        const ethBal = await provider.request({
          method: "eth_getBalance",
          params: [address, "latest"],
        });
        setEthBalance(ethBal as string);

        // Fetch token balance using ERC20 balanceOf method
        const tokenBalanceCall = await provider.request({
          method: "eth_call",
          params: [
            {
              to: creatorTokenAddress,
              data: `0x70a08231000000000000000000000000${address.slice(2)}`, // balanceOf(address)
            },
            "latest",
          ],
        });
        setTokenBalance(tokenBalanceCall as string);
      } catch (error) {
        console.error("Error fetching balances:", error);
      }
    };

    void fetchBalances();
  }, [embeddedWallet, address, creatorTokenAddress]);

  // Update output amount when price data changes
  useEffect(() => {
    if (priceData) {
      setOutputAmount((Number(priceData.buyAmount) / 10 ** 18).toString());
    }
  }, [priceData]);

  // Poll for allowance transaction receipt
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (allowanceHash && isWaitingForAllowance) {
      interval = setInterval(async () => {
        try {
          if (!embeddedWallet || !address) return;

          const provider = await embeddedWallet.getEthereumProvider();
          const receipt = await provider.request({
            method: "eth_getTransactionReceipt",
            params: [allowanceHash],
          });

          if (receipt) {
            setIsWaitingForAllowance(false);
            setIsSettingAllowance(false);
            setAllowanceHash(null);

            if (receipt.status === "0x1") {
              toast.success("Token approval confirmed!");
              // No need to refetch anything here, we'll get fresh quote on execution
              refetchQuote();
            } else {
              toast.error("Token approval failed");
            }
          }
        } catch (error) {
          console.error("Error checking allowance transaction receipt:", error);
        }
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [allowanceHash, isWaitingForAllowance, embeddedWallet, address]);

  // Poll for swap transaction receipt
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (transactionHash && isWaitingForTransaction) {
      interval = setInterval(async () => {
        try {
          if (!embeddedWallet || !address) return;

          const provider = await embeddedWallet.getEthereumProvider();
          const receipt = await provider.request({
            method: "eth_getTransactionReceipt",
            params: [transactionHash],
          });

          if (receipt) {
            setIsWaitingForTransaction(false);
            setIsExecutingSwap(false);
            setTransactionHash(null);

            if (receipt.status === "0x1") {
              toast.success("Swap completed successfully!");
              // Refetch both balances after successful transaction
              const newEthBalance = await provider.request({
                method: "eth_getBalance",
                params: [address, "latest"],
              });
              setEthBalance(newEthBalance as string);

              const newTokenBalance = await provider.request({
                method: "eth_call",
                params: [
                  {
                    to: creatorTokenAddress,
                    data: `0x70a08231000000000000000000000000${address.slice(2)}`,
                  },
                  "latest",
                ],
              });
              setTokenBalance(newTokenBalance as string);
            } else {
              toast.error("Transaction failed");
            }

            // Reset form
            setInputAmount("");
            setOutputAmount("");
          }
        } catch (error) {
          console.error("Error checking transaction receipt:", error);
        }
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    transactionHash,
    isWaitingForTransaction,
    embeddedWallet,
    address,
    creatorTokenAddress,
  ]);

  // Check if allowance is sufficient for selling (based on quote response)
  const isAllowanceSufficient = () => {
    if (mode !== "sell" || !quote) return true;

    // Check if quote indicates allowance issues
    if (quote.issues?.allowance) {
      const currentAllowance = BigInt(quote.issues.allowance.actual || "0");
      const requiredAmount = BigInt(quote.sellAmount);
      return currentAllowance >= requiredAmount;
    }

    // If no allowance issues in quote, assume it's sufficient
    return true;
  };

  // Set allowance for token spending (based on quote issues)
  const setAllowance = async () => {
    if (!quote || !address || !embeddedWallet || !quote.issues?.allowance) {
      toast.error("Unable to set allowance");
      return;
    }

    try {
      setIsSettingAllowance(true);

      const provider = await embeddedWallet.getEthereumProvider();

      const allowanceIssue = quote.issues.allowance;
      const spenderAddress = allowanceIssue.spender;
      const requiredAmount = quote.sellAmount;

      // Convert the required amount to proper hex format if it's not already
      const requiredAmountHex = requiredAmount.startsWith("0x")
        ? requiredAmount
        : `0x${BigInt(requiredAmount).toString(16)}`;

      // Prepare approve transaction data
      // approve(address spender, uint256 amount)
      const approveData = `0x095ea7b3000000000000000000000000${spenderAddress.slice(2)}${requiredAmountHex.slice(2).padStart(64, "0")}`;

      const approveTransaction = {
        to: creatorTokenAddress,
        data: approveData,
        from: address,
        gas: "0x15f90", // 90000 gas limit for approve
        gasPrice: quote.transaction.gasPrice || "0x3b9aca00", // Use quote gas price or fallback
      };

      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [approveTransaction],
      });

      setAllowanceHash(txHash as string);
      setIsWaitingForAllowance(true);

      toast.success("Approval transaction submitted!");
    } catch (error) {
      setIsSettingAllowance(false);
      console.error("Allowance setting error:", error);

      if (error instanceof Error && error.message?.includes("User rejected")) {
        toast.error("Approval cancelled by user");
      } else {
        toast.error("Failed to set token approval");
      }
    }
  };

  const executeSwap = async () => {
    if (!address || !embeddedWallet) {
      toast.error("Wallet not connected");
      return;
    }

    if (!inputAmount || Number(inputAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setIsExecutingSwap(true);

      // Get fresh quote with transaction data for execution
      const { data: freshQuote } = await refetchQuote();

      if (!freshQuote?.transaction) {
        throw new Error("Unable to get quote for execution");
      }

      // Check allowance for selling before proceeding
      if (mode === "sell" && freshQuote.issues?.allowance) {
        const currentAllowance = BigInt(
          freshQuote.issues.allowance.actual || "0"
        );
        const requiredAmount = BigInt(freshQuote.sellAmount);

        if (currentAllowance < requiredAmount) {
          toast.error("Please approve token spending first");
          setIsExecutingSwap(false);
          return;
        }
      }

      // Check if wallet has sufficient balance based on mode
      if (mode === "buy") {
        const balanceWei = BigInt(ethBalance);
        const requiredWei =
          BigInt(freshQuote.transaction.value) +
          BigInt(freshQuote.transaction.gas ?? "0") *
            BigInt(freshQuote.transaction.gasPrice);

        if (balanceWei < requiredWei) {
          const requiredEth = Number(requiredWei) / 10 ** 18;
          const currentEth = Number(balanceWei) / 10 ** 18;
          toast.error(
            `Insufficient funds. Required: ${requiredEth.toFixed(6)} ETH, Current: ${currentEth.toFixed(6)} ETH`
          );
          return;
        }
      } else {
        // For sell mode, check token balance
        const tokenBalanceWei = BigInt(tokenBalance);
        const requiredTokenWei = BigInt(freshQuote.sellAmount);

        if (tokenBalanceWei < requiredTokenWei) {
          const requiredTokens = Number(requiredTokenWei) / 10 ** 18;
          const currentTokens = Number(tokenBalanceWei) / 10 ** 18;
          toast.error(
            `Insufficient ${creatorTokenSymbol} tokens. Required: ${requiredTokens.toFixed(6)}, Current: ${currentTokens.toFixed(6)}`
          );
          return;
        }

        // Also check if there's enough ETH for gas fees
        const ethBalanceWei = BigInt(ethBalance);
        const gasRequiredWei =
          BigInt(freshQuote.transaction.gas ?? "0") *
          BigInt(freshQuote.transaction.gasPrice);

        if (ethBalanceWei < gasRequiredWei) {
          const requiredEth = Number(gasRequiredWei) / 10 ** 18;
          const currentEth = Number(ethBalanceWei) / 10 ** 18;
          toast.error(
            `Insufficient ETH for gas. Required: ${requiredEth.toFixed(6)} ETH, Current: ${currentEth.toFixed(6)} ETH`
          );
          return;
        }
      }

      // Get the Ethereum provider from Privy embedded wallet
      const provider = await embeddedWallet.getEthereumProvider();

      let transactionData = freshQuote.transaction.data;

      // Handle Permit2 if present in the quote
      if (freshQuote.permit2?.eip712) {
        try {
          // Sign the EIP-712 message for Permit2
          const signature = await provider.request({
            method: "eth_signTypedData_v4",
            params: [address, JSON.stringify(freshQuote.permit2.eip712)],
          });

          // Append signature to transaction data
          const signatureBytes = signature.slice(2); // Remove 0x prefix
          const signatureLengthHex = (signatureBytes.length / 2)
            .toString(16)
            .padStart(64, "0");
          transactionData =
            freshQuote.transaction.data + signatureLengthHex + signatureBytes;
        } catch (permitError) {
          console.error("Permit2 signing failed:", permitError);
          // Fall back to regular transaction if Permit2 fails
        }
      }

      // Prepare transaction parameters
      const transactionRequest = {
        to: freshQuote.transaction.to,
        data: transactionData,
        value: freshQuote.transaction.value,
        gas: freshQuote.transaction.gas,
        gasPrice: freshQuote.transaction.gasPrice,
        from: address,
      };

      // Send transaction using Privy's embedded wallet
      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [transactionRequest],
      });

      setTransactionHash(txHash as string);
      setIsWaitingForTransaction(true);

      toast.success("Transaction submitted!");
    } catch (error) {
      setIsExecutingSwap(false);
      console.error("Swap execution error:", error);

      // Handle user rejection
      if (error instanceof Error && error.message?.includes("User rejected")) {
        toast.error("Transaction cancelled by user");
      } else {
        toast.error("Failed to execute swap");
      }
    }
  };

  // // Get the current balance to display based on mode
  const getCurrentBalance = () => {
    if (mode === "buy") {
      return {
        balance: ethBalance,
        symbol: "ETH",
        formatted: (Number(ethBalance) / 10 ** 18).toFixed(6),
      };
    }
    return {
      balance: tokenBalance,
      symbol: creatorTokenSymbol,
      formatted: (Number(tokenBalance) / 10 ** 18).toFixed(6),
    };
  };

  const currentBalance = getCurrentBalance();

  // Need to get fresh quote to check allowance for execution
  const needsApproval = async () => {
    if (mode !== "sell") return false;

    try {
      const { data: freshQuote } = await refetchQuote();
      if (freshQuote?.issues?.allowance) {
        const currentAllowance = BigInt(
          freshQuote.issues.allowance.actual || "0"
        );
        const requiredAmount = BigInt(freshQuote.sellAmount);
        return currentAllowance < requiredAmount;
      }
      return false;
    } catch {
      return false;
    }
  };

  const canExecuteSwap =
    ready &&
    authenticated &&
    !!embeddedWallet &&
    inputAmount !== "" &&
    Number(inputAmount) > 0 &&
    Number(inputAmount) <= Number(currentBalance.formatted) &&
    !isExecutingSwap &&
    !isWaitingForTransaction &&
    !isSettingAllowance &&
    !isWaitingForAllowance &&
    BigInt(currentBalance.balance) > BigInt(0) &&
    priceData?.liquidityAvailable !== false;

  const canSetAllowance =
    ready &&
    authenticated &&
    !!embeddedWallet &&
    mode === "sell" &&
    !!quote?.issues?.allowance &&
    !isAllowanceSufficient() &&
    !isSettingAllowance &&
    !isWaitingForAllowance &&
    !isExecutingSwap &&
    !isWaitingForTransaction;

  const getButtonText = () => {
    if (!ready) return "Loading...";
    if (!authenticated || !embeddedWallet) return "Login Required";
    if (Number(inputAmount) > Number(currentBalance.formatted))
      return "Insufficient Balance";
    if (priceData && priceData.liquidityAvailable === false)
      return "Insufficient liquidity";
    if (isLoadingPrice) return "Fetching Price...";
    if (isWaitingForAllowance) return "Confirming Approval...";
    if (isSettingAllowance) return "Approving Token...";
    if (isWaitingForTransaction) return "Processing Transaction...";
    if (isExecutingSwap) return "Executing Swap...";
    if (inputAmount === "") return "Enter Amount";
    if (mode === "sell" && quote?.issues?.allowance && !isAllowanceSufficient())
      return `Approve ${creatorTokenSymbol}`;
    return "Swap";
  };

  const handleModeSwitch = (newMode: "buy" | "sell") => {
    setMode(newMode);
    setInputAmount("");
    setOutputAmount("");
  };

  const handleButtonClick = () => {
    // For sell mode, check if we need approval first
    if (
      mode === "sell" &&
      quote?.issues?.allowance &&
      !isAllowanceSufficient()
    ) {
      setAllowance();
    } else {
      executeSwap();
    }
  };

  console.log({ priceData, quote });
  console.log("Quote issues:", quote?.issues);
  console.log("Allowance actual:", quote?.issues?.allowance?.actual);

  return (
    <div className="bg-white text-black p-2.5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button
          className="flex-1 hover:bg-primary"
          variant={mode === "buy" ? "primary" : "default"}
          onClick={() => handleModeSwitch("buy")}
        >
          Buy
        </Button>
        <Button
          className={cn(
            "flex-1 hover:bg-[#C73F3F]",
            mode === "sell" && "bg-[#C73F3F]"
          )}
          variant={mode === "sell" ? "primary" : "default"}
          onClick={() => handleModeSwitch("sell")}
        >
          Sell
        </Button>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <div className="text-black font-cream-medium text-lg">
          {mode === "buy"
            ? `Buy ${creatorTokenSymbol}`
            : `Sell ${creatorTokenSymbol}`}
        </div>

        {address && (
          <div className="text-sm flex-1">
            Balance:{" "}
            <span className="font-semibold">
              {Number(currentBalance.formatted).toFixed(4)}{" "}
              {currentBalance.symbol}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center rounded-base border border-black">
        <input
          disabled
          className="flex-1 outline-none text-sm px-2.5 py-4"
          type="text"
          placeholder="0.00"
          value={inputAmount}
          onChange={(e) => {
            const value = e.target.value;
            // Only allow numbers and decimal point
            if (value === "" || /^\d*\.?\d*$/.test(value)) {
              setInputAmount(value);
              setOutputAmount("");
            }
          }}
        />
        <div className="bg-black text-sm text-white py-4 text-center min-w-14 flex-shrink-0">
          {mode === "buy" ? "ETH" : creatorTokenSymbol}
        </div>
      </div>

      {/* Fan Pass, 0.005, 0.01, 0.1 */}

      {mode === "buy" && (
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex-1 text-center shadow-small border-border border p-2 text-[10px] cursor-pointer hover:bg-primary",
              mode === "buy" && inputAmount === fanPassAmount && "bg-primary"
            )}
            onClick={() => setInputAmount(fanPassAmount)}
          >
            Fan Pass
          </div>
          <div
            className={cn(
              "flex-1 text-center shadow-small border-border border p-2 text-[10px] cursor-pointer hover:bg-primary",
              mode === "buy" && inputAmount === "0.005" && "bg-primary"
            )}
            onClick={() => setInputAmount("0.005")}
          >
            0.005 ETH
          </div>
          <div
            className={cn(
              "flex-1 text-center shadow-small border-border border p-2 text-[10px] cursor-pointer hover:bg-primary",
              mode === "buy" && inputAmount === "0.01" && "bg-primary"
            )}
            onClick={() => setInputAmount("0.01")}
          >
            0.01 ETH
          </div>
          <div
            className={cn(
              "flex-1 text-center shadow-small border-border border p-2 text-[10px] cursor-pointer hover:bg-primary",
              mode === "buy" && inputAmount === "0.1" && "bg-primary"
            )}
            onClick={() => setInputAmount("0.1")}
          >
            0.1 ETH
          </div>
        </div>
      )}

      {mode === "sell" && (
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex-1 text-center shadow-small border-border border p-2 text-[10px] cursor-pointer hover:bg-primary",
              mode === "sell" && inputAmount === "100" && "bg-primary"
            )}
            onClick={() => setInputAmount("100")}
          >
            100 {creatorTokenSymbol}
          </div>
          <div
            className={cn(
              "flex-1 text-center shadow-small border-border border p-2 text-[10px] cursor-pointer hover:bg-primary",
              mode === "sell" && inputAmount === "1000" && "bg-primary"
            )}
            onClick={() => setInputAmount("1000")}
          >
            1000 {creatorTokenSymbol}
          </div>
          <div
            className={cn(
              "flex-1 text-center shadow-small border-border border p-2 text-[10px] cursor-pointer hover:bg-primary",
              mode === "sell" && inputAmount === "10000" && "bg-primary"
            )}
            onClick={() => setInputAmount("10000")}
          >
            10000 {creatorTokenSymbol}
          </div>
        </div>
      )}

      <div className="h-1" />

      <div className="flex items-center rounded-base border border-black">
        <input
          disabled
          className="flex-1 outline-none text-sm px-2.5 py-4 pointer-events-none"
          type="text"
          value={
            outputAmount !== "" && Number(outputAmount) > 0
              ? Number(outputAmount)
                  .toFixed(18)
                  .replace(/\.?0+$/, "")
              : "0.00"
          }
          placeholder="0.00"
          onChange={() => {}}
        />
        <div className="bg-black text-sm text-white py-4 text-center min-w-14 flex-shrink-0">
          {mode === "buy" ? `${creatorTokenSymbol}` : "ETH"}
        </div>
      </div>

      {/* Show allowance status for sell mode */}
      {mode === "sell" && quote?.issues?.allowance && (
        <div className="text-xs">
          <div className="flex justify-between">
            <span>Current allowance:</span>
            <span>
              {(
                Number(quote.issues.allowance.actual || "0") /
                10 ** 18
              ).toFixed(6)}{" "}
              {creatorTokenSymbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Required:</span>
            <span>
              {(Number(quote.sellAmount) / 10 ** 18).toFixed(6)}{" "}
              {creatorTokenSymbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span
              className={
                isAllowanceSufficient() ? "text-green-600" : "text-red-600"
              }
            >
              {isAllowanceSufficient() ? "✓ Sufficient" : "⚠ Approval needed"}
            </span>
          </div>
        </div>
      )}

      {/* Show price details using price data */}
      {priceData?.liquidityAvailable &&
        inputAmount !== "" &&
        Number(inputAmount) > 0 && (
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>Estimated receive:</span>
              <span>
                {(Number(priceData.buyAmount) / 10 ** 18).toFixed(6)}{" "}
                {mode === "buy" ? creatorTokenSymbol : "ETH"}
              </span>
            </div>
            {priceData.totalNetworkFee && (
              <div className="flex justify-between">
                <span>Est. network fee:</span>
                <span>
                  ~{(Number(priceData.totalNetworkFee) / 10 ** 18).toFixed(6)}{" "}
                  ETH
                </span>
              </div>
            )}
          </div>
        )}

      <Button
        disabled={!canExecuteSwap && !canSetAllowance}
        onClick={handleButtonClick}
        className="relative"
      >
        {(isWaitingForTransaction ||
          isExecutingSwap ||
          isSettingAllowance ||
          isWaitingForAllowance) && (
          <div className="absolute left-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          </div>
        )}
        {getButtonText()}
      </Button>
    </div>
  );
};

export default index;
