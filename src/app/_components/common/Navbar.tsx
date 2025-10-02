"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

interface NavbarProps {
  isAuthenticated: boolean;
}

const Navbar = ({ isAuthenticated }: NavbarProps) => {
  const router = useRouter();

  const isChannelOwner = false; // TODO: fetch from user state

  const [isStartStreamOpen, setIsStartStreamOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  return (
    <div className="bg-background flex items-center justify-between px-12 py-2.5 border-b border-black">
      <div className="flex items-center gap-6">
        <Link href="/">
          <Image src="/images/den-logo.png" alt="Den" width={83} height={28} />
        </Link>
        <GlobalSearch />
        <div className="hidden md:flex items-center gap-8">
          {/* Explore Link - Always visible */}
          <Link href="/explore" className="hover:underline">
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
          </Link>

          {/* Clips Link - Always visible */}
          <Link href="/clips" className="hover:underline">
            <div className="flex items-center gap-1.5">
              <div className="text-lg font-cream-medium tracking-tighter">
                Clips
              </div>
              <Image
                src="/icons/scissors.svg"
                alt="Clips"
                width={17}
                height={16}
              />
            </div>
          </Link>

          {/* Den Studio Link - Only visible when authenticated */}
          {isAuthenticated &&
            (isChannelOwner ? (
              <Link href="/my-den" className="hover:underline">
                <div className="flex items-center gap-1.5">
                  <div className="text-lg font-cream-medium tracking-tighter">
                    Den Studio
                  </div>
                  <Image
                    src="/icons/den.svg"
                    alt="Den Studio"
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
                <DialogContent className="w-[612px] h-auto flex flex-col pt-1 shadow-large">
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
              <DialogContent className="w-[612px] h-auto flex flex-col pt-1 shadow-large">
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
              <DialogContent className="w-[612px] h-auto flex flex-col pt-1 shadow-large">
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
        {isAuthenticated ? (
          <Link href="/profile">
            <Image
              src="/images/default-pfp.png"
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
