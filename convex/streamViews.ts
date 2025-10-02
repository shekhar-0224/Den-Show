import { TableAggregate } from "@convex-dev/aggregate";
import { v } from "convex/values";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { internalMutation, query } from "./_generated/server";

export const streamViewsAggregate = new TableAggregate<{
  Key: string; // videoId
  DataModel: DataModel;
  TableName: "streamViewEvents";
}>(components.streamViewsAggregate, {
  sortKey: (doc) => doc.streamId,
});

export const channelViewsAggregate = new TableAggregate<{
  Key: string; // channelId
  DataModel: DataModel;
  TableName: "streamViewEvents";
}>(components.channelViewsAggregate, {
  sortKey: (doc) => doc.channelId,
});

export const streamViewsAggregateByEpoch = new TableAggregate<{
  Key: [string, number]; // streamId, epoch
  DataModel: DataModel;
  TableName: "streamViewEvents";
}>(components.streamViewsAggregateByEpoch, {
  sortKey: (doc) => [doc.streamId, doc._creationTime],
});

export const channelViewsAggregateByEpoch = new TableAggregate<{
  Key: [string, number]; // channelId, epoch
  DataModel: DataModel;
  TableName: "streamViewEvents";
}>(components.channelViewsAggregateByEpoch, {
  sortKey: (doc) => [doc.channelId, doc._creationTime],
});

export const addView = internalMutation({
  args: {
    streamId: v.id("streams"),
    viewerId: v.id("users"),
    channelId: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("streamViewEvents", {
      streamId: args.streamId,
      viewerId: args.viewerId,
      channelId: args.channelId,
    });

    const doc = await ctx.db.get(id);

    if (doc) {
      await Promise.all([
        streamViewsAggregate.insert(ctx, doc),
        streamViewsAggregateByEpoch.insert(ctx, doc),
        channelViewsAggregate.insert(ctx, doc),
        channelViewsAggregateByEpoch.insert(ctx, doc),
      ]);
    }
  },
});

export const getViews = query({
  args: {
    streamId: v.id("streams"),
  },
  handler: async (ctx, args) => {
    return await streamViewsAggregate.count(ctx, {
      bounds: {
        lower: { key: args.streamId, inclusive: true },
        upper: { key: args.streamId, inclusive: true },
      },
    });
  },
});

export const getChannelViews = query({
  args: {
    channelId: v.id("channels"),
  },
  handler: async (ctx, args) => {
    return await channelViewsAggregate.count(ctx, {
      bounds: {
        lower: { key: args.channelId, inclusive: true },
        upper: { key: args.channelId, inclusive: true },
      },
    });
  },
});
