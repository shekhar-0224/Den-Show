import { getTickFromMarketCap } from "clanker-sdk";
import { Clanker } from "clanker-sdk/v4";
import {
  http,
  type PublicClient,
  createPublicClient,
  createWalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { env } from "~/env";
import { PLATFORM_ADDRESS, TREASURY_ADDRESS } from "./server-utils";

const CHAIN = base;

const PRIVATE_KEY = env.ADMIN_PRIVATE_KEY as `0x${string}`;

const adminAccount = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({
  chain: CHAIN,
  transport: http(),
}) as PublicClient;

const wallet = createWalletClient({
  account: adminAccount,
  chain: CHAIN,
  transport: http(),
});

const clanker = new Clanker({ wallet, publicClient });

export const deployCreatorToken = async ({
  creatorAddress,
  ticker,
  channelName,
  pfpUrl,
}: {
  creatorAddress: string;
  ticker: string;
  channelName: string;
  pfpUrl: string;
}) => {
  console.log("\n🚀 Deploying V4 Token with Custom Marketcap\n");

  const customPool = getTickFromMarketCap(1);

  const { txHash, waitForTransaction, error } = await clanker.deploy({
    name: `${channelName} Creator Token`,
    chainId: CHAIN.id,
    symbol: ticker,
    image: pfpUrl,
    tokenAdmin: adminAccount.address, //should be the creator - functionalities: update token meta and image
    metadata: {
      description: `Creator token for ${channelName} on Den`,
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
          recipient: creatorAddress as `0x${string}`,
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

  console.log(`Creator token for ${channelName} deploying in tx: ${txHash}`);

  const { address: tokenAddress } = await waitForTransaction();

  console.log(`Creator token for ${channelName} deployed successfully!`);

  console.log(`Creator token for ${channelName} address:`, tokenAddress);

  return tokenAddress;
};
