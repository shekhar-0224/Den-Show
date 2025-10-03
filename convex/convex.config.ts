import aggregate from "@convex-dev/aggregate/convex.config";
import { defineApp } from "convex/server";

const app = defineApp();

app.use(aggregate, { name: "streamViewsAggregate" });
app.use(aggregate, { name: "streamViewsAggregateByEpoch" });

app.use(aggregate, { name: "channelViewsAggregate" });
app.use(aggregate, { name: "channelViewsAggregateByEpoch" });

export default app;
