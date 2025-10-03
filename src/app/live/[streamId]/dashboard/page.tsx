import WatchWrapper from "~/app/_components/common/WatchWrapper";
// tRPC removed - using dummy data instead

export default async function StreamDashboard({
  params,
}: {
  params: Promise<{ streamId: string }>;
}) {
  const streamId = (await params).streamId;

  return <div>Stream Dashboard for {streamId} - Coming Soon!</div>;

  // return (
  //   <WatchWrapper
  //     channel={channel}
  //     streamId={streamId}
  //     streamTitle={streamTitle}
  //     streamDescription={streamDescription ?? undefined}
  //     streamUrl={streamUrl}
  //     streamKey={streamKey}
  //     isDashboard={true}
  //     type="live"
  //   />
  // );
}
