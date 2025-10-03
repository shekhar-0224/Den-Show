import { getTickFromMarketCap } from "clanker-sdk";
import { Clanker } from "clanker-sdk/v4";
import { v } from "convex/values";
import {
  createPublicClient,
  createWalletClient,
  http,
  type PublicClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { env } from "./utils/env";

export const deployToken = internalAction({
  args: {
    creatorAddress: v.string(),
    ticker: v.string(),
    channelId: v.id("channels"),
    channelName: v.string(),
    profilePicUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const TREASURY_ADDRESS = "0x069F602c905D391CB0b5928a238fF97e88d1e89c";
    const PLATFORM_ADDRESS = "0x78F296C7AE0D2929E8Eb9BDca7B8d866Fa987465";

    const adminAccount = privateKeyToAccount(
      env.ADMIN_PRIVATE_KEY as `0x${string}`
    );

    const publicClient = createPublicClient({
      chain: base,
      transport: http(),
    }) as PublicClient;

    const wallet = createWalletClient({
      account: adminAccount,
      chain: base,
      transport: http(),
    });

    const clanker = new Clanker({ wallet, publicClient });

    const customPool = getTickFromMarketCap(1);

    const { txHash, waitForTransaction, error } = await clanker.deploy({
      name: `${args.channelName} Creator Token`,
      chainId: base.id,
      symbol: args.ticker,
      image: args.profilePicUrl,
      tokenAdmin: adminAccount.address, //should be the creator - functionalities: update token meta and image
      metadata: {
        description: `Creator token for ${args.channelName} on Den`,
        socialMediaUrls: [],
      },
      // vault: {} can use for referrals - zora vaults 50% and vests it for 5 yearb s
      // devBuy:
      context: {
        interface: "Clanker SDK", //insert your interface name here
        platform: "den.show", //social platform identifier (farcaster, X, etc..)
        messageId: "", // cast hash, X URL, etc..
        id: "", // social identifier (FID, X handle, etc..)
      },
      fees: {
        // type: "static",
        // clankerFee: 150,
        // pairedFee: 150,

        type: "dynamic",
        baseFee: 100, // 1% minimum fee
        maxFee: 500, // 5% maximum fee - can lower it to 3% - can go upto 30% - mostly used is 5%
        referenceTickFilterPeriod: 30, // 30 seconds - looking back 30s how much the price has moved
        resetPeriod: 120, // 2 minutes
        resetTickFilter: 200, // 2% price movement
        feeControlNumerator: 500000000, // Constant for scaling variable fee component
        decayFilterBps: 7500, // 75% decay after filter period
      },
      rewards: {
        recipients: [
          {
            recipient: args.creatorAddress as `0x${string}`,
            admin: adminAccount.address, // admin here is supposed to be the creator
            // In bps. 50% of reward
            bps: 5_000,
            token: "Both",
          },
          {
            recipient: PLATFORM_ADDRESS,
            admin: adminAccount.address,
            // In bps. 40% of reward
            bps: 4_000,
            token: "Both",
          },
          {
            recipient: TREASURY_ADDRESS,
            admin: adminAccount.address,
            // In bps. 10% of reward
            bps: 1_000,
            token: "Both",
          },
        ],
      },
      pool: {
        ...customPool,
        positions: [
          {
            tickLower: customPool.tickIfToken0IsClanker,
            tickUpper: -120000,
            positionBps: 10_000, // All tokens in one LP position
          },
        ],
      },
      vanity: true,
    });

    if (error) throw error;

    console.log(
      `Creator token for ${args.channelName} deploying in tx: ${txHash}`
    );

    const { address: tokenAddress } = await waitForTransaction();

    console.log(`Creator token for ${args.channelName} deployed successfully!`);

    console.log(`Creator token for ${args.channelName} address:`, tokenAddress);

    if (!tokenAddress) {
      throw new Error("Failed to deploy token");
    }

    await ctx.runMutation(internal.channel.updateTokenAddress, {
      symbol: args.ticker,
      address: tokenAddress,
      channelId: args.channelId,
    });
  },
});
