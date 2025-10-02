import { preloadQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import Clips from "./_components/Home/Clips";
import LiveStreams from "./_components/Home/LiveStreams";
import PastStreams from "./_components/Home/PastStreams";
import TrendingChannels from "./_components/Home/TrendingChannels";
import UpcomingEvents from "./_components/Home/UpcomingEvents";

export default async function Home() {
  const [preloadedGetCurrentLiveStreams] = await Promise.all([
    preloadQuery(api.stream.getCurrentLiveStreams),
  ]);

  return (
    <div className="md:pl-10 pt-4 md:pt-10">
      <LiveStreams
        preloadedGetCurrentLiveStreams={preloadedGetCurrentLiveStreams}
      />
      <TrendingChannels />
      <Clips />
      <UpcomingEvents />
      <PastStreams />
    </div>
  );
}
