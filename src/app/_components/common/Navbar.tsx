"use client";

import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import StartStream from "../GoLive/StartStream";
import Onboarding from "../MyDen/Onboarding";
import GlobalSearch from "./GlobalSearch";
import LoginButton from "./LoginButton";
import { TestComp } from "./TestComp";

interface NavbarProps {
  isAuthenticated: boolean;
}

const Navbar = ({ isAuthenticated }: NavbarProps) => {
  const { user } = usePrivy();

  const isChannelOwner = false;

  const profilePic =
    user?.linkedAccounts.find((acc) => acc.type === "twitter_oauth")
      ?.profilePictureUrl ||
    user?.linkedAccounts.find((acc) => acc.type === "farcaster")?.pfp ||
    "/images/default-pfp.png";

  const [isStartStreamOpen, setIsStartStreamOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  return (
    <div className="bg-background flex items-center justify-between px-12 py-2.5 border-b border-black">
      <div className="flex items-center gap-6">
        <Link href="/">
          <Image src="/images/den-logo.png" alt="Den" width={83} height={28} />
        </Link>
        <GlobalSearch />
        <div className="hidden md:flex items-center gap-4">
          {/* <Link href="/explore" className="hover:underline">
            <div className="flex items-center gap-1.5">
              <div className="text-lg font-cream-medium tracking-tighter">
                Explore
              </div>
              <Image
                src="/icons/explore.svg"
                alt="Explore"
                width={17}
                height={16}
              />
            </div>
          </Link> */}
          {isAuthenticated &&
            (isChannelOwner ? (
              <Link href="/my-den" className="hover:underline">
                <div className="flex items-center gap-1.5">
                  <div className="text-lg font-cream-medium tracking-tighter">
                    My Den
                  </div>
                  <Image
                    src="/icons/den.svg"
                    alt="Den"
                    width={17}
                    height={16}
                    className="mr-0.5"
                  />
                </div>
              </Link>
            ) : (
              <Dialog
                open={isOnboardingOpen}
                onOpenChange={setIsOnboardingOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Image
                      src="/icons/den.svg"
                      alt="Den"
                      width={17}
                      height={16}
                    />
                    Start My Den
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[670px] flex flex-col pt-1 shadow-large">
                  <DialogTitle className="text-lg font-cream-medium tracking-tighter text-center">
                    {/* Set up your Den */}
                    {}
                  </DialogTitle>
                  <Onboarding
                    onOnboardingComplete={() => setIsOnboardingOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {isAuthenticated &&
          (isChannelOwner ? (
            <Dialog
              open={isStartStreamOpen}
              onOpenChange={setIsStartStreamOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Image
                    src="/icons/create.svg"
                    alt="Create"
                    width={14}
                    height={14}
                    className="mr-0.5"
                  />
                  Go Live
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[670px] flex flex-col pt-1">
                <DialogTitle className="text-lg font-cream-medium tracking-tighter text-center">
                  {/* Set up your Den */}
                  {}
                </DialogTitle>
                <StartStream
                  onStartStream={() => setIsStartStreamOpen(false)}
                />
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Image
                    src="/icons/create.svg"
                    alt="Create"
                    width={14}
                    height={14}
                    className="mr-0.5"
                  />
                  Go Live
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[670px] flex flex-col pt-1">
                <DialogTitle className="text-lg font-cream-medium tracking-tighter text-center">
                  {/* Set up your Den */}
                  {}
                </DialogTitle>
                <Onboarding
                  onOnboardingComplete={() => setIsOnboardingOpen(false)}
                />
              </DialogContent>
            </Dialog>
          ))}
        <TestComp />
        {user ? (
          <Link href="/profile">
            <Image
              src={profilePic}
              alt="Profile"
              width={40}
              height={40}
              className="rounded-full border border-border"
            />
          </Link>
        ) : (
          <LoginButton />
        )}
      </div>
    </div>
  );
};

export default Navbar;
