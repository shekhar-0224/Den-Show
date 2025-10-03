"use node";

import Mux from "@mux/mux-node";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { env } from "./utils/env";

const mux = new Mux({
  tokenId: env.MUX_TOKEN_ID,
  tokenSecret: env.MUX_TOKEN_SECRET,
  webhookSecret: env.MUX_WEBHOOK_SECRET,
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

    // TODO: change from public if we finish above todo
    const playbackId = streamDetails.playback_ids?.find(
      (p) => p.policy === "public"
    )?.id;

    if (!playbackId) {
      throw new Error("No public playback ID found for new stream");
    }

    await ctx.runMutation(internal.channel.createChannelCreds, {
      channelId: args.channelId,
      muxStreamId: streamDetails.id,
      muxStreamKey: streamDetails.stream_key,
      playbackId,
    });
  },
});

// export const changeLiveStreamState = internalAction({
//   args: {
//     muxStreamId: v.string(),
//     state: v.union(v.literal("enable"), v.literal("disable")),
//   },
//   handler: async (_, args) => {
//     if (args.state === "enable") {
//       await mux.video.liveStreams.enable(args.muxStreamId);
//     } else {
//       await mux.video.liveStreams.disable(args.muxStreamId);
//     }
//   },
// });

export const handleWebhook = internalAction({
  args: {
    headers: v.record(v.string(), v.string()),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const event = mux.webhooks.unwrap(args.body, args.headers);

    console.log("Mux Webhook Event:", event);

    switch (event.type) {
      case "video.live_stream.active": {
        const streamId = event.data.id;

        // TODO: update after switching to all private streams
        const playbackId = event.data.playback_ids?.find(
          (p) => p.policy === "public"
        )?.id;

        const assetId = event.data.active_asset_id;

        if (!playbackId) {
          console.error(
            "No public playback ID found for stream though stream is active:",
            streamId
          );
          break;
        }

        await ctx.runMutation(internal.stream.updateStreamStatus, {
          muxStreamId: streamId,
          newState: "live",
          assetId,
        });

        break;
      }

      case "video.live_stream.idle": {
        const streamId = event.data.id;

        await ctx.runMutation(internal.stream.updateStreamStatus, {
          muxStreamId: streamId,
          newState: "ended",
        });

        break;
      }

      case "video.asset.live_stream_completed": {
        const assetId = event.data.id;
        const playbackId = event.data.playback_ids?.find(
          (p) => p.policy === "public"
        )?.id;

        if (!playbackId) {
          console.error(
            "No public playback ID found for asset though live stream completed:",
            assetId
          );
          break;
        }

        await ctx.runMutation(internal.stream.updateStreamByAssetId, {
          assetId,
          playbackId,
        });

        break;
      }
    }
  },
});
