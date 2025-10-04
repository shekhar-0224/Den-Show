import { useWallets } from "@privy-io/react-auth";
import { Label } from "@radix-ui/react-label";
import { revalidateLogic, useForm, useStore } from "@tanstack/react-form";
import { useMutation as useCvxMutation } from "convex/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useDebounceValue } from "usehooks-ts";
import z from "zod";
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
  onShowVerification?: (data: {
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
  }) => void;
}

interface FormValues {
  channelName: string;
  channelHandle: string;
  channelAbout: string;
  nsfw: boolean;
  tncAccepted: boolean;
  language: string;
  fanSubscriptionFee: number;
  token: {
    isClanker: boolean;
    address: string;
    symbol: string;
  };
  pfp: File | null;
  banner: File | null;
}

const Onboarding = ({
  onOnboardingComplete,
  onShowVerification,
}: OnboardingProps) => {
  const { wallets } = useWallets();
  const embedWallet = wallets?.find((w) => w.connectorType === "embedded");
  const [step, setStep] = useState<"details" | "tier" | "verification">(
    "details"
  );
  const { mutateAsync } = useFileUpload();
  const createChannel = useCvxMutation(api.channel.createChannel);
  const router = useRouter();
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        channelName: z.string().min(1, "Channel name is required").max(50),
        channelHandle: z
          .string()
          .min(1, "Channel handle is required")
          .max(30, "Channel handle too long"),
        channelAbout: z
          .string()
          .min(1, "Channel description is required")
          .max(160),
        nsfw: z.boolean(),
        tncAccepted: z.boolean("You must accept the terms and conditions"),
        language: z.string().min(2, "Language is required").max(100),
        fanSubscriptionFee: z.number().min(0),
        token: z.object({
          isClanker: z.boolean(),
          address: z.string().max(100),
          symbol: z.string().min(1, "Token symbol is required").max(10),
        }),
        pfp: z.instanceof(File).nullable(),
        banner: z.instanceof(File).nullable(),
      }),
    []
  );

  // Initialize form with proper default values
  const form = useForm({
    defaultValues: {
      channelName: "",
      channelHandle: "",
      channelAbout: "",
      nsfw: false,
      tncAccepted: false,
      language: "English",
      fanSubscriptionFee: 0,
      token: {
        isClanker: false,
        address: "",
        symbol: "",
      },
      pfp: null as File | null,
      banner: null as File | null,
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: schema,
    },
    onSubmit: async ({ value }) => {
      await handleFormSubmit(value);
    },
  });

  const handlePFPChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        form.setFieldValue("pfp", file);
      }
    },
    [form]
  );

  const handleBannerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        form.setFieldValue("banner", file);
      }
    },
    [form]
  );

  const [debouncedHandle] = useDebounceValue(
    form.state.values.channelHandle,
    500
  );

  // Handle availability check
  const isHandleAvailable = useMemo(() => {
    if (debouncedHandle.length === 0) return true;
    return !RESERVED_HANDLES.includes(debouncedHandle.toLowerCase());
  }, [debouncedHandle]);

  const isLoadingHandleAvailable = false;
  const isFetchedHandleAvailable = true;

  // Form validation state
  const isFormValid = useMemo(() => {
    return (
      form.state.isValid &&
      form.state.canSubmit &&
      !isLoadingHandleAvailable &&
      isHandleAvailable &&
      !RESERVED_HANDLES.includes(form.state.values.channelHandle.toLowerCase())
    );
  }, [
    form.state.isValid,
    form.state.canSubmit,
    isHandleAvailable,
    form.state.values.channelHandle,
  ]);

  const handleCreateDen = async (values: FormValues) => {
    if (!embedWallet?.address) {
      toast.error("No embedded wallet found, please sign in again.");
      return;
    }

    try {
      setIsCreatingChannel(true);

      let bannerPicId: Id<"_storage"> | undefined;
      let profilePicId: Id<"_storage"> | undefined;

      if (values.banner) {
        bannerPicId = await mutateAsync(values.banner);
      }

      if (values.pfp) {
        profilePicId = await mutateAsync(values.pfp);
      }

      await createChannel({
        name: values.channelName,
        handle: values.channelHandle,
        bio: values.channelAbout,
        nsfw: values.nsfw,
        fanPassValue: values.fanSubscriptionFee,
        bannerPicId,
        profilePicId,
        language: values.language,
        creatorAddress: embedWallet.address,
        token: {
          address: values.token.address || "TODO",
          symbol: values.token.symbol,
          source: values.token.isClanker ? "clanker" : "other",
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

  const handleFormSubmit = async (values: FormValues) => {
    if (step === "details") {
      // Just move to the next step, don't create channel yet
      setStep("tier");
    } else if (step === "tier") {
      // Show verification popup outside the dialog
      if (onShowVerification) {
        onShowVerification({
          channelName: values.channelName,
          channelHandle: values.channelHandle,
          channelAbout: values.channelAbout,
          nsfw: values.nsfw,
          language: values.language,
          fanSubscriptionFee: values.fanSubscriptionFee,
          token: values.token,
          pfp: values.pfp,
          banner: values.banner,
        });
      }
    } else {
      // Create the channel when in verification step
      await handleCreateDen(values);
    }
  };

  const reactiveIsClanker = useStore(
    form.store,
    (state) => state.values.token.isClanker
  );

  return (
    <div className="p-4">
      {step === "details" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (form.state.isValid) {
              form.handleSubmit();
            }
          }}
          className="w-full max-w-[580px] mx-auto"
        >
          <div className="w-full relative">
            <div
              className={cn(
                "cursor-pointer w-full relative h-[120px]",
                !form.state.values.banner && "bg-primary"
              )}
              onClick={() => document.getElementById("cover-input")?.click()}
            >
              {form.state.values.banner ? (
                <Image
                  src={URL.createObjectURL(form.state.values.banner)}
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
                  width={40}
                  height={45}
                  className="absolute top-6 right-6"
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
              className="cursor-pointer absolute -bottom-6 left-1/2 -translate-x-1/2 w-20 h-20 flex items-center justify-center rounded-full group"
              onClick={() => document.getElementById("pfp-input")?.click()}
            >
              {form.state.values.pfp ? (
                <Image
                  src={URL.createObjectURL(form.state.values.pfp)}
                  alt="PFP"
                  width={80}
                  height={80}
                  className="rounded-full w-20 h-20 object-cover group-hover:brightness-50"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                  <Image
                    src="/images/pfp-input.png"
                    alt="Upload Image"
                    width={36}
                    height={40}
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

          <div className="mt-6 px-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-1 flex-col gap-2">
                <label className="uppercase text-xs" htmlFor="channel-name">
                  Channel Name
                </label>
                <form.Field
                  name="channelName"
                  validators={{
                    onChange: ({ value }) =>
                      !value?.trim() ? "Channel name is required" : undefined,
                  }}
                >
                  {(field) => (
                    <>
                      <Input
                        maxLength={30}
                        id="channel-name"
                        placeholder="@mizanxali's Den"
                        className="text-sm h-10 shadow-small"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <div className="text-red-500 text-xs mt-1">
                          {field.state.meta.errors[0]?.toString()}
                        </div>
                      )}
                    </>
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
                {form.state.values.token.isClanker ? (
                  <div className="flex rounded-base items-stretch shadow-small">
                    <div className="bg-black text-sm text-white px-6 h-10 flex items-center rounded-l-base">
                      $
                    </div>
                    <form.Field
                      name="token.symbol"
                      validators={{
                        onChange: ({ value }) =>
                          !value?.trim()
                            ? "Token symbol is required"
                            : undefined,
                      }}
                    >
                      {(field) => (
                        <>
                          <Input
                            maxLength={10}
                            className="flex-1 outline-none text-sm px-2.5 h-10 border-l-0 rounded-l-none focus-visible:ring-0 focus-visible:ring-offset-0"
                            id="symbol"
                            placeholder="BTC"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                          />
                          {field.state.meta.errors.length > 0 && (
                            <div className="text-red-500 text-xs mt-1">
                              {field.state.meta.errors[0]?.toString()}
                            </div>
                          )}
                        </>
                      )}
                    </form.Field>
                  </div>
                ) : (
                  <TokenSearch
                    onTokenSelect={(token) => {
                      form.setFieldValue("token.address", token.address);
                      form.setFieldValue("token.symbol", token.symbol);
                    }}
                  />
                )}
                <div className="text-xs text-gray-700 flex items-center gap-1 mt-1">
                  <div>
                    {reactiveIsClanker
                      ? "I already have a token."
                      : "I don't have a token."}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newIsClanker = !reactiveIsClanker;
                      form.setFieldValue("token.isClanker", newIsClanker);
                    }}
                    className="text-primary font-bold hover:underline cursor-pointer"
                  >
                    {reactiveIsClanker
                      ? "SEARCH for my token."
                      : "CREATE ONE for me."}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-2">
              <div className="flex flex-col gap-2">
                <label className="uppercase text-xs" htmlFor="channel-about">
                  About Channel
                </label>
                <form.Field
                  name="channelAbout"
                  validators={{
                    onChange: ({ value }) =>
                      !value?.trim()
                        ? "Channel description is required"
                        : undefined,
                  }}
                >
                  {(field) => (
                    <>
                      <Textarea
                        id="channel-about"
                        className="text-sm h-24"
                        placeholder="Write about your channel here"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <div className="text-red-500 text-xs mt-1">
                          {field.state.meta.errors[0]?.toString()}
                        </div>
                      )}
                    </>
                  )}
                </form.Field>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex flex-col gap-2 flex-1">
                <label className="uppercase text-xs" htmlFor="channel-handle">
                  Channel Handle
                </label>
                <div className="flex items-stretch rounded-base shadow-small">
                  <div className="bg-black text-sm text-white px-6 h-10 flex items-center rounded-l-base">
                    den.show/
                  </div>
                  <form.Field
                    name="channelHandle"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value?.trim()) return "Channel handle is required";
                        if (RESERVED_HANDLES.includes(value.toLowerCase())) {
                          return "This handle is reserved";
                        }
                        return undefined;
                      },
                    }}
                  >
                    {(field) => (
                      <Input
                        maxLength={30}
                        className="flex-1 outline-none text-sm px-2.5 h-10 border-l-0 rounded-l-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        type="text"
                        placeholder="your-channel-handle"
                        value={field.state.value}
                        onChange={(e) => {
                          const value = e.target.value.toLowerCase();
                          field.handleChange(value);
                        }}
                        onBlur={field.handleBlur}
                      />
                    )}
                  </form.Field>
                </div>
                <div className="text-xs text-gray-700">
                  {RESERVED_HANDLES.includes(
                    form.state.values.channelHandle.toLowerCase()
                  ) ? (
                    <span className="text-red-500">Invalid handle</span>
                  ) : isLoadingHandleAvailable ? (
                    <span className="invisible">
                      Checking if handle is available...
                    </span>
                  ) : !isLoadingHandleAvailable &&
                    isFetchedHandleAvailable &&
                    !isHandleAvailable ? (
                    <span className="text-red-500">
                      Handle is already taken
                    </span>
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
                      onValueChange={field.handleChange}
                    >
                      <SelectTrigger className="h-10 w-full shadow-small">
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

            <div className="flex items-center space-x-2 mt-3">
              <form.Field name="nsfw">
                {(field) => (
                  <Switch
                    id="18-plus"
                    checked={field.state.value}
                    onCheckedChange={field.handleChange}
                  />
                )}
              </form.Field>
              <Label htmlFor="18-plus" className="font-base text-sm">
                My channel caters to 18+ audience only
              </Label>
            </div>

            <div className="flex items-center space-x-2 mt-3">
              <form.Field
                name="tncAccepted"
                validators={{
                  onChange: ({ value }) =>
                    !value
                      ? "You must accept the terms and conditions"
                      : undefined,
                }}
              >
                {(field) => (
                  <>
                    <Switch
                      id="tnc"
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <div className="text-red-500 text-xs mt-1">
                        {field.state.meta.errors[0]?.toString()}
                      </div>
                    )}
                  </>
                )}
              </form.Field>
              <Label htmlFor="tnc" className="font-base text-sm">
                I've read the content & moderation Community Guidelines and
                agree to Den's T&C & Privacy Policy
              </Label>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                type="submit"
                className="w-36"
                disabled={
                  !isFormValid ||
                  isLoadingHandleAvailable ||
                  !isHandleAvailable ||
                  RESERVED_HANDLES.includes(
                    form.state.values.channelHandle.toLowerCase()
                  )
                }
              >
                {isCreatingChannel ? "Processing..." : "Next"}
              </Button>
            </div>
          </div>
        </form>
      )}

      {step === "tier" && (
        <div className="max-w-[580px] mx-auto">
          <FanPassModalContent
            channelProfileUrl={"/images/default-channel-logo.png"}
            channelName={form.state.values.channelName}
            channelHandle={form.state.values.channelHandle}
            creatorTokenSymbol={form.state.values.token.symbol}
            isCreatingChannel
          />
          <div className="mt-4 flex justify-end">
            <Button
              className="w-36"
              onClick={() => form.handleSubmit()}
              disabled={isCreatingChannel}
            >
              {isCreatingChannel ? "Processing..." : "Next"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
