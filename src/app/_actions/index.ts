"use server";

import { TRPCError } from "@trpc/server";
// tRPC removed - using dummy data instead
import type { CreateChannelAtom } from "../_atoms/createChannel.atom";

export const loginWithEmail = async ({
  email,
  address,
}: {
  email: string;
  address: string;
}) => {
  try {
    // Dummy API call
    const res = { success: true, user: { email, address } };
    return res;
  } catch (error) {
    console.error(error);
    throw new Error(
      error instanceof TRPCError ? error.message : "Something went wrong",
    );
  }
};

export const loginWithSocialAccount = async ({
  id,
  username,
  address,
  type,
}: {
  type: "twitter" | "farcaster";
  id: string;
  username: string;
  address: string;
}) => {
  try {
    // Dummy API call
    const res = { success: true, user: { type, id, username, address } };
    return res;
  } catch (error) {
    console.error(error);
    throw new Error(
      error instanceof TRPCError ? error.message : "Something went wrong",
    );
  }
};

export const logout = async () => {
  try {
    // Dummy API call
    console.log("Dummy logout");
  } catch (error) {
    console.error(error);
  }
};

export const createChannel = async (
  channel: Omit<CreateChannelAtom, "banner" | "pfp"> & {
    bannerUrl: string | undefined;
    profileUrl: string | undefined;
  },
) => {
  // Dummy API call
  console.log("Dummy channel creation:", {
    name: channel.channelName,
    bio: channel.channelAbout,
    nsfw: channel.nsfw,
    handle: channel.channelHandle,
    bannerUrl: channel.bannerUrl,
    profileUrl: channel.profileUrl,
    fanSubscriptionFee: channel.fanSubscriptionFee,
    token: channel.token,
    language: channel.language,
  });
};
