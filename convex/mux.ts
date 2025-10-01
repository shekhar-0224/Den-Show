import Mux from "@mux/mux-node";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

export const createMuxStreamKey = internalAction({
  args: {
    channelId: v.id("channels"),
  },
  handler: async (ctx, args) => {
    // TODO: for now all are public
    const streamDetails = await mux.video.liveStreams.create({
      playback_policies: ["public"],
      new_asset_settings: { playback_policy: ["public"] },
      test: true, // TODO: update before production
    });

    await ctx.runMutation(internal.channel.createChannelCreds, {
      channelId: args.channelId,
      streamId: streamDetails.id,
      streamKey: streamDetails.stream_key,
    });
  },
});

export const changeLiveStreamState = internalAction({
  args: {
    muxStreamId: v.string(),
    state: v.union(v.literal("enable"), v.literal("disable")),
  },
  handler: async (_, args) => {
    if (args.state === "enable") {
      await mux.video.liveStreams.enable(args.muxStreamId);
    } else {
      await mux.video.liveStreams.disable(args.muxStreamId);
    }
  },
});
