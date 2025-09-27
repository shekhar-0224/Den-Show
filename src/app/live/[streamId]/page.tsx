import { redirect } from "next/navigation";
import WatchWrapper from "~/app/_components/common/WatchWrapper";
import { api } from "~/trpc/server";

export default async function LiveStream({
  params,
}: {
  params: Promise<{ streamId: string }>;
}) {
  const streamId = (await params).streamId;

  const { streamTitle, streamDescription, channel, isMyStream } =
    await api.stream.getStreamInfo({
      streamId,
    });

  if (isMyStream) return redirect(`/live/${streamId}/dashboard`);

  return (
    <WatchWrapper
      channel={channel}
      streamId={streamId}
      streamTitle={streamTitle}
      streamDescription={streamDescription ?? undefined}
      isDashboard={false}
      type="live"
    />
  );
}
