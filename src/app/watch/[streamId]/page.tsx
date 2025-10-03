export default async function Watch({
  params,
}: {
  params: Promise<{ streamId: string }>;
}) {
  const streamId = (await params).streamId;

  return null;

  // return (
  //   <WatchWrapper
  //     hlsUrl={vodUrl}
  //     streamTitle={streamTitle}
  //     streamDescription={streamDescription ?? undefined}
  //     channel={channel}
  //     streamId={streamId}
  //     isDashboard={false}
  //     type="vod"
  //   />
  // );
}
