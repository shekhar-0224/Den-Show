import WatchWrapper from "~/app/_components/common/WatchWrapper";
import { api } from "~/trpc/server";

export default async function StreamDashboard({
  params,
}: {
  params: Promise<{ streamId: string }>;
}) {
  const streamId = (await params).streamId;

  const [
    { streamKey, streamUrl },
    { streamTitle, streamDescription, channel },
  ] = await Promise.all([
    api.stream.getRTMPInfo({
      streamId,
    }),
    api.stream.getStreamInfo({
      streamId,
    }),
  ]);

  return (
    <WatchWrapper
      channel={channel}
      streamId={streamId}
      streamTitle={streamTitle}
      streamDescription={streamDescription ?? undefined}
      streamUrl={streamUrl}
      streamKey={streamKey}
      isDashboard={true}
      type="live"
    />
  );
}
