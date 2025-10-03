import { preloadedQueryResult, preloadQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import WatchContent from "../../_components/common/WatchContent";
// tRPC removed - using dummy data instead

export default async function LiveStream({
  params,
}: {
  params: Promise<{ streamId: string }>;
}) {
  const streamId = (await params).streamId as Id<"streams">;

  const preLoadedStream = await preloadQuery(api.stream.getStream, {
    streamId,
  }).catch(() => null);

  if (!preLoadedStream) redirect("/404");

  const stream = preloadedQueryResult(preLoadedStream);

  if (!stream) redirect("/404");

  // if (isMyStream) return redirect(`/live/${streamId}/dashboard`);

  return <WatchContent preLoadedStream={preLoadedStream} />;
}
