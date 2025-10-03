import React from "react";
import { Card } from "~/components/ui/card";

// tRPC removed - using dummy data instead

interface CreatorTokenStatsProps {
  tokenAddress: string;
}

const CreatorTokenStats = ({ tokenAddress }: CreatorTokenStatsProps) => {
  // if (!marketData) return null;
  return null;

  // return (
  //   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-0 md:mt-4">
  //     <Card className="text-main bg-main-foreground border-2 border-main shadow-small-inverted flex flex-col items-center justify-center gap-2">
  //       <div>${Number(marketData.marketCap).toFixed(2)}</div>
  //       <div className="text-sm md:text-base text-center">Market Cap</div>
  //     </Card>
  //     <Card className="text-main bg-main-foreground border-2 border-main shadow-small-inverted flex flex-col items-center justify-center gap-2">
  //       <div>${Number(marketData.volume).toFixed(4)}</div>
  //       <div className="text-sm md:text-base text-center">Volume 24h</div>
  //     </Card>
  //   </div>
  // );
};

export default CreatorTokenStats;
