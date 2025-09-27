"use server";

import { TRPCError } from "@trpc/server";
import { api } from "~/trpc/server";
import type { CreateChannelAtom } from "../_atoms/createChannel.atom";

export const loginWithEmail = async ({
  email,
  address,
}: {
  email: string;
  address: string;
}) => {
  try {
    const res = await api.auth.loginWithEmail({ email, address });
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
    const res = await api.auth.loginWithSocialAccount({
      type,
      id,
      username,
      address,
    });
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
    await api.auth.logout();
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
  await api.channel.create({
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
