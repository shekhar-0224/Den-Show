import LiveStreams from "./_components/Home/LiveStreams";
import PastStreams from "./_components/Home/PastStreams";
import TrendingChannels from "./_components/Home/TrendingChannels";
import Clips from "./_components/Home/Clips";
import UpcomingEvents from "./_components/Home/UpcomingEvents";

export default async function Home() {
  return (
    <div className="md:pl-10 pt-4 md:pt-10">
      <LiveStreams />
      <TrendingChannels />
      <Clips />
      <UpcomingEvents />
      <PastStreams />
    </div>
  );
}
