import LiveStreams from "./_components/Home/LiveStreams";
import PastStreams from "./_components/Home/PastStreams";
import TrendingChannels from "./_components/Home/TrendingChannels";

export default async function Home() {
  return (
    <div className="md:pl-10 pt-4 md:pt-10">
      <LiveStreams />
      <TrendingChannels />
      <PastStreams />
    </div>
  );
}
