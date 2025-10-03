"use client";

import { useFundWallet, useLinkAccount } from "@privy-io/react-auth";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "sonner";
import { formatEther } from "viem";
import { base } from "viem/chains";
import { useBalance } from "wagmi";
import useAddress from "~/app/_hooks/useAddress";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Skeleton } from "~/components/ui/skeleton";
import { formatDate } from "~/lib/utils";
// import { api } from "~/trpc/react";
import Onboarding from "../../MyDen/Onboarding";

const ProfileDetails = () => {
  const { address } = useAddress();
  const { fundWallet } = useFundWallet();

  const { data: balance } = useBalance({
    address: address ? (address as `0x${string}`) : undefined,
  });

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Dummy data for profile details
  const profileDetails = {
    id: "profile1",
    name: "John Doe",
    handle: "johndoe",
    profileUrl: "/images/default-pfp.png",
    bio: "Content creator and developer",
    followers: 1234,
    following: 567,
    isVerified: true,
    socialLinks: {
      twitter: "https://twitter.com/johndoe",
      farcaster: "https://warpcast.com/johndoe",
    },
    xHandle: "johndoe_x",
    farcasterHandle: "johndoe_fc",
    joinedOn: "2023-01-15T00:00:00Z",
    clips: 42,
    // minutesWatched: 1200,
    // paidInSubscriptions: 500,
    // denEarned: 150,
    // tipsEarned: 75,
    username: "johndoe",
  };
  const isLoading = false;

  // Dummy function for linking social account
  const linkSocialAccount = (data: any) => {
    console.log("Dummy linkSocialAccount called with:", data);
    toast.success("Social account linked successfully!");
  };

  const { linkTwitter, linkFarcaster, linkEmail } = useLinkAccount({
    onSuccess: ({ user, linkMethod, linkedAccount }) => {
      if (linkMethod === "twitter" && user.twitter?.username) {
        linkSocialAccount({
          type: "twitter",
          id: user.twitter.subject,
          username: user.twitter.username,
        });
      } else if (
        linkMethod === "farcaster" &&
        user.farcaster?.username &&
        user.farcaster?.fid
      ) {
        linkSocialAccount({
          type: "farcaster",
          id: user.farcaster.fid.toString(),
          username: user.farcaster.username,
        });
      } else {
        toast.error("Failed to link account");
      }
    },
    onError: (error) => {
      console.error("Failed to link account with error ", error);
      toast.error("Failed to link account");
    },
  });

  if (isLoading)
    return (
      <div className="grid grid-cols-4 grid-rows-1 md:grid-cols-1 md:grid-rows-4  md:border-b border-black py-4">
        <div className="col-span-4 md:col-span-1 md:row-span-1 flex flex-row md:flex-col items-center justify-between px-6 gap-4 md:gap-0">
          <Image
            src={"/images/default-pfp.png"}
            alt="Profile"
            width={100}
            height={100}
          />
          <div className="flex-1 flex flex-col items-center justify-center w-full gap-2.5">
            <Skeleton className="w-[100px] h-[20px] rounded-base mt-1" />
            <div className="flex items-center justify-between w-full">
              <div className="text-sm">X</div>
              <Skeleton className="w-[100px] h-[20px] rounded-base" />
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="text-sm">Farcaster</div>
              <Skeleton className="w-[100px] h-[20px] rounded-base" />
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="text-sm">Den URL</div>
              <Skeleton className="w-[100px] h-[20px] rounded-base" />
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="text-sm">Joined on</div>
              <Skeleton className="w-[100px] h-[20px] rounded-base" />
            </div>
          </div>
        </div>
        <div className="hidden md:flex col-span-1 md:row-span-1 flex-col items-center justify-around px-6 gap-4">
          <div className="flex flex-col items-center">
            <Skeleton className="w-[100px] h-[42px] mb-1.5 rounded-base" />
            <div className="text-sm">Fan Passes</div>
          </div>
          <div className="flex items-center w-full justify-between">
            <div className="flex flex-col items-center flex-1">
              <Skeleton className="w-[100px] h-[42px] mb-1.5 rounded-base" />
              <div className="text-sm">Minutes Watched</div>
            </div>
            <div className="flex flex-col items-center flex-1">
              <Skeleton className="w-[100px] h-[42px] mb-1.5 rounded-base" />
              <div className="text-sm">Tipped</div>
            </div>
          </div>
        </div>
        <div className="hidden md:flex col-span-2 md:col-span-1 flex-col items-center justify-between px-6 gap-4">
          <div className="flex items-center w-full">
            <div className="flex flex-col items-center flex-1">
              <Skeleton className="w-[100px] h-[42px] mb-1.5 rounded-base" />
              <div className="text-sm">$ Paid in Subscriptions</div>
            </div>
            <div className="flex flex-col items-center flex-1">
              <Skeleton className="w-[100px] h-[42px] mb-1.5 rounded-base" />
              <div className="text-sm">$DEN Earned</div>
            </div>
            <div className="flex flex-col items-center flex-1">
              <Skeleton className="w-[100px] h-[42px] mb-1.5 rounded-base" />
              <div className="text-sm">$ Earned in Tips</div>
            </div>
          </div>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Skeleton className="w-[120px] h-[24px] rounded-base" />
              <div className="text-sm">ETH Balance</div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-[100px] h-[40px] rounded-base" />
              <Skeleton className="w-[100px] h-[40px] rounded-base" />
            </div>
          </div>

          <div className="border-black border flex items-center justify-between w-full gap-4 p-2.5">
            <Skeleton className="w-[340px] h-[20px] my-2 rounded-base" />
          </div>
        </div>
      </div>
    );

  if (!profileDetails) return null;

  const {
    xHandle,
    farcasterHandle,
    joinedOn,
    clips,
    // minutesWatched,
    // paidInSubscriptions,
    // denEarned,
    // tipsEarned,
    // handle,
  } = profileDetails;

  const minutesWatched = 0;
  const paidInSubscriptions = 0;
  const denEarned = 0;
  const tipsEarned = 0;
  const handle = profileDetails.username;

  return (
    <div className="grid grid-cols-4 grid-rows-1 md:grid-cols-1 md:grid-rows-4 border-black py-4 md:border-r">
      <div className="col-span-4 md:col-span-1 md:row-span-1 flex flex-row md:flex-col items-center justify-between px-6 gap-4 md:gap-0">
        <Image
          src={"/images/default-pfp.png"}
          alt="Profile"
          width={100}
          height={100}
        />
        <div className="flex-1 flex flex-col items-center justify-center w-full gap-2.5">
          <div className="text-lg font-cream-regular underline self-start md:self-center">
            @{handle}
          </div>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm">X</div>
            <div className="text-sm font-cream-regular">
              {xHandle ? (
                `@${xHandle}`
              ) : (
                <button
                  type="button"
                  className="underline cursor-pointer"
                  onClick={linkTwitter}
                >
                  Connect
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm">Farcaster</div>
            <div className="text-sm font-cream-regular">
              {farcasterHandle ? (
                `@${farcasterHandle}`
              ) : (
                <button
                  type="button"
                  className="underline cursor-pointer"
                  onClick={linkFarcaster}
                >
                  Connect
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm">Den URL</div>
            <div className="text-sm font-cream-regular">
              {handle ? (
                <Link
                  href={`https://den.show/${handle}`}
                  target="_blank"
                  className="underline cursor-pointer"
                >
                  den.show/{handle}
                </Link>
              ) : (
                <Dialog
                  open={isOnboardingOpen}
                  onOpenChange={setIsOnboardingOpen}
                >
                  <DialogTrigger asChild>
                    <button type="button" className="underline cursor-pointer">
                      Start My Den
                    </button>
                  </DialogTrigger>
                  <DialogContent className="w-[612px] h-auto flex flex-col pt-1 shadow-large">
                    <DialogTitle className="text-lg font-cream-medium tracking-tighter text-center">
                      {}
                    </DialogTitle>
                    <Onboarding
                      onOnboardingComplete={() => setIsOnboardingOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm">Joined on</div>
            <div className="text-sm font-cream-regular">
              {formatDate(new Date(joinedOn))}
            </div>
          </div>
        </div>
      </div>
      <div className="hidden md:flex col-span-1 md:row-span-1 flex-col items-center justify-around px-6 gap-4">
        <div className="flex flex-col items-center">
          <div className="text-[32px] font-cream-medium">0</div>
          <div className="text-sm">Fan Passes</div>
        </div>
        <div className="flex items-center w-full justify-between">
          <div className="flex flex-col items-center flex-1">
            <div className="text-[32px] font-cream-medium">
              {minutesWatched}
            </div>
            <div className="text-sm">Minutes Watched</div>
          </div>
          <div className="flex flex-col items-center flex-1">
            <div className="text-[32px] font-cream-medium">{clips}</div>
            <div className="text-sm">Clips</div>
          </div>
        </div>
      </div>
      <div className="hidden md:flex col-span-2 md:col-span-1 md:row-span-2 flex-col items-center justify-between px-6 gap-4">
        <div className="flex items-center w-full">
          <div className="flex flex-col items-center flex-1">
            <div className="text-[32px] font-cream-medium text-[#FFB901]">
              {paidInSubscriptions}
            </div>
            <div className="text-sm">$ Paid in Subscriptions</div>
          </div>
          <div className="flex flex-col items-center flex-1">
            <div className="text-[32px] font-cream-medium text-[#008000]">
              ${denEarned}
            </div>
            <div className="text-sm">$DEN Earned</div>
          </div>
          <div className="flex flex-col items-center flex-1">
            <div className="text-[32px] font-cream-medium text-[#008000]">
              ${tipsEarned}
            </div>
            <div className="text-sm">$ Earned in Tips</div>
          </div>
        </div>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {balance ? (
              <div className="text-2xl font-cream-medium">
                {Number(formatEther(balance.value)).toFixed(6)}
              </div>
            ) : (
              <Skeleton className="w-[120px] h-[24px] rounded-base" />
            )}
            <div className="text-sm">ETH Balance</div>
          </div>
          {address ? (
            <div className="flex items-center gap-2">
              <Button onClick={() => fundWallet({ address })}>Add</Button>
              <Button>Withdraw</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Skeleton className="w-[100px] h-[40px] rounded-base" />
              <Skeleton className="w-[100px] h-[40px] rounded-base" />
            </div>
          )}
        </div>
        <div className="border-black border flex items-center justify-between w-full gap-4 p-2.5">
          {address ? (
            <div className="text-sm">{address}</div>
          ) : (
            <Skeleton className="w-[340px] h-[20px] my-2 rounded-base" />
          )}
          {address && (
            <Button
              size={"icon"}
              onClick={() => {
                navigator.clipboard.writeText(address);
                toast.success("Copied Address to clipboard");
              }}
            >
              <Image
                src="/icons/copy-inverted.svg"
                alt="Bookmark"
                width={12}
                height={12}
              />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;
