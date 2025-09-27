import ChannelWrapper from "~/app/_components/Channel/ChannelWrapper";

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  return <ChannelWrapper handle={handle} />;
}
