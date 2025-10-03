import { redirect } from "next/navigation";
import WatchWrapper from "~/app/_components/common/WatchWrapper";
// tRPC removed - using dummy data instead

export default async function LiveStream({
  params,
}: {
  params: Promise<{ streamId: string }>;
}) {
  const streamId = (await params).streamId;

  const { streamTitle, streamDescription, channel, isMyStream, demoPlaybackId } = {
    streamTitle: "Ishan Live Stream",
    streamDescription: "Join xyz",
    demoPlaybackId: "DS00Spx1CV902MCtPj5WknGlR102V5HFkDe",
    channel: {
      id: "ishan",
      bio: "Welcome",
      profileUrl: "/images/default-pfp.png",
      name: "New Streamer",
      handle: "demostreamer",
      createdAt: new Date("2024-01-01"),
      creatorTokenSymbol: "DEMO",
      creatorTokenAddress: "0x1234567890abcdef",
      user: {
        id: "ishan",
        denWalletAddress: "0xabcdef1234567890",
      },
    },
    isMyStream: false,
  };

  if (isMyStream) return redirect(`/live/${streamId}/dashboard`);

  return (
    <WatchWrapper
      channel={channel}
      streamId={streamId}
      streamTitle={streamTitle}
      streamDescription={streamDescription ?? undefined}
      demoPlaybackId={demoPlaybackId}
      isDashboard={false}
      type="live"
    />
  );
}
