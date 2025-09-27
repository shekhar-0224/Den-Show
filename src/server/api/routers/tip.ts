import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { formatUnits } from "viem";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { channelDetails, streamMetrics, tips, users } from "~/server/db/schema";
import { chunk, publicClient, rpc } from "~/server/lib/server-utils";

type TokenBalance = { contractAddress: `0x${string}`; tokenBalance: string };

export const tipRouter = createTRPCRouter({
  sendTip: protectedProcedure
    .input(
      z.object({
        amount: z.number(),
        token: z.string(),
        chain: z.string(),
        hash: z.string(),
        streamId: z.string().optional(),
        channelId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const validTransaction = await publicClient.waitForTransactionReceipt({
        hash: input.hash as `0x${string}`,
      });

      if (validTransaction.status !== "success") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid Transaction Hash",
        });
      }

      const channel = await ctx.db.query.channelDetails.findFirst({
        where: eq(channelDetails.id, input.channelId),
      });

      if (!channel) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Channel not found",
        });
      }

      //TODO: how to calculate amountUSDC?
      const amountUSDC = 0;

      await ctx.db.insert(tips).values({
        userId: ctx.user.userId,
        streamId: input.streamId,
        creatorId: channel.userId,
        token: input.token,
        chain: input.chain,
        amountToken: input.amount,
        transactionHash: input.hash,
        // amountUSDC, //TODO: uncomment this when we have a way to calculate amountUSDC
      });

      //TODO: uncomment this when we have a way to calculate amountUSDC
      // await ctx.db
      //   .update(streamMetrics)
      //   .set({
      //     tipsEarnings: sql`${streamMetrics.tipsEarnings} + ${amountUSDC}`,
      //   })
      //   .where(eq(streamMetrics.streamId, input.streamId));

      // await ctx.db
      //   .update(users)
      //   .set({
      //     totalEarnings: sql`${users.totalEarnings} + ${amountUSDC}`,
      //   })
      //   .where(eq(users.id, stream.channel.userId));

      // await ctx.db
      //   .update(users)
      //   .set({
      //     totalSpending: sql`${users.totalSpending} + ${amountUSDC}`,
      //   })
      //   .where(eq(users.id, ctx.user.userId));
    }),

  getTokenBalances: protectedProcedure
    .input(
      z.object({
        address: z.string(),
        creatorTokenAddress: z.string(),
        creatorTokenSymbol: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Helper function to provide metadata for preset tokens
      function getPresetTokenMetadata(address: string) {
        const presetMetadata: Record<
          string,
          {
            name: string;
            symbol: string;
            decimals: number;
            logo: string | null;
          }
        > = {
          native: {
            name: "Ether",
            symbol: "ETH",
            decimals: 18,
            logo: null,
          },
          "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": {
            name: "USD Coin",
            symbol: "USDC",
            decimals: 6,
            logo: null,
          },
          // Add your creator token address here
          [input.creatorTokenAddress]: {
            name: input.creatorTokenSymbol,
            symbol: input.creatorTokenSymbol,
            decimals: 18,
            logo: null,
          },
          "0x9cb41fd9dc6891bae8187029461bfaadf6cc0c69": {
            name: "Noice Token",
            symbol: "NOICE",
            decimals: 18,
            logo: null,
          },
        };

        return (
          presetMetadata[address] || {
            name: "Unknown Token",
            symbol: "UNKNOWN",
            decimals: 18,
            logo: null,
          }
        );
      }

      try {
        // const address = input.address as `0x${string}`;
        const address = "0x73AE27967C2C98Dc168EC8f2b4cB1f2412239DEd";

        const balances = await rpc<{ tokenBalances: TokenBalance[] }>(
          "alchemy_getTokenBalances",
          [address, "erc20"],
        );

        // Get all balances (including zero balances for processing)
        const allTokens = balances.tokenBalances;

        const chunks = chunk(allTokens, 25); // Process all tokens to get metadata
        const hydrated: Array<{
          address: `0x${string}` | "native";
          name: string;
          symbol: string;
          decimals: number;
          balance: string;
          balanceRaw: string;
          logo: string | null;
        }> = [];

        for (const group of chunks) {
          const metas = await Promise.all(
            group.map(async (t) => {
              const md = await rpc<{
                name?: string;
                symbol?: string;
                decimals?: number;
                logo?: string;
              }>("alchemy_getTokenMetadata", [t.contractAddress]);

              const decimals = md?.decimals ?? 18;
              let balance = "0";
              try {
                balance = formatUnits(BigInt(t.tokenBalance), decimals);
              } catch {}

              return {
                address: t.contractAddress,
                name: md?.name ?? "",
                symbol: md?.symbol ?? "",
                decimals,
                balance,
                balanceRaw: t.tokenBalance,
                logo: md?.logo ?? null,
              };
            }),
          );
          hydrated.push(...metas.filter((m) => m.symbol !== ""));
        }

        // Add native ETH
        const native = await rpc<string>("eth_getBalance", [address, "latest"]);
        const nativeHuman = formatUnits(BigInt(native), 18);
        hydrated.unshift({
          address: "native",
          name: "Ether",
          symbol: "ETH",
          decimals: 18,
          balance: nativeHuman,
          balanceRaw: native,
          logo: null,
        });

        // Create a map for easy lookup
        const tokenMap = new Map(
          hydrated.map((token) => [token.address, token]),
        );

        const PRESET_TOKENS = [
          "native",
          "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
          "0x9cb41fd9dc6891bae8187029461bfaadf6cc0c69",
          input.creatorTokenAddress,
        ];

        // Ensure all preset tokens are included with correct data or zero balance
        const presetTokensData = PRESET_TOKENS.map((address) => {
          const existingToken = tokenMap.get(
            address as `0x${string}` | "native",
          );
          if (existingToken) {
            return existingToken;
          }

          // If preset token not found, create it with zero balance
          // You'll need to add metadata for missing preset tokens
          const presetTokenMetadata = getPresetTokenMetadata(address); // You'll need to implement this
          return {
            address,
            name: presetTokenMetadata.name,
            symbol: presetTokenMetadata.symbol,
            decimals: presetTokenMetadata.decimals,
            balance: "0",
            balanceRaw: "0x0",
            logo: presetTokenMetadata.logo,
          };
        });

        console.log("presetTokensData", presetTokensData);

        // For "other tokens", only include non-zero balances and exclude presets
        const otherTokens = hydrated
          .filter((token) => !PRESET_TOKENS.includes(token.address))
          .filter((token) => Number.parseFloat(token.balance) > 0)
          .sort((a, b) => Number(b.balance) - Number(a.balance));

        return {
          address,
          count: hydrated.length,
          otherTokens,
          presetTokens: presetTokensData,
        };
      } catch (err: unknown) {
        console.error("error getting token balances", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error getting token balances",
        });
      }
    }),
});
