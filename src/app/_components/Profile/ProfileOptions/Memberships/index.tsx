import React from "react";
// import { api } from "~/trpc/react";
// import MembershipCard from "./MembershipCard";

const Memberships = () => {
  // const { data: subscriptions } = api.profile.getMySubscriptions.useQuery();

  // if (subscriptions && subscriptions.length > 0) {
  //   return (
  //     <div className="gap-2 w-full p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
  //       {subscriptions.map((membership) => (
  //         <MembershipCard
  //           key={membership.subscription.id}
  //           channelName={membership.channelDetails.name}
  //           thumbnail={membership.channelDetails.bannerUrl ?? ""}
  //           pfp={membership.channelDetails.profileUrl ?? ""}
  //           fansCount={membership.channelMetrics.fanCount}
  //           videosCount={membership.channelMetrics.videos}
  //           reward={membership.channelMetrics.rewardVault}
  //         />
  //       ))}
  //     </div>
  //   );
  // }

  return (
    <div className="text-center text-sm font-medium mt-4">
      No channel memberships found
    </div>
  );
};

export default Memberships;
