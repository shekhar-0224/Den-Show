import { Label } from "@radix-ui/react-label";
import { useMutation as useCvxMutation } from "convex/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useDebounceValue } from "usehooks-ts";
import { useCreateChannelAtom } from "~/app/_atoms/createChannel.atom";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { useFileUpload } from "../../../_hooks/useFileUpload";

import FanPassModalContent from "../../common/FanPass/FanPassModalContent";
import TokenSearch from "./TokenSearch";

const RESERVED_HANDLES = ["clip", "live", "my-den", "profile", "watch"];

interface OnboardingProps {
  onOnboardingComplete: () => void;
}

const Onboarding = ({ onOnboardingComplete }: OnboardingProps) => {
  const [step, setStep] = useState<"details" | "tier">("details");

  const { mutateAsync } = useFileUpload();

  const createChannel = useCvxMutation(api.channel.createChannel);

  const router = useRouter();

  const [formData, setFormData] = useCreateChannelAtom();

  const handlePFPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFormData({ ...formData, pfp: file });
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFormData({ ...formData, banner: file });
  };

  const isFormValid = useMemo(() => {
    if (
      !formData.channelName ||
      !formData.channelHandle ||
      !formData.channelAbout ||
      !formData.tncAccepted ||
      !formData.token.symbol ||
      (!formData.token.isClanker && !formData.token.address)
    ) {
      return false;
    }
    return true;
  }, [formData]);

  const [isCreatingChannel, setIsCreatingChannel] = useState(false);

  const [debouncedHandle] = useDebounceValue(formData.channelHandle, 500);

  // Dummy data for handle availability
  const isHandleAvailable =
    debouncedHandle.length > 0
      ? !RESERVED_HANDLES.includes(debouncedHandle.toLowerCase())
      : true;
  const isLoadingHandleAvailable = false;
  const isFetchedHandleAvailable = true;

  const handleCreateDen = async () => {
    if (!isFormValid) return;

    try {
      setIsCreatingChannel(true);

      let bannerPicId: Id<"_storage"> | undefined;
      let profilePicId: Id<"_storage"> | undefined;

      if (formData.banner) {
        bannerPicId = await mutateAsync(formData.banner);
      }

      if (formData.pfp) {
        profilePicId = await mutateAsync(formData.pfp);
      }

      await createChannel({
        name: formData.channelName,
        handle: formData.channelHandle,
        bio: formData.channelAbout,
        nsfw: formData.nsfw,
        fanPassValue: formData.fanSubscriptionFee,
        bannerPicId,
        profilePicId,
        language: formData.language,
        // TODO: hande this logix
        token: {
          address: formData.token.address ?? "TODO",
          symbol: formData.token.symbol,
          source: formData.token.isClanker ? "clanker" : "zora",
        },
      });

      toast.success("Channel created successfully");
      onOnboardingComplete();
      router.push("/");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create channel");
    } finally {
      setIsCreatingChannel(false);
    }
  };

  if (step === "details")
    return (
      <div className="w-full">
        <div className="w-full relative">
          <div
            className={cn(
              "cursor-pointer w-full relative h-[160px]",
              !formData.banner && "bg-primary"
            )}
            onClick={() => document.getElementById("cover-input")?.click()}
          >
            {formData.banner ? (
              <Image
                src={URL.createObjectURL(formData.banner)}
                alt="Cover"
                width={0}
                height={0}
                sizes="100vw"
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src="/images/pfp-input.png"
                alt="Cover Input"
                width={51}
                height={57}
                className="absolute top-10 right-10"
              />
            )}
            <input
              id="cover-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerChange}
            />
          </div>
          <div
            className="cursor-pointer absolute -bottom-8 left-1/2 -translate-x-1/2 w-28 h-28 flex items-center justify-center rounded-full group"
            onClick={() => document.getElementById("pfp-input")?.click()}
          >
            <Image
              src="/images/pfp-input.png"
              alt="Cover Input"
              width={51}
              height={57}
              className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10"
            />
            {formData.pfp ? (
              <Image
                src={URL.createObjectURL(formData.pfp)}
                alt="PFP"
                width={112}
                height={112}
                className="rounded-full w-28 h-28 object-cover group-hover:brightness-50"
              />
            ) : (
              <Image
                src="/images/default-channel-logo.png"
                alt="PFP Input"
                width={112}
                height={112}
                className="rounded-full w-28 h-28 object-cover group-hover:brightness-50"
              />
            )}
            <input
              id="pfp-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePFPChange}
            />
          </div>
        </div>

        <div className="mt-10 px-6">
          <div className="flex items-start gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <label className="uppercase text-xs" htmlFor="channel-name">
                Channel Name
              </label>
              <Input
                maxLength={30}
                id="channel-name"
                placeholder="@mizanxali's Den"
                className="text-sm py-6 shadow-small"
                value={formData.channelName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    channelName: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-center gap-2">
                <label className="uppercase text-xs" htmlFor="symbol">
                  Channel Token Ticker
                </label>
                <Tooltip>
                  <TooltipTrigger>
                    <Image
                      src="/icons/info.svg"
                      alt="Info"
                      width={16}
                      height={16}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Search for any token - Zora, Clanker, anything.</p>
                    <p>
                      This will be your permanent Channel ticker. You won't be
                      able to change it later.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              {formData.token.isClanker ? (
                <div className="flex rounded-base items-stretch shadow-small">
                  <div className="bg-black text-sm text-white px-6 py-4 rounded-l-base">
                    $
                  </div>
                  <Input
                    maxLength={10}
                    className="flex-1 outline-none text-sm px-2.5 py-4 h-full border-l-0 rounded-l-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    id="symbol"
                    placeholder="BTC"
                    value={formData.token.symbol}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        token: {
                          ...formData.token,
                          symbol: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              ) : (
                <TokenSearch
                  onTokenSelect={(token) => {
                    setFormData({
                      ...formData,
                      token: {
                        isClanker: false,
                        address: token.address,
                        symbol: token.symbol,
                      },
                    });
                  }}
                />
              )}
              <div className="text-xs text-gray-700 flex items-center gap-1 mt-1">
                <div>
                  {formData.token.isClanker
                    ? "I already have a token."
                    : "I don't have a token."}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      token: {
                        isClanker: !formData.token.isClanker,
                        address: "",
                        symbol: "",
                      },
                    });
                  }}
                  className="text-primary font-bold hover:underline cursor-pointer"
                >
                  {formData.token.isClanker
                    ? "SEARCH for my token."
                    : "CREATE ONE for me."}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-1">
            <div className="flex flex-col gap-2">
              <label className="uppercase text-xs" htmlFor="channel-about">
                About Channel
              </label>
              <Textarea
                id="channel-about"
                className="text-sm h-36"
                placeholder="Write about your channel here"
                value={formData.channelAbout}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    channelAbout: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <label className="uppercase text-xs" htmlFor="channel-handle">
                Channel Handle
              </label>
              <div className="flex items-stretch rounded-base shadow-small">
                <div className="bg-black text-sm text-white px-6 py-4 rounded-l-base">
                  den.show/
                </div>
                <Input
                  maxLength={30}
                  className="flex-1 outline-none text-sm px-2.5 py-4 h-full border-l-0 rounded-l-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  type="text"
                  placeholder="your-channel-handle"
                  value={formData.channelHandle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      channelHandle: e.target.value.toLowerCase(),
                    })
                  }
                />
              </div>
              <div className="text-xs text-gray-700">
                {RESERVED_HANDLES.includes(
                  formData.channelHandle.toLowerCase()
                ) ? (
                  <span className="text-red-500">Invalid handle</span>
                ) : isLoadingHandleAvailable ? (
                  <span className="invisible">
                    Checking if handle is available...
                  </span>
                ) : !isLoadingHandleAvailable &&
                  isFetchedHandleAvailable &&
                  !isHandleAvailable ? (
                  <span className="text-red-500">Handle is already taken</span>
                ) : (
                  <span className="invisible">Handle is available</span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 h-full self-stretch flex-1">
              <label className="uppercase text-xs" htmlFor="channel-handle">
                Select Language [for chat]
              </label>
              <Select
                value={formData.language}
                onValueChange={(value) =>
                  setFormData({ ...formData, language: value })
                }
              >
                <SelectTrigger className="h-12 w-full shadow-small">
                  <SelectValue
                    placeholder="Select a language for chat"
                    className="py-1"
                  >
                    {formData.language}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Spanish">Spanish</SelectItem>
                  <SelectItem value="Portuguese">Portuguese</SelectItem>
                  <SelectItem value="Chinese">Chinese</SelectItem>
                  <SelectItem value="Russian">Russian</SelectItem>
                  <SelectItem value="Vietnamese">Vietnamese</SelectItem>
                  <SelectItem value="Filipino">Filipino</SelectItem>
                  <SelectItem value="Korean">Korean</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                  <SelectItem value="Japanese">Japanese</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-4">
            <Switch
              id="18-plus"
              checked={formData.nsfw}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, nsfw: checked })
              }
            />
            <Label htmlFor="18-plus" className="font-base text-sm">
              My channel caters to 18+ audience only
            </Label>
          </div>

          <div className="flex items-center space-x-2 mt-4">
            <Switch
              id="tnc"
              checked={formData.tncAccepted}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, tncAccepted: checked })
              }
            />
            <Label htmlFor="tnc" className="font-base text-sm">
              I've read the content & moderation Community Guidelines and agree
              to Den's T&C & Privacy Policy
            </Label>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              className="w-36"
              onClick={() => setStep("tier")}
              disabled={
                !isFormValid ||
                isLoadingHandleAvailable ||
                !isHandleAvailable ||
                RESERVED_HANDLES.includes(formData.channelHandle.toLowerCase())
              }
            >
              {isCreatingChannel ? "Processing..." : "Next"}
            </Button>
          </div>
        </div>
      </div>
    );

  if (step === "tier")
    return (
      <>
        <FanPassModalContent
          channelProfileUrl={"/images/default-channel-logo.png"}
          channelName={formData.channelName}
          channelHandle={formData.channelHandle}
          creatorTokenSymbol={formData.token.symbol}
          isCreatingChannel
        />
        <div className="mt-6 flex justify-end">
          <Button
            className="w-36"
            onClick={handleCreateDen}
            disabled={isCreatingChannel}
          >
            {isCreatingChannel ? "Creating..." : "Create Den"}
          </Button>
        </div>
      </>
    );
};

export default Onboarding;
