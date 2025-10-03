import { useWallets } from "@privy-io/react-auth";
import { Label } from "@radix-ui/react-label";
import { useMutation as useCvxMutation } from "convex/react";
import { useForm } from "@tanstack/react-form";
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
  const { wallets } = useWallets();

  const embedWallet = wallets?.find((w) => w.connectorType === "embedded");

  const [step, setStep] = useState<"details" | "tier">("details");

  const { mutateAsync } = useFileUpload();

  const createChannel = useCvxMutation(api.channel.createChannel);

  const router = useRouter();

  const [formData, setFormData] = useCreateChannelAtom();

  // TanStack Form setup
  const form = useForm({
    defaultValues: {
      channelName: formData.channelName || "",
      channelHandle: formData.channelHandle || "",
      channelAbout: formData.channelAbout || "",
      nsfw: formData.nsfw || false,
      tncAccepted: formData.tncAccepted || false,
      language: formData.language || "English",
      fanSubscriptionFee: formData.fanSubscriptionFee || 0,
      token: {
        isClanker: formData.token.isClanker || false,
        address: formData.token.address || "",
        symbol: formData.token.symbol || "",
      },
      pfp: formData.pfp || null,
      banner: formData.banner || null,
    },
    onSubmit: async ({ value }) => {
      // This will be handled by the existing handleCreateDen function
      console.log("Form submitted with values:", value);
    },
  });

  const handlePFPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setFieldValue("pfp", file);
      setFormData({ ...formData, pfp: file });
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setFieldValue("banner", file);
      setFormData({ ...formData, banner: file });
    }
  };

  const isFormValid = useMemo(() => {
    const values = form.getFieldValue("channelName") && 
      form.getFieldValue("channelHandle") &&
      form.getFieldValue("channelAbout") &&
      form.getFieldValue("tncAccepted") &&
      form.getFieldValue("token.symbol") &&
      (form.getFieldValue("token.isClanker") || form.getFieldValue("token.address"));
    
    return !!values;
  }, [form]);

  const [isCreatingChannel, setIsCreatingChannel] = useState(false);

  const [debouncedHandle] = useDebounceValue(form.getFieldValue("channelHandle"), 500);

  // Dummy data for handle availability
  const isHandleAvailable =
    debouncedHandle.length > 0
      ? !RESERVED_HANDLES.includes(debouncedHandle.toLowerCase())
      : true;
  const isLoadingHandleAvailable = false;
  const isFetchedHandleAvailable = true;

  const handleCreateDen = async () => {
    if (!isFormValid) return;

    if (!embedWallet?.address) {
      toast.error("No embedded wallet found, please sign in again.");
      return;
    }

    try {
      setIsCreatingChannel(true);

      const formValues = form.getFieldValue;
      let bannerPicId: Id<"_storage"> | undefined;
      let profilePicId: Id<"_storage"> | undefined;

      const bannerFile = formValues("banner");
      if (bannerFile) {
        bannerPicId = await mutateAsync(bannerFile);
      }

      const pfpFile = formValues("pfp");
      if (pfpFile) {
        profilePicId = await mutateAsync(pfpFile);
      }

      await createChannel({
        name: formValues("channelName"),
        handle: formValues("channelHandle"),
        bio: formValues("channelAbout"),
        nsfw: formValues("nsfw"),
        fanPassValue: formValues("fanSubscriptionFee"),
        bannerPicId,
        profilePicId,
        language: formValues("language"),
        creatorAddress: embedWallet.address,
        // TODO: hande this logix
        token: {
          address: formValues("token.address") ?? "TODO",
          symbol: formValues("token.symbol"),
          source: formValues("token.isClanker") ? "clanker" : "other",
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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="w-full"
      >
        <div className="w-full relative">
          <div
            className={cn(
              "cursor-pointer w-full relative h-[160px]",
              !form.getFieldValue("banner") && "bg-primary"
            )}
            onClick={() => document.getElementById("cover-input")?.click()}
          >
            {form.getFieldValue("banner") ? (
              <Image
                src={URL.createObjectURL(form.getFieldValue("banner")!)}
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
            {form.getFieldValue("pfp") ? (
              <Image
                src={URL.createObjectURL(form.getFieldValue("pfp")!)}
                alt="PFP"
                width={112}
                height={112}
                className="rounded-full w-28 h-28 object-cover group-hover:brightness-50"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-black flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                <Image
                  src="/images/pfp-input.png"
                  alt="Upload Image"
                  width={51}
                  height={57}
                  className="opacity-100 group-hover:opacity-80"
                />
              </div>
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
              <form.Field
                name="channelName"
                validators={{
                  onChange: ({ value }) =>
                    !value ? "Channel name is required" : undefined,
                }}
              >
                {(field) => (
                  <Input
                    maxLength={30}
                    id="channel-name"
                    placeholder="@mizanxali's Den"
                    className="text-sm py-6 shadow-small"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      setFormData({
                        ...formData,
                        channelName: e.target.value,
                      });
                    }}
                    onBlur={field.handleBlur}
                  />
                )}
              </form.Field>
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
              {form.getFieldValue("token.isClanker") ? (
                <div className="flex rounded-base items-stretch shadow-small">
                  <div className="bg-black text-sm text-white px-6 py-4 rounded-l-base">
                    $
                  </div>
                  <form.Field
                    name="token.symbol"
                    validators={{
                      onChange: ({ value }) =>
                        !value ? "Token symbol is required" : undefined,
                    }}
                  >
                    {(field) => (
                      <Input
                        maxLength={10}
                        className="flex-1 outline-none text-sm px-2.5 py-4 h-full border-l-0 rounded-l-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        id="symbol"
                        placeholder="BTC"
                        value={field.state.value}
                        onChange={(e) => {
                          field.handleChange(e.target.value);
                          setFormData({
                            ...formData,
                            token: {
                              ...formData.token,
                              symbol: e.target.value,
                            },
                          });
                        }}
                        onBlur={field.handleBlur}
                      />
                    )}
                  </form.Field>
                </div>
              ) : (
                <TokenSearch
                  onTokenSelect={(token) => {
                    form.setFieldValue("token.address", token.address);
                    form.setFieldValue("token.symbol", token.symbol);
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
                  {form.getFieldValue("token.isClanker")
                    ? "I already have a token."
                    : "I don't have a token."}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newIsClanker = !form.getFieldValue("token.isClanker");
                    form.setFieldValue("token.isClanker", newIsClanker);
                    form.setFieldValue("token.address", "");
                    form.setFieldValue("token.symbol", "");
                    setFormData({
                      ...formData,
                      token: {
                        isClanker: newIsClanker,
                        address: "",
                        symbol: "",
                      },
                    });
                  }}
                  className="text-primary font-bold hover:underline cursor-pointer"
                >
                  {form.getFieldValue("token.isClanker")
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
              <form.Field
                name="channelAbout"
                validators={{
                  onChange: ({ value }) =>
                    !value ? "Channel description is required" : undefined,
                }}
              >
                {(field) => (
                  <Textarea
                    id="channel-about"
                    className="text-sm h-36"
                    placeholder="Write about your channel here"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      setFormData({
                        ...formData,
                        channelAbout: e.target.value,
                      });
                    }}
                    onBlur={field.handleBlur}
                  />
                )}
              </form.Field>
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
                <form.Field
                  name="channelHandle"
                  validators={{
                    onChange: ({ value }) =>
                      !value ? "Channel handle is required" : undefined,
                  }}
                >
                  {(field) => (
                    <Input
                      maxLength={30}
                      className="flex-1 outline-none text-sm px-2.5 py-4 h-full border-l-0 rounded-l-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      type="text"
                      placeholder="your-channel-handle"
                      value={field.state.value}
                      onChange={(e) => {
                        const value = e.target.value.toLowerCase();
                        field.handleChange(value);
                        setFormData({
                          ...formData,
                          channelHandle: value,
                        });
                      }}
                      onBlur={field.handleBlur}
                    />
                  )}
                </form.Field>
              </div>
              <div className="text-xs text-gray-700">
                {RESERVED_HANDLES.includes(
                  form.getFieldValue("channelHandle").toLowerCase()
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
              <label className="uppercase text-xs" htmlFor="language">
                Select Language [for chat]
              </label>
              <form.Field
                name="language"
                validators={{
                  onChange: ({ value }) =>
                    !value ? "Language is required" : undefined,
                }}
              >
                {(field) => (
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      field.handleChange(value);
                      setFormData({ ...formData, language: value });
                    }}
                  >
                    <SelectTrigger className="h-12 w-full shadow-small">
                      <SelectValue
                        placeholder="Select a language for chat"
                        className="py-1"
                      >
                        {field.state.value}
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
                )}
              </form.Field>
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-4">
            <form.Field
              name="nsfw"
            >
              {(field) => (
                <Switch
                  id="18-plus"
                  checked={field.state.value}
                  onCheckedChange={(checked) => {
                    field.handleChange(checked);
                    setFormData({ ...formData, nsfw: checked });
                  }}
                />
              )}
            </form.Field>
            <Label htmlFor="18-plus" className="font-base text-sm">
              My channel caters to 18+ audience only
            </Label>
          </div>

          <div className="flex items-center space-x-2 mt-4">
            <form.Field
              name="tncAccepted"
              validators={{
                onChange: ({ value }) =>
                  !value ? "You must accept the terms and conditions" : undefined,
              }}
            >
              {(field) => (
                <Switch
                  id="tnc"
                  checked={field.state.value}
                  onCheckedChange={(checked) => {
                    field.handleChange(checked);
                    setFormData({ ...formData, tncAccepted: checked });
                  }}
                />
              )}
            </form.Field>
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
                RESERVED_HANDLES.includes(form.getFieldValue("channelHandle").toLowerCase())
              }
            >
              {isCreatingChannel ? "Processing..." : "Next"}
            </Button>
          </div>
        </div>
      </form>
    );

  if (step === "tier")
    return (
      <>
        <FanPassModalContent
          channelProfileUrl={"/images/default-channel-logo.png"}
          channelName={form.getFieldValue("channelName")}
          channelHandle={form.getFieldValue("channelHandle")}
          creatorTokenSymbol={form.getFieldValue("token.symbol")}
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
