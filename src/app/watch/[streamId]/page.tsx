import WatchWrapper from "~/app/_components/common/WatchWrapper";
// tRPC removed - using dummy data instead

export default async function Watch({
  params,
}: {
  params: Promise<{ streamId: string }>;
}) {
  const streamId = (await params).streamId;

  const { vodUrl, streamDescription, streamTitle, startedAt, channel } =
    await // Dummy API call: api.stream.getStreamInfo({
      streamId,
    });

  return (
    <WatchWrapper
      hlsUrl={vodUrl}
      streamTitle={streamTitle}
      streamDescription={streamDescription ?? undefined}
      channel={channel}
      streamId={streamId}
      isDashboard={false}
      type="vod"
    />
  );
}
