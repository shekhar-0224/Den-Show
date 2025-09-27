import { TRPCError } from "@trpc/server";
import { base } from "viem/chains";
import z from "zod";
import { env } from "~/env";
import { createTRPCRouter, publicProcedure } from "../trpc";

interface PriceResponse {
  liquidityAvailable: boolean;
  buyAmount: string;
  totalNetworkFee: string | null;
}

interface QuoteResponse {
  liquidityAvailable: boolean;
  minBuyAmount: string;
  transaction: {
    to: string;
    data: string;
    gas: string | null;
    gasPrice: string;
    value: string;
  };
  buyAmount: string;
  sellAmount: string;
  totalNetworkFee: string | null;
  issues: {
    allowance: {
      actual: string;
      spender: string;
    };
    balance: {
      token: string;
      actual: string;
      expected: string;
    };
    simulationIncomplete: boolean;
    invalidSourcesPassed: string[];
  };
  permit2: {
    type: string;
    hash: string;
    eip712: {
      domain: {
        name: string;
        version: string;
        chainId: number;
        verifyingContract: string;
        salt: string;
      };
      primaryType: string;
    };
  };
}

interface TokenResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      name: string;
      address: string;
      symbol: string;
      decimals: number;
      total_supply: string;
      coingecko_coin_id: string;
      price_usd: string;
      fdv_usd: string;
      total_reserve_in_usd: string;
      volume_usd: {
        h24: string;
      };
      market_cap_usd: string;
    };
  };
  relationships: {
    top_pools: {
      data: [
        {
          id: string;
          type: "pool";
        },
      ];
    };
  };
}

export const tokenRouter = createTRPCRouter({
  getQuote: publicProcedure
    .input(
      z.object({
        amount: z.number(),
        buyToken: z.string(),
        sellToken: z.string(),
        taker: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { amount, buyToken, sellToken, taker } = input;

      console.log(amount, buyToken, sellToken, taker);

      try {
        const response = await fetch(
          `https://api.0x.org/swap/permit2/quote?chainId=${base.id}&sellToken=${sellToken}&buyToken=${buyToken}&sellAmount=${
            amount * 10 ** 18
          }&taker=${taker}`,
          {
            headers: {
              "0x-api-key": env.API_KEY_0X,
              "0x-version": "v2",
            },
          },
        );

        if (response.status !== 200) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get quote",
          });
        }

        const data = (await response.json()) as QuoteResponse;

        console.log(data);

        return data;
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get quote",
        });
      }
    }),

  getPrice: publicProcedure
    .input(
      z.object({
        amount: z.number(),
        buyToken: z.string(),
        sellToken: z.string(),
        taker: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { amount, buyToken, sellToken, taker } = input;

      console.log(amount, buyToken, sellToken, taker);

      try {
        const response = await fetch(
          `https://api.0x.org/swap/permit2/price?chainId=${base.id}&sellToken=${sellToken}&buyToken=${buyToken}&sellAmount=${
            amount * 10 ** 18
          }&taker=${taker}`,
          {
            headers: {
              "0x-api-key": env.API_KEY_0X,
              "0x-version": "v2",
            },
          },
        );

        if (response.status !== 200) {
          const data = (await response.json()) as {
            name: string;
            message: string;
            data: unknown;
          };
          console.log(data.data);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get price",
          });
        }

        const data = (await response.json()) as PriceResponse;

        console.log(data);

        return data;
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get price",
        });
      }
    }),

  getMarketData: publicProcedure
    .input(
      z.object({
        tokenAddress: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { tokenAddress } = input;

      const response = await fetch(
        `https://api.geckoterminal.com/api/v2/networks/base/tokens/${tokenAddress}`,
      );

      const data = (await response.json()) as TokenResponse;

      return {
        marketCap: data.data.attributes.fdv_usd,
        volume: data.data.attributes.volume_usd.h24,
      };
    }),
});
