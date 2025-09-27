import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface MembershipCardProps {
  channelName: string;
  fansCount: number;
  videosCount: number;
  reward: number;
  thumbnail: string;
  pfp: string;
}

const MembershipCard = ({
  channelName,
  fansCount,
  reward,
  videosCount,
  thumbnail,
  pfp,
}: MembershipCardProps) => {
  const router = useRouter();

  return (
    <Card className={cn("w-[318px] gap-4 flex-shrink-0 justify-between p-0")}>
      <CardHeader className="p-0">
        <div className="relative">
          <Image src={thumbnail} alt="Thumbnail" width={318} height={186} />
          <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <Image
              src={pfp}
              alt="PFP"
              width={68}
              height={68}
              className="rounded-full"
            />
            <CardTitle className="font-semibold text-sm mt-1 text-center">
              {channelName}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="mt-12 px-4 pb-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex items-center justify-between flex-1">
              <div className="text-sm">Fans</div>
              <div className="text-base font-cream-medium">{fansCount}</div>
            </div>
            <div className="flex items-center justify-between flex-1">
              <div className="text-sm">Videos</div>
              <div className="text-base font-cream-medium">{videosCount}</div>
            </div>
          </div>
          <div className="flex items-center justify-between w-full">
            <Button className="w-24 h-7">Tip</Button>
          </div>
          <div className="flex items-center justify-between w-full">
            <div>{reward} $DEN</div>
            <Button className="w-24 h-7">View</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MembershipCard;
