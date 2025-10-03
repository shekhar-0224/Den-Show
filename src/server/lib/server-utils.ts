import { PrivyClient } from "@privy-io/server-auth";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
// LiveKit removed - using Mux instead
import { cookies } from "next/headers";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { env } from "~/env";

export const TOKEN_COOKIE = "__DEN_TOKEN__";
export const PRIVY_TOKEN_COOKIE = "privy-token";

export const TREASURY_ADDRESS = "0x069F602c905D391CB0b5928a238fF97e88d1e89c";
export const PLATFORM_ADDRESS = "0x78F296C7AE0D2929E8Eb9BDca7B8d866Fa987465";

type TokenPayload = {
  address: `0x${string}`;
  userId: string;
  username: string;
  channelId?: string;
};

// LiveKit clients removed - using Mux instead

export const createPrivyClient = () => {
  return new PrivyClient(env.NEXT_PUBLIC_PRIVY_APP_ID, env.PRIVY_APP_SECRET);
};

export const auth = async () => {
  const cookieAuthToken = (await cookies()).get("privy-token");

  if (cookieAuthToken) {
    const client = createPrivyClient();

    try {
      const verifiedClaims = await client.verifyAuthToken(cookieAuthToken.value);
      
      // Return mock user data for now since we removed LiveKit
      return {
        userId: "mock-user-id",
        username: "mock-username",
        channelId: "mock-channel-id",
        address: "0x0000000000000000000000000000000000000000",
      };
    } catch (error) {
      console.error("Error verifying auth token:", error);
      return null;
    }
  }

  return null;
};

export const createAndSetToken = async (data: TokenPayload) => {
  const c = await cookies();

  const j = jwt.sign(
    {
      address: data.address.toLowerCase(),
      userId: data.userId,
      username: data.username,
      channelId: data.channelId,
    },
    env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );

  console.log("setting token", j);

  c.set(TOKEN_COOKIE, j);
};

export const getPrivyToken = async () => {
  const c = await cookies();

  const token = c.get(PRIVY_TOKEN_COOKIE)?.value;

  return token;
};

export const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

export async function rpc<T = unknown>(
  method: string,
  params: unknown[]
): Promise<T> {
  const res = await fetch(
    `https://base-mainnet.g.alchemy.com/v2/${env.ALCHEMY_API_KEY}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: 1, jsonrpc: "2.0", method, params }),
    }
  );
  const body = await res.json();
  if (!res.ok || body.error) {
    throw new Error(body?.error?.message || `RPC ${method} failed`);
  }
  return body.result as T;
}

export function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export const verifyPrivyToken = async () => {
  const privyToken = await getPrivyToken();

  if (!privyToken) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Privy access token not found",
    });
  }

  const privy = new PrivyClient(
    env.NEXT_PUBLIC_PRIVY_APP_ID,
    env.PRIVY_APP_SECRET
  );

  try {
    const verifiedClaims = await privy.verifyAuthToken(privyToken);
    console.log("Privy user verified!", verifiedClaims);
  } catch (error) {
    console.error("error verifying privy token", error);
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Privy token verification failed",
    });
  }
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
