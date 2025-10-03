"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useWallets } from "@privy-io/react-auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import StartStream from "../GoLive/StartStream";
import Onboarding from "../MyDen/Onboarding";
import ChannelVerificationPopup from "../MyDen/ChannelVerificationPopup";
import { useFileUpload } from "../../_hooks/useFileUpload";
import GlobalSearch from "./GlobalSearch";
import LoginButton from "./LoginButton";
import { Logout } from "./Logout";

const Navbar = () => {
  const myChannel = useQuery(api.channel.getMyChannel);
  const createChannel = useMutation(api.channel.createChannel);
  const { mutateAsync: uploadFile } = useFileUpload();
  const { wallets } = useWallets();
  const router = useRouter();

  const embedWallet = wallets?.find((w) => w.connectorType === "embedded");

  const isChannelOwner = !!myChannel;

  // TODO: use this loading state to avoid flicker on initial load
  const { isAuthenticated, isLoading: _ } = useConvexAuth();

  const [isStartStreamOpen, setIsStartStreamOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [verificationData, setVerificationData] = useState<{
    channelName: string;
    channelHandle: string;
    channelAbout: string;
    nsfw: boolean;
    language: string;
    fanSubscriptionFee: number;
    token: {
      isClanker: boolean;
      address: string;
      symbol: string;
    };
    pfp: File | null;
    banner: File | null;
  } | null>(null);

  const handleCreateChannel = async () => {
    if (!verificationData) return;

    if (!embedWallet?.address) {
      toast.error("No embedded wallet found, please sign in again.");
      return;
    }

    try {
      setIsCreatingChannel(true);

      let bannerPicId: Id<"_storage"> | undefined;
      let profilePicId: Id<"_storage"> | undefined;

      if (verificationData.banner) {
        bannerPicId = await uploadFile(verificationData.banner);
      }

      if (verificationData.pfp) {
        profilePicId = await uploadFile(verificationData.pfp);
      }

      await createChannel({
        name: verificationData.channelName,
        handle: verificationData.channelHandle,
        bio: verificationData.channelAbout,
        nsfw: verificationData.nsfw,
        fanPassValue: verificationData.fanSubscriptionFee,
        bannerPicId,
        profilePicId,
        language: verificationData.language,
        creatorAddress: embedWallet.address,
        token: {
          address: verificationData.token.address || "TODO",
          symbol: verificationData.token.symbol,
          source: verificationData.token.isClanker ? "clanker" : "other",
        },
      });

      toast.success("Channel created successfully");
      setIsVerificationOpen(false);
      setVerificationData(null);
      router.push("/my-den");
    } catch (error) {
      console.error("Error creating channel:", error);
      toast.error("Failed to create channel. Please try again.");
    } finally {
      setIsCreatingChannel(false);
    }
  };

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
                  onShowVerification={(data) => {
                    setVerificationData(data);
                    setIsOnboardingOpen(false);
                    setIsVerificationOpen(true);
                  }}
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
        <Logout />
      </div>

      {/* Verification Popup */}
      {verificationData && (
        <ChannelVerificationPopup
          isOpen={isVerificationOpen}
          onClose={() => {
            setIsVerificationOpen(false);
            setVerificationData(null);
          }}
          onConfirm={handleCreateChannel}
          channelName={verificationData.channelName}
          channelHandle={verificationData.channelHandle}
          tokenSymbol={verificationData.token.symbol}
          isCreatingChannel={isCreatingChannel}
        />
      )}
    </div>
  );
};

export default Navbar;
