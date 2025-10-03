import Image from "next/image";
import { redirect } from "next/navigation";
// tRPC removed - using dummy data instead

export default async function MyDen() {
  // Dummy API call - using dummy data instead
  const channel = null; // Simulate no channel found

  if (!channel) redirect("/");
  else redirect(`/${channel.handle}`);

  // return (
  //   <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
  //     {channel.profileUrl && (
  //       <Image
  //         src={channel.profileUrl}
  //         alt={channel.name}
  //         width={100}
  //         height={100}
  //       />
  //     )}
  //     <div className="text-2xl font-bold font-cream-medium">{channel.name}</div>
  //     <div className="text-sm font-cream-regular">{channel.bio}</div>
  //     <div className="text-lg font-bold font-cream-medium">
  //       @{channel.handle}
  //     </div>
  //     <div className="text-lg font-bold font-cream-medium">
  //       ${channel.creatorTokenSymbol}
  //     </div>
  //   </div>
  // );
}
