import WatchWrapper from "~/app/_components/common/WatchWrapper";
// tRPC removed - using dummy data instead

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
    // Dummy API call: api.stream.getRTMPInfo({
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
