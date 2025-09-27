import { redirect } from "next/navigation";
import WatchWrapper from "~/app/_components/common/WatchWrapper";
import { api } from "~/trpc/server";

export default async function Clip({
  params,
}: {
  params: Promise<{ clipId: string }>;
}) {
  const clipId = (await params).clipId;

  const clip = await api.clips.getClipById({ clipId });

  if (!clip) return redirect("/not-found");

  return (
    <WatchWrapper
      hlsUrl={`https://cdn.den.show/${clip.streamId}.m3u8`}
      absStart={clip.absStart}
      absEnd={clip.absEnd}
      streamTitle={clip.title}
      channel={clip.stream.channel}
      streamId={clip.stream.id}
      isDashboard={false}
      type="clip"
    />
  );
}
